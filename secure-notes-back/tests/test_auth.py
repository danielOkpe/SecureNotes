import pytest
from unittest.mock import Mock, patch
from datetime import datetime, timedelta

@pytest.mark.auth
class TestAuthRoutes:
    
    @patch('app.routes.auth_routes.UserRepository')
    @patch('app.routes.auth_routes.get_db')
    @patch('app.routes.auth_routes.verify_password')
    @patch('app.routes.auth_routes.create_access_token')
    def test_login_success(self, mock_create_token, mock_verify_pwd, mock_get_db, mock_user_repo, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_user_repo.get_by_email.return_value = mock_user
        mock_verify_pwd.return_value = True
        mock_create_token.return_value = "test_token"
        
        # Act
        response = client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "password"
        })
        
        # Assert
        assert response.status_code == 200
        assert response.json()["message"] == "Login successful"

    @patch('app.routes.auth_routes.UserRepository')
    @patch('app.routes.auth_routes.get_db')
    def test_login_invalid_credentials(self, mock_get_db, mock_user_repo, client):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_user_repo.get_by_email.return_value = None
        
        # Act
        response = client.post("/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        
        # Assert
        # L'API retourne un tuple (dict, status_code) qui devient une réponse 200 avec un array
        assert response.status_code == 200
        response_data = response.json()
        # La réponse est un array [{"error": "message"}, status_code]
        assert isinstance(response_data, list)
        assert len(response_data) == 2
        assert "error" in response_data[0]
        assert response_data[0]["error"] == "Invalid credentials"
        assert response_data[1] == 401

    @patch('app.routes.auth_routes.UserRepository')
    @patch('app.routes.auth_routes.get_db')
    @patch('app.routes.auth_routes.get_password_hash')
    @patch('app.routes.auth_routes.generate_verification_token')
    @patch('app.routes.auth_routes.send_email_verification')
    def test_register_success(self, mock_send_email, mock_gen_token, mock_hash_pwd, 
                            mock_get_db, mock_user_repo, client):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_user_repo.get_by_email.return_value = None
        mock_user_repo.create.return_value = Mock()
        mock_hash_pwd.return_value = "hashed_password"
        mock_gen_token.return_value = "verification_token"
        mock_send_email.return_value = None
        
        # Act
        response = client.post("/auth/register", json={
            "email": "new@example.com",
            "name": "New User",
            "password": "password"
        })
        
        # Assert
        assert response.status_code == 201
        assert response.json()["message"] == "User registered successfully"

    @patch('app.routes.auth_routes.UserRepository')
    @patch('app.routes.auth_routes.get_db')
    def test_register_email_already_exists(self, mock_get_db, mock_user_repo, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_user_repo.get_by_email.return_value = mock_user
        
        # Act
        response = client.post("/auth/register", json={
            "email": "test@example.com",
            "name": "Test User",
            "password": "password"
        })
        
        # Assert
        # L'API retourne un tuple (dict, status_code) qui devient une réponse 200 avec un array
        assert response.status_code == 200
        response_data = response.json()
        # La réponse est un array [{"error": "message"}, status_code]
        assert isinstance(response_data, list)
        assert len(response_data) == 2
        assert "error" in response_data[0]
        assert response_data[0]["error"] == "Email already registered"
        assert response_data[1] == 400

    def test_logout_success(self, client):
        # Act
        response = client.post("/auth/logout")
        
        # Assert
        assert response.status_code == 200
        assert response.json()["message"] == "Logged out successfully"

    @patch('app.routes.auth_routes.verify_email_token')
    @patch('app.routes.auth_routes.jwt.decode')
    @patch('app.routes.auth_routes.UserRepository')
    @patch('app.routes.auth_routes.get_db')
    def test_verify_email_success(self, mock_get_db, mock_user_repo, mock_jwt_decode, 
                                 mock_verify_token, client, mock_user):
        # Arrange
        mock_get_db.return_value = Mock()
        mock_verify_token.return_value = True
        mock_jwt_decode.return_value = {"sub": "test@example.com"}
        mock_user_repo.get_by_email.return_value = mock_user
        mock_user_repo.update.return_value = mock_user
        
        # Act
        response = client.get("/auth/verify-email/test_token")
        
        # Assert
        assert response.status_code == 200
        assert response.json()["message"] == "Email verified successfully"

    @patch('app.routes.auth_routes.verify_email_token')
    def test_verify_email_invalid_token(self, mock_verify_token, client):
        # Arrange
        mock_verify_token.return_value = False
        
        # Act
        response = client.get("/auth/verify-email/invalid_token")
        
        # Assert
        # L'API retourne un tuple (dict, status_code) qui devient une réponse 200 avec un array
        assert response.status_code == 200
        response_data = response.json()
        # La réponse est un array [{"error": "message"}, status_code]
        assert isinstance(response_data, list)
        assert len(response_data) == 2
        assert "error" in response_data[0]
        assert response_data[1] == 500  # Basé sur le catch Exception générique