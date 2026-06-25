import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import auth, users, products, orders, stores, appointments, reviews, messages, admin, services, notifications, newsletter
from app.db.database import engine, Base
from app.models import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PBL Microservice Platform")

uploads_dir = os.path.join(os.path.dirname(__file__), "..", "uploads")

# Mount static files
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

# CORS Configuration
origins = [
    "http://localhost:5173", # Vite default port
    "http://localhost:5174",
    "http://localhost:3000",
    "https://aiu-microstore.vercel.app",
    "https://www.aiu-microstore.vercel.app",
]

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