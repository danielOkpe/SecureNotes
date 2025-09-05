import pytest
from unittest.mock import Mock, patch

@pytest.mark.notes
class TestNotesRoutes:
    
    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.NoteRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_read_note_success(self, mock_get_db, mock_note_repo, mock_get_user, 
                              client, mock_user, mock_note):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_note_repo.get_by_id.return_value = mock_note
        
        # Act - Ajouter un cookie d'authentification simulé
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.get("/notes/1", cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 200
        assert response.json()["id"] == 1
        assert response.json()["title"] == "Test Note"

    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.NoteRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_read_note_not_found(self, mock_get_db, mock_note_repo, mock_get_user, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_note_repo.get_by_id.return_value = None
        
        # Act
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.get("/notes/999", cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 404

    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.UserRepository')
    @patch('app.routes.notes_routes.NoteRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_read_notes_by_user_success(self, mock_get_db, mock_note_repo, 
                                       mock_user_repo, mock_get_user, client, mock_user, mock_note):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_user_repo.get_by_id.return_value = mock_user
        mock_note_repo.get_by_user_id.return_value = [mock_note]
        
        # Act
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.get("/notes/user_id/1", cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 200
        assert len(response.json()) == 1
        assert response.json()[0]["id"] == 1

    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.UserRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_read_notes_by_user_not_found(self, mock_get_db, mock_user_repo, 
                                         mock_get_user, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_user_repo.get_by_id.return_value = None
        
        # Act
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.get("/notes/user_id/999", cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 404

    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.NoteRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_create_note_success(self, mock_get_db, mock_note_repo, mock_get_user, 
                                client, mock_user, mock_note):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_note_repo.create.return_value = mock_note
        
        # Act
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.post("/notes/", 
                                 json={
                                     "title": "Test Note",
                                     "content": "Test Content",
                                     "owner_id": 1
                                 },
                                 cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 201
        assert response.json()["title"] == "Test Note"

    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.NoteRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_update_note_success(self, mock_get_db, mock_note_repo, mock_get_user, 
                                client, mock_user, mock_note):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_note_repo.get_by_id.return_value = mock_note
        mock_note_repo.update.return_value = mock_note
        
        # Act
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.put("/notes/1", 
                                json={
                                    "title": "Updated Note",
                                    "content": "Updated Content",
                                    "owner_id": 1
                                },
                                cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 200
        assert "updated" in response.json()["message"]

    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.NoteRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_update_note_not_found(self, mock_get_db, mock_note_repo, mock_get_user, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_note_repo.get_by_id.return_value = None
        
        # Act
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.put("/notes/999", 
                                json={
                                    "title": "Updated Note",
                                    "content": "Updated Content",
                                    "owner_id": 1
                                },
                                cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 404

    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.NoteRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_delete_note_success(self, mock_get_db, mock_note_repo, mock_get_user, 
                                client, mock_user, mock_note):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_note_repo.get_by_id.return_value = mock_note
        mock_note_repo.delete.return_value = None
        
        # Act
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.delete("/notes/1", cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 200
        assert "deleted" in response.json()["message"]

    @patch('app.routes.notes_routes.get_current_user_from_access_cookie')
    @patch('app.routes.notes_routes.NoteRepository')
    @patch('app.routes.notes_routes.get_db')
    def test_delete_note_not_found(self, mock_get_db, mock_note_repo, mock_get_user, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_note_repo.get_by_id.return_value = None
        
        # Act
        with patch('app.middleware.get_current_user_from_access_cookie', return_value=mock_user):
            response = client.delete("/notes/999", cookies={"access_token": "fake_token"})
        
        # Assert
        assert response.status_code == 404