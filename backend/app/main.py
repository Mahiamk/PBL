import os
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parent.parent
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import auth, users, products, orders, stores, appointments, reviews, messages, admin, services, notifications, newsletter
from app.core.config import settings
from app.db.database import engine, Base
from app.models import models

# Create database tables safely
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Database initialization skipped on startup: {e}")

app = FastAPI(title="PBL Microservice Platform")

uploads_dir = settings.effective_upload_dir
try:
    os.makedirs(uploads_dir, exist_ok=True)
    if os.path.exists(uploads_dir):
        app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
except Exception as e:
    print(f"Warning: Uploads static mount skipped: {e}")

# CORS Configuration
origins = settings.CORS_ORIGINS_LIST

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
# Dashboard routes moved to /api/v1/users
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(orders.router, prefix="/api/orders", tags=["orders"])
app.include_router(stores.router, prefix="/api/stores", tags=["stores"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["appointments"])
app.include_router(reviews.router, prefix="/api/reviews", tags=["reviews"])
app.include_router(messages.router, prefix="/api/messages", tags=["messages"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
app.include_router(services.router, prefix="/api/services", tags=["services"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["notifications"])
app.include_router(newsletter.router, prefix="/api", tags=["newsletter"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the PBL Microservice Platform API"}