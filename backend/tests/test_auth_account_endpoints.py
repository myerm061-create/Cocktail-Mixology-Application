# from unittest.mock import patch

# import pytest
# import pytest_asyncio
# from httpx import ASGITransport, AsyncClient
# from sqlalchemy.orm import Session

# from app.core.db import SessionLocal
# from app.core.security import hash_password
# from app.main import app
# from app.models.user import User
# from app.services import token_service


# @pytest.fixture
# def db_session() -> Session:
#     """Provide a database session for tests."""
#     db = SessionLocal()
#     try:
#         yield db
#     finally:
#         db.rollback()
#         db.close()


# @pytest.fixture
# def test_user(db_session: Session) -> User:
#     """Create a test user in the database."""
#     # Clean up any existing test user first
#     existing = (
#         db_session.query(User).filter(User.email == "test_account@example.com").first()
#     )
#     if existing:
#         db_session.delete(existing)
#         db_session.commit()

#     user = User(
#         email="test_account@example.com",
#         hashed_password=hash_password("CurrentPass123!"),
#     )
#     db_session.add(user)
#     db_session.commit()
#     db_session.refresh(user)
#     yield user

#     # Try to cleanup after test (if user still exists)
#     existing = db_session.query(User).filter(User.id == user.id).first()
#     if existing:
#         db_session.delete(existing)
#         db_session.commit()


# @pytest_asyncio.fixture
# async def authenticated_client(test_user: User) -> AsyncClient:
#     """Create an authenticated async client with test user's token."""
#     transport = ASGITransport(app=app)
#     async with AsyncClient(transport=transport, base_url="http://test") as client:
#         login_resp = await client.post(
#             "/api/v1/auth/login",
#             json={"email": test_user.email, "password": "CurrentPass123!"},
#         )
#         assert login_resp.status_code == 200
#         tokens = login_resp.json()
#         access_token = tokens["access_token"]
#         client.headers.update({"Authorization": f"Bearer {access_token}"})
#         yield client


# # ===== Password Change with OTP Tests =====


# @pytest.mark.asyncio
# @patch("app.services.mail_services.send_password_changed_notice")
# async def test_change_password_verified_success(
#     mock_email, authenticated_client: AsyncClient, db_session: Session, test_user: User
# ):
#     """Test successful password change with OTP verification."""
#     mock_email.return_value = None

#     # Create verify OTP
#     otp_code, _ = token_service.create_otp(
#         db_session, email=test_user.email, purpose="verify_otp", ttl_minutes=10
#     )

#     # Change password with OTP
#     resp = await authenticated_client.post(
#         "/api/v1/auth/password/change",
#         json={
#             "email": test_user.email,
#             "code": otp_code,
#             "new_password": "NewSecurePass123!",
#         },
#     )
#     assert resp.status_code == 200
#     data = resp.json()
#     assert data["ok"] is True
#     assert "success" in data["message"].lower()

#     # Verify email notification was sent
#     mock_email.assert_called_once_with(test_user.email)


# @pytest.mark.asyncio
# async def test_change_password_verified_wrong_email(
#     authenticated_client: AsyncClient, db_session: Session, test_user: User
# ):
#     """Test password change with mismatched email (should fail)."""
#     # Create OTP for different email
#     otp_code, _ = token_service.create_otp(
#         db_session, email="other@example.com", purpose="verify_otp", ttl_minutes=10
#     )

#     # Try to change password with wrong email
#     resp = await authenticated_client.post(
#         "/api/v1/auth/password/change",
#         json={
#             "email": "other@example.com",
#             "code": otp_code,
#             "new_password": "NewSecurePass123!",
#         },
#     )
#     assert resp.status_code == 403
#     assert "does not match" in resp.json()["detail"].lower()


# @pytest.mark.asyncio
# async def test_change_password_verified_invalid_otp(
#     authenticated_client: AsyncClient, test_user: User
# ):
#     """Test password change with invalid OTP."""
#     resp = await authenticated_client.post(
#         "/api/v1/auth/password/change",
#         json={
#             "email": test_user.email,
#             "code": "999999",
#             "new_password": "NewSecurePass123!",
#         },
#     )
#     assert resp.status_code == 400
#     assert "invalid" in resp.json()["detail"].lower()


# @pytest.mark.asyncio
# async def test_change_password_verified_weak_password(
#     authenticated_client: AsyncClient, db_session: Session, test_user: User
# ):
#     """Test password change with weak new password."""
#     # Create verify OTP
#     otp_code, _ = token_service.create_otp(
#         db_session, email=test_user.email, purpose="verify_otp", ttl_minutes=10
#     )

#     resp = await authenticated_client.post(
#         "/api/v1/auth/password/change",
#         json={
#             "email": test_user.email,
#             "code": otp_code,
#             "new_password": "weak",
#         },
#     )
#     assert resp.status_code == 422  # Validation error


# # ===== Password Change with Current Password Tests =====


# @pytest.mark.asyncio
# @patch("app.services.mail_services.send_password_changed_notice")
# async def test_change_password_with_current_success(
#     mock_email, authenticated_client: AsyncClient, test_user: User
# ):
#     """Test successful password change using current password."""
#     mock_email.return_value = None

#     resp = await authenticated_client.post(
#         "/api/v1/auth/password/change-with-current",
#         json={
#             "current_password": "CurrentPass123!",
#             "new_password": "NewSecurePass123!",
#         },
#     )
#     assert resp.status_code == 200
#     data = resp.json()
#     assert data["ok"] is True
#     assert "success" in data["message"].lower()

#     # Verify email notification was sent
#     mock_email.assert_called_once_with(test_user.email)


# @pytest.mark.asyncio
# async def test_change_password_with_current_wrong_password(
#     authenticated_client: AsyncClient, test_user: User
# ):
#     """Test password change with incorrect current password."""
#     resp = await authenticated_client.post(
#         "/api/v1/auth/password/change-with-current",
#         json={
#             "current_password": "WrongPassword123!",
#             "new_password": "NewSecurePass123!",
#         },
#     )
#     assert resp.status_code == 401
#     assert "incorrect" in resp.json()["detail"].lower()


# @pytest.mark.asyncio
# async def test_change_password_with_current_weak_new(
#     authenticated_client: AsyncClient, test_user: User
# ):
#     """Test password change with weak new password."""
#     resp = await authenticated_client.post(
#         "/api/v1/auth/password/change-with-current",
#         json={
#             "current_password": "CurrentPass123!",
#             "new_password": "weak",
#         },
#     )
#     assert resp.status_code == 422  # Validation error


# # ===== Account Deletion Tests =====


# @pytest.mark.asyncio
# @patch("app.services.mail_services.send_account_deleted_notice")
# async def test_delete_account_success(
#     mock_email, authenticated_client: AsyncClient, db_session: Session, test_user: User
# ):
#     """Test successful account deletion with OTP verification."""
#     mock_email.return_value = None

#     # Create delete OTP
#     otp_code, _ = token_service.create_otp(
#         db_session, email=test_user.email, purpose="delete_otp", ttl_minutes=10
#     )

#     # Delete account
#     resp = await authenticated_client.delete(
#         "/api/v1/auth/account",
#         json={
#             "email": test_user.email,
#             "code": otp_code,
#         },
#     )
#     assert resp.status_code == 200
#     data = resp.json()
#     assert data["ok"] is True
#     assert "deleted" in data["message"].lower()

#     # Verify email notification was sent
#     mock_email.assert_called_once_with(test_user.email)

#     # Verify user was actually deleted
#     deleted_user = db_session.query(User).filter(User.id == test_user.id).first()
#     assert deleted_user is None


# @pytest.mark.asyncio
# async def test_delete_account_wrong_email(
#     authenticated_client: AsyncClient, db_session: Session, test_user: User
# ):
#     """Test account deletion with mismatched email (should fail)."""
#     # Create OTP for different email
#     otp_code, _ = token_service.create_otp(
#         db_session, email="other@example.com", purpose="delete_otp", ttl_minutes=10
#     )

#     # Try to delete account with wrong email
#     resp = await authenticated_client.delete(
#         "/api/v1/auth/account",
#         json={
#             "email": "other@example.com",
#             "code": otp_code,
#         },
#     )
#     assert resp.status_code == 403
#     assert "does not match" in resp.json()["detail"].lower()

#     # Verify user still exists
#     existing_user = db_session.query(User).filter(User.id == test_user.id).first()
#     assert existing_user is not None


# @pytest.mark.asyncio
# async def test_delete_account_invalid_otp(
#     authenticated_client: AsyncClient, db_session: Session, test_user: User
# ):
#     """Test account deletion with invalid OTP."""
#     resp = await authenticated_client.delete(
#         "/api/v1/auth/account",
#         json={
#             "email": test_user.email,
#             "code": "999999",
#         },
#     )
#     assert resp.status_code == 400
#     assert "invalid" in resp.json()["detail"].lower()

#     # Verify user still exists
#     existing_user = db_session.query(User).filter(User.id == test_user.id).first()
#     assert existing_user is not None


# @pytest.mark.asyncio
# async def test_delete_account_requires_authentication(
#     db_session: Session, test_user: User
# ):
#     """Test that account deletion requires authentication."""
#     transport = ASGITransport(app=app)
#     async with AsyncClient(transport=transport, base_url="http://test") as client:
#         # Create delete OTP
#         otp_code, _ = token_service.create_otp(
#             db_session, email=test_user.email, purpose="delete_otp", ttl_minutes=10
#         )

#         # Try to delete without authentication
#         resp = await client.delete(
#             "/api/v1/auth/account",
#             json={
#                 "email": test_user.email,
#                 "code": otp_code,
#             },
#         )
#         assert resp.status_code == 401  # Unauthorized


# # ===== OAuth User Tests =====


# @pytest.mark.asyncio
# async def test_change_password_oauth_user_fails(db_session: Session):
#     """Test that OAuth users cannot change password with current password method."""
#     # Create OAuth user (no password)
#     oauth_user = User(
#         email="oauth_user@example.com",
#         provider="google",
#         provider_id="google_123",
#         hashed_password=None,
#     )
#     db_session.add(oauth_user)
#     db_session.commit()
#     db_session.refresh(oauth_user)

#     try:
#         # Login would normally happen via OAuth, but for testing we'll create a token manually
#         from datetime import timedelta

#         from app.core.security import create_access_token

#         access_token = create_access_token(
#             data={"sub": str(oauth_user.id), "type": "access"},
#             expires_delta=timedelta(minutes=15),
#         )

#         transport = ASGITransport(app=app)
#         async with AsyncClient(transport=transport, base_url="http://test") as client:
#             client.headers.update({"Authorization": f"Bearer {access_token}"})

#             resp = await client.post(
#                 "/api/v1/auth/password/change-with-current",
#                 json={
#                     "current_password": "anything",
#                     "new_password": "NewPass123!",
#                 },
#             )
#             assert resp.status_code == 400
#             assert "oauth" in resp.json()["detail"].lower()

#     finally:
#         # Cleanup
#         db_session.delete(oauth_user)
#         db_session.commit()


# # ===== Integration Tests =====


# @pytest.mark.asyncio
# @patch("app.services.mail_services.send_password_changed_notice")
# async def test_full_password_change_flow(mock_email, db_session: Session):
#     """Test complete flow: register -> login -> change password -> login with new password."""
#     mock_email.return_value = None

#     transport = ASGITransport(app=app)
#     async with AsyncClient(transport=transport, base_url="http://test") as client:
#         # Step 1: Register new user
#         register_resp = await client.post(
#             "/api/v1/auth/register",
#             json={
#                 "email": "flow_test@example.com",
#                 "password": "InitialPass123!",
#             },
#         )
#         assert register_resp.status_code == 201

#         # Step 2: Login
#         login_resp = await client.post(
#             "/api/v1/auth/login",
#             json={
#                 "email": "flow_test@example.com",
#                 "password": "InitialPass123!",
#             },
#         )
#         assert login_resp.status_code == 200
#         tokens = login_resp.json()

#         # Step 3: Change password with current password
#         client.headers.update({"Authorization": f"Bearer {tokens['access_token']}"})
#         change_resp = await client.post(
#             "/api/v1/auth/password/change-with-current",
#             json={
#                 "current_password": "InitialPass123!",
#                 "new_password": "UpdatedPass123!",
#             },
#         )
#         assert change_resp.status_code == 200

#         # Step 4: Login with new password
#         new_login_resp = await client.post(
#             "/api/v1/auth/login",
#             json={
#                 "email": "flow_test@example.com",
#                 "password": "UpdatedPass123!",
#             },
#         )
#         assert new_login_resp.status_code == 200

#         # Step 5: Old password should fail
#         old_login_resp = await client.post(
#             "/api/v1/auth/login",
#             json={
#                 "email": "flow_test@example.com",
#                 "password": "InitialPass123!",
#             },
#         )
#         assert old_login_resp.status_code == 401

#         # Cleanup
#         user = (
#             db_session.query(User).filter(User.email == "flow_test@example.com").first()
#         )
#         if user:
#             db_session.delete(user)
#             db_session.commit()
