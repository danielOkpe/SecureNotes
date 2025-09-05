import pytest
from unittest.mock import Mock, patch

@pytest.mark.users
class TestUsersRoutes:
    
    @patch('app.routes.users_routes.get_current_user_from_access_cookie')
    def test_get_authenticated_success(self, mock_get_user, client, mock_user):
        # Arrange
        mock_get_user.return_value = mock_user
        
        # Act
        response = client.get("/users/me")
        
        # Assert
        assert response.status_code == 200
        assert response.json()["isAuthenticated"] == True
        assert response.json()["user"]["id"] == 1


    @patch('app.routes.users_routes.get_current_user_from_access_cookie')
    @patch('app.routes.users_routes.UserRepository')
    @patch('app.routes.users_routes.get_db')
    def test_update_user_success(self, mock_get_db, mock_user_repo, mock_get_user, 
                                client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_user_repo.update.return_value = mock_user
        
        # Act
        response = client.put("/users/1", json={
            "email": "updated@example.com",
            "name": "Updated User",
            "hashed_password": "new_hash"
        })
        
        # Assert
        assert response.status_code == 200
        assert "updated" in response.json()["message"]

    @patch('app.routes.users_routes.get_current_user_from_access_cookie')
    @patch('app.routes.users_routes.UserRepository')
    @patch('app.routes.users_routes.get_db')
    def test_update_user_exception(self, mock_get_db, mock_user_repo, mock_get_user, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_user_repo.update.side_effect = Exception("Database error")
        
        # Act
        response = client.put("/users/1", json={
            "email": "updated@example.com",
            "name": "Updated User", 
            "hashed_password": "new_hash"
        })
        
        # Assert
        assert response.status_code == 500

    @patch('app.routes.users_routes.get_current_user_from_access_cookie')
    @patch('app.routes.users_routes.UserRepository')
    @patch('app.routes.users_routes.get_db')
    def test_delete_user_success(self, mock_get_db, mock_user_repo, mock_get_user, 
                                client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_user_repo.get_by_id.return_value = mock_user
        mock_user_repo.delete.return_value = None
        
        # Act
        response = client.delete("/users/1")
        
        # Assert
        assert response.status_code == 200
        assert "deleted" in response.json()["message"]

    @patch('app.routes.users_routes.get_current_user_from_access_cookie')
    @patch('app.routes.users_routes.UserRepository')
    @patch('app.routes.users_routes.get_db')
    def test_delete_user_not_found(self, mock_get_db, mock_user_repo, mock_get_user, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_user_repo.get_by_id.return_value = None
        
        # Act
        response = client.delete("/users/999")
        
        # Assert
        assert response.status_code == 404

    @patch('app.routes.users_routes.get_current_user_from_access_cookie')
    @patch('app.routes.users_routes.UserRepository')
    @patch('app.routes.users_routes.get_db')
    def test_delete_user_exception(self, mock_get_db, mock_user_repo, mock_get_user, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_user_repo.get_by_id.return_value = mock_user
        mock_user_repo.delete.side_effect = Exception("Database error")
        
        # Act
        response = client.delete("/users/1")
        
        # Assert
        assert response.status_code == 500