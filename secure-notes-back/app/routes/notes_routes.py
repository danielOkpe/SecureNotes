from fastapi import APIRouter, HTTPException, Depends
from app.models import User, Note
from app.repositories import UserRepository, NoteRepository
from app.constants import get_db
from app.constants import SKIP, LIMIT
from pydantic import BaseModel
from app.middleware import get_current_user_from_access_cookie


router = APIRouter(
    prefix="/notes",
    tags=["notes"],
)

class NoteCreate(BaseModel):
    title: str
    content: str
    owner_id: int


@router.get("/{note_id}")
async def read_note(note_id: int, current_user: User = Depends(get_current_user_from_access_cookie)):
    try:
        note = NoteRepository.get_by_id(get_db(), note_id=note_id)
        if not note:
            return {"message": "Note not found"}, 404
        return note.to_dict(), 200
    except Exception as e:
        return {"error": str(e)}, 500

@router.get("/user/{user_id}")
async def read_notes_by_user(user_id: int, current_user: User = Depends(get_current_user_from_access_cookie)):
    try:
        user = UserRepository.get_by_id(get_db(), user_id=user_id)
        if not user:
            return {"message": "User not found"}, 404
        notes = NoteRepository.get_by_user_id(get_db(), user_id=user_id, skip=SKIP, limit=LIMIT)
        if not notes:
            return {"message": "No notes found for this user"}, 404
        return [note.to_dict() for note in notes], 200
    except Exception as e:
        return {"error": str(e)}, 500

@router.post("/")
async def create_note(note_data: NoteCreate, current_user: User = Depends(get_current_user_from_access_cookie)):
    try:
        note = NoteRepository.create(get_db(), note=Note(
            title=note_data.title,
            content=note_data.content,
            owner_id=note_data.owner_id
        ))
        return note.to_dict(), 201
    except Exception as e:
        return {"error": str(e)}, 500

@router.put("/{note_id}")
async def update_note(
    note_id: int,
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user_from_access_cookie)
    ):
    try:
        note = NoteRepository.get_by_id(get_db(), note_id=note_id)
        if not note:
            return {"message": "Note not found"}, 404
        
        update_note = Note(
            title=note_data.title,
            content=note_data.content, 
        )

        updated_note= NoteRepository.update(get_db(), note=update_note)
        return {"message": f"Note {note_id} updated", "note" : updated_note.to_dict()}, 200
    except Exception as e:
        return {"error": str(e)}, 500

@router.delete("/{note_id}")
async def delete_note(note_id: int, current_user: User = Depends(get_current_user_from_access_cookie)):
    try:
        note = NoteRepository.get_by_id(get_db(), note_id=note_id)
        if not note:
            return {"message": "Note not found"}, 404
        NoteRepository.delete(get_db(), note=note)
    except Exception as e:
        return {"error": str(e)}, 500
    return {"message": f"Note {note_id} deleted"}