from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.models import User, Note
from app.repositories import UserRepository, NoteRepository
from app.constants import get_db
from app.constants import SKIP, LIMIT
from pydantic import BaseModel
from app.middleware import get_current_user_from_access_cookie


router = APIRouter(
    prefix="/notes",
    tags=["notes"],
    dependencies=[Depends(get_current_user_from_access_cookie)]
)

class NoteCreate(BaseModel):
    title: str
    content: str
    owner_id: int


@router.get("/{note_id}")  # ou "/note_id/{note_id}" si vous voulez garder ce format
async def read_note(
    note_id: int, 
    current_user: User = Depends(get_current_user_from_access_cookie), 
    db = Depends(get_db)
):
    try:
        note = NoteRepository.get_by_id(db=db, note_id=note_id)
        if not note:
            raise HTTPException(status_code=404, detail="Note not found")
        
        # Vérifier que l'utilisateur a le droit d'accéder à cette note
        if note.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return note.to_dict()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/user_id/{user_id}")
async def read_notes_by_user(user_id: int, current_user: User = Depends(get_current_user_from_access_cookie), db = Depends(get_db)):
    try:
        user = UserRepository.get_by_id(db=db, user_id=user_id)
        if not user:
            return JSONResponse(content={"message": "User not found"}, status_code=404)
        notes = NoteRepository.get_by_user_id(db=db, user_id=user_id, skip=SKIP, limit=LIMIT)

        for note in notes :
            if note.owner_id != current_user.id :
                raise HTTPException(status_code=403, detail="Access denied")

        return JSONResponse(content=[note.to_dict() for note in notes], status_code=200)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.post("/")
async def create_note(note_data: NoteCreate, current_user: User = Depends(get_current_user_from_access_cookie), db = Depends(get_db)):
    try:
        note = NoteRepository.create(db=db, note=Note(
            title=note_data.title,
            content=note_data.content,
            owner_id=note_data.owner_id
        ))
        return JSONResponse(content=note.to_dict(), status_code=201)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.put("/{note_id}")
async def update_note(
    note_id: int,
    note_data: NoteCreate,
    current_user: User = Depends(get_current_user_from_access_cookie),
    db = Depends(get_db)
    ):
    try:
        note = NoteRepository.get_by_id(db=db, note_id=note_id)
        if not note:
            return JSONResponse(content={"message": "Note not found"}, status_code=404)
        
        if note.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        update_note = Note(
            id= note_id,
            title=note_data.title,
            content=note_data.content,
            owner_id=note_data.owner_id 
        )

        updated_note= NoteRepository.update(db=db, note=update_note)
        return JSONResponse(content={"message": f"Note {note_id} updated", "note" : updated_note.to_dict()}, status_code=200)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@router.delete("/{note_id}")
async def delete_note(note_id: int, current_user: User = Depends(get_current_user_from_access_cookie), db = Depends(get_db)):
    try:
        note = NoteRepository.get_by_id(db=db, note_id=note_id)
        if not note:
            return JSONResponse(content={"message": "Note not found"}, status_code=404)
        
        if note.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
        NoteRepository.delete(db=db, note=note)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
    return JSONResponse(content={"message": f"Note {note_id} deleted"}, status_code=200)