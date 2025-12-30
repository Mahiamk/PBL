from fastapi import APIRouter
from app.api.v1.endpoints import users, auth

api_router = APIRouter()

# This makes the login endpoint visible
api_router.include_router(auth.router, tags=["login"])

# This makes all user routes available at /api/v1/users
api_router.include_router(users.router, prefix="/users", tags=["users"])