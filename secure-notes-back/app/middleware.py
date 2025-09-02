from fastapi import Request, HTTPException
from app.repositories import UserRepository
from app.constants import get_db
from app.routes.auth_routes import verify_token
from .models import User

def get_current_user_from_access_cookie(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user_id = verify_token(token)
    user : User = UserRepository.get_by_id(get_db(), user_id=user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user