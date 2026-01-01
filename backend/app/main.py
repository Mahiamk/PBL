from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AIU Campus Microstore API")

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