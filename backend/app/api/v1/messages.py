from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query, File, UploadFile
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
import json
from datetime import datetime
from jose import JWTError, jwt
import shutil
from pathlib import Path
import uuid

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.schemas import auth as auth_schemas
from app.api.deps import get_current_user
from app.core.config import settings

router = APIRouter()
UPLOAD_DIR = Path("uploads/chat")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# --- WebSocket Manager ---
@router.post("/upload", response_model=Dict[str, str])
async def upload_attachment(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user)
):
    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / file_name
    
    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return the relative URL that the frontend can use
    # Assuming the static mount in main.py points to uploads/
    return {"url": f"/uploads/chat/{file_name}", "filename": file.filename}

class ConnectionManager:
    def __init__(self):
        # Map user_id to a list of active websockets (support multiple devices/tabs)
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            # Iterate over a copy of the list to handle disconnections safely during iteration
            for connection in self.active_connections[user_id][:]:
                try:
                    await connection.send_text(json.dumps(message))
                except RuntimeError:
                    # Connection might be closed already
                    pass

manager = ConnectionManager()

# --- Endpoints ---

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    db: Session = Depends(get_db)
):
    # Authenticate via Query Param
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    user = None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        
        user = db.query(models.User).filter((models.User.email == username) | (models.User.first_name == username)).first()
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # Connection Accepted
    await manager.connect(websocket, user.id)
    
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message_data = json.loads(data)
                
                # Expecting: {"receiver_id": 123, "content": "Hello", "attachment_url": "...", "message_type": "text|image|file|audio", "reply_to_id": 456}
                receiver_id = message_data.get("receiver_id")
                content = message_data.get("content")
                attachment_url = message_data.get("attachment_url")
                message_type = message_data.get("message_type", "text")
                reply_to_id = message_data.get("reply_to_id")

                if receiver_id and (content or attachment_url):
                    # 1. Save to Database
                    new_message = models.Message(
                        sender_id=user.id,
                        receiver_id=receiver_id,
                        content=content,
                        attachment_url=attachment_url,
                        message_type=message_type,
                        reply_to_id=reply_to_id,
                        # timestamp is auto-set by DB default, but good to set explicit for immediate return
                        timestamp=datetime.now()
                    )
                    db.add(new_message)
                    db.commit()
                    db.refresh(new_message)
                    
                     # 1.5 Create Notification for Receiver
                    try:
                        notification = models.Notification(
                            user_id=receiver_id,
                            title="New Message",
                            message=f"You received a message from {user.full_name or user.email}",
                            type="message",
                            related_id=user.id,
                            is_read=False,
                            created_at=datetime.now()
                        )
                        db.add(notification)
                        db.commit()
                    except Exception as notif_error:
                        print(f"Failed to create notification: {notif_error}")
                        # Don't fail the message send if notification fails

                    # 2. Prepare Payload
                    response_payload = {
                        "attachment_url": attachment_url,
                        "message_type": message_type,
                        "reply_to_id": reply_to_id,
                        "id": new_message.id,
                        "sender_id": user.id,
                        "receiver_id": receiver_id,
                        "content": content,
                        "timestamp": new_message.timestamp.isoformat(),
                        "is_read": False
                    }
                    
                    # 3. Send to Receiver (if online)
                    await manager.send_personal_message(response_payload, int(receiver_id))
                    
                    # 4. Echo back to Sender (so they see their own message confirmed/synced)
                    await manager.send_personal_message(response_payload, user.id)
                    
            except json.JSONDecodeError:
                pass
            except Exception as e:
                print(f"Error processing message: {e}")
                db.rollback()
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user.id)
    except Exception as e:
        manager.disconnect(websocket, user.id)

@router.get("/conversations", response_model=List[auth_schemas.UserResponse])
def get_conversations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get list of users (vendors or customers) the current user has chatted with.
    """
    # Find distinct potential chat partners
    # Retrieve messages where current user is sender or receiver
    sent_subquery = db.query(models.Message.receiver_id).filter(models.Message.sender_id == current_user.id).subquery()
    received_subquery = db.query(models.Message.sender_id).filter(models.Message.receiver_id == current_user.id).subquery()

    # Union of IDs
    partner_ids = db.query(models.User).filter(
        (models.User.id.in_(sent_subquery)) | 
        (models.User.id.in_(received_subquery))
    ).all()
    
    return partner_ids

@router.get("/{user_id}", response_model=List[schemas.Message])
def get_chat_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get chat history between current user and specific user_id
    """
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user.id) & (models.Message.receiver_id == user_id)) |
        ((models.Message.sender_id == user_id) & (models.Message.receiver_id == current_user.id))
    ).order_by(models.Message.timestamp.asc()).all()
    
    return messages

@router.put("/read/{sender_id}")
async def mark_messages_read(
    sender_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Mark all messages from sender_id to current_user as read
    db.query(models.Message).filter(
        models.Message.sender_id == sender_id,
        models.Message.receiver_id == current_user.id,
        models.Message.is_read == False
    ).update({"is_read": True})
    db.commit()

    # Notify the sender (sender_id) that current_user has read their messages
    notification = {
        "type": "read_receipt",
        "reader_id": current_user.id,
        "timestamp": datetime.now().isoformat()
    }
    await manager.send_personal_message(notification, sender_id)
    
    return {"status": "ok"}

@router.post("/", response_model=schemas.Message)
async def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Verify receiver exists
    receiver = db.query(models.User).filter(models.User.id == message.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")
        
    new_message = models.Message(
        sender_id=current_user.id,
        receiver_id=message.receiver_id,
        content=message.content
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)

    # Broadcast via WebSocket
    response_payload = {
        "id": new_message.id,
        "sender_id": current_user.id,
        "receiver_id": message.receiver_id,
        "content": message.content,
        "timestamp": new_message.timestamp.isoformat(),
        "is_read": False
    }
    await manager.send_personal_message(response_payload, message.receiver_id)
    
    return new_message

@router.get("/", response_model=List[schemas.Message])
def get_messages(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Get messages where user is sender OR receiver
    messages = db.query(models.Message).filter(
        (models.Message.sender_id == current_user.id) | 
        (models.Message.receiver_id == current_user.id)
    ).order_by(models.Message.timestamp.desc()).all()
    return messages