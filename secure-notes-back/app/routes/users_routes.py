from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.constants import get_db
from app.models import User
from app.repositories import UserRepository
from pydantic import BaseModel
from app.middleware import get_current_user_from_access_cookie

router = APIRouter(
    prefix="/users",
    tags=["users"]
)

class UserCreate(BaseModel):
    email: str
    name: str
    hashed_password: str

@router.get("/me")
async def get_authenticated(current_user=Depends(get_current_user_from_access_cookie)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    user_data = current_user.to_dict() if hasattr(current_user, "to_dict") else current_user
    return JSONResponse(
        content={"isAuthenticated": True, "user": user_data},
        status_code=200
    )

@router.put("/{user_id}")
async def update_user(
    user_id: int,
    user_data: UserCreate,
    current_user=Depends(get_current_user_from_access_cookie),
    db=Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        new_user = User(
            id=user_id,
            email=user_data.email,
            name=user_data.name,
            hashed_password=user_data.hashed_password
        )
        updated_user = UserRepository.update(db=db, user=new_user)
        user_data = updated_user.to_dict() if hasattr(updated_user, "to_dict") else updated_user
        return JSONResponse(
            content={"message": f"User {user_id} updated", "user": user_data},
            status_code=200
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    current_user=Depends(get_current_user_from_access_cookie),
    db=Depends(get_db)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        user = UserRepository.get_by_id(db=db, user_id=user_id)
        if not user:
            return JSONResponse(content={"message": "User not found"}, status_code=404)

        UserRepository.delete(db=db, user=user)
        return JSONResponse(content={"message": f"User {user_id} deleted"}, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
