from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

#for local testing only
from app.db.base import Base  # Import your combined models
from app.db.session import engine

# This line creates the tables in test.db if they don't exist
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AIU Campus Microstore API")

from fastapi.security import OAuth2PasswordBearer
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"/api/v1/login/access-token"
)

# Include the collector router
app.include_router(api_router, prefix="/api/v1")

# Allow Frontend to talk to Backend
origins = [
            "http://localhost:5173",
            "http://localhost:3000"
            ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to AIU Microstore API", "status": "running"}