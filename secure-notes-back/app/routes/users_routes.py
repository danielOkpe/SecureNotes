from fastapi import APIRouter, HTTPException, Depends
from app.constants import get_db
from app.models import User
from app.repositories import UserRepository
from app.constants import SKIP, LIMIT   
from pydantic import BaseModel
from app.middleware import get_current_user_from_access_cookie


router = APIRouter(
    prefix="/users",
    tags=["users"],
)

class UserCreate(BaseModel):
    email: str
    name: str
    hashed_password: str


@router.get("/me")
async def get_authenticated(current_user = Depends(get_current_user_from_access_cookie)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return {"isAuthenticated": True, "user": current_user.to_dict()}, 200
    
@router.get("/id/{user_id}")
async def get_user(user_id: int, current_user = Depends(get_current_user_from_access_cookie)):
    try:
        user = UserRepository.get_by_id(get_db(), user_id=user_id)
        if not user:
            return {"message": "User not found"}, 404
        return user.as_dict(), 200
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

@router.put("/{user_id}")
async def update_user(
        user_id: int,
        user_data: UserCreate,
        current_user = Depends(get_current_user_from_access_cookie),
        db = Depends(get_db)
    ):
    try:
        user = UserRepository.get_by_id(get_db(), user_id=user_id)
        if not user:
            return {"message": "User not found"}, 404
        new_user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=user_data.hashed_password
        )

        updated_user = UserRepository.update(db=db,user=new_user)
        return {"message": f"User {user_id} updated", "user" : updated_user.to_dict()}, 200
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
async def delete_user(user_id: int, current_user = Depends(get_current_user_from_access_cookie)):
    try:
        user = UserRepository.get_by_id(get_db(), user_id=user_id)
        if not user:
            return {"message": "User not found"}, 404
        UserRepository.delete(get_db(), user=user)
        return {"message": f"User {user_id} deleted"}, 200
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))