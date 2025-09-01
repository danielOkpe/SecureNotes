from typing import Optional, List
from sqlalchemy.orm import Session
from .models import User, Note


class UserRepository:

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_all(db: Session, skip: int, limit: int) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update(db: Session, user: User) -> User:
        db.merge(user)
        db.commit()
        return user

    @staticmethod
    def delete(db: Session, user: User) -> None:
        db.delete(user)
        db.commit()

class NoteRepository:

    @staticmethod
    def get_by_id(db: Session, note_id: int) -> Optional[Note]:
        return db.query(Note).filter(Note.id == note_id).first()

    @staticmethod
    def get_by_user_id(db: Session, user_id: int, skip: int, limit: int) -> List[Note]:
        return db.query(Note).filter(Note.owner_id == user_id).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, note: Note) -> Note:
        db.add(note)
        db.commit()
        db.refresh(note)
        return note

    @staticmethod
    def update(db: Session, note: Note) -> Note:
        db.merge(note)
        db.commit()
        return note

    @staticmethod
    def delete(db: Session, note: Note) -> None:
        db.delete(note)
        db.commit()