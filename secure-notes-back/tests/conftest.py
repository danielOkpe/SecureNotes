import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest.mock import Mock, MagicMock
from app.routes.auth_routes import router as auth_router
from app.routes.notes_routes import router as notes_router
from app.routes.users_routes import router as users_router
from app.models import User, Note
import os

os.environ["TESTING"] = "1"


# Configuration de l'application de test
@pytest.fixture(scope="session")
def app():
    test_app = FastAPI()
    test_app.include_router(auth_router)
    test_app.include_router(notes_router)
    test_app.include_router(users_router)
    return test_app

@pytest.fixture(scope="session")
def client(app):
    return TestClient(app)

@pytest.fixture
def mock_db():
    return Mock()

@pytest.fixture
def mock_user():
    user = Mock(spec=User)
    user.id = 1
    user.email = "test@example.com"
    user.name = "Test User"
    user.hashed_password = "$2b$12$test_hash"
    user.is_email_verified = True
    user.to_dict.return_value = {
        "id": 1,
        "email": "test@example.com", 
        "name": "Test User",
        "is_email_verified": True
    }
    return user

@pytest.fixture
def mock_note():
    note = Mock(spec=Note)
    note.id = 1
    note.title = "Test Note"
    note.content = "Test Content"
    note.owner_id = 1
    note.to_dict.return_value = {
        "id": 1,
        "title": "Test Note",
        "content": "Test Content", 
        "owner_id": 1
    }
    return note