from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

app = FastAPI(title="AIU Campus Microstore API")

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