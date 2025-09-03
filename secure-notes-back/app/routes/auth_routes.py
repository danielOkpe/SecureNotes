from fastapi import APIRouter, Response, Request, HTTPException, Depends
from app.constants import get_db, SMTP_SERVER, SMTP_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD, BASE_URL
from app.models import User
from app.repositories import UserRepository
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import uuid as uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

class LoginDetails(BaseModel):
    email: str
    password: str

class RegisterDetails(BaseModel):
    email: str
    name: str
    password: str

def create_access_token(data: dict, expires_delta: datetime):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, os.getenv("SECRET_KEY"), algorithm="HS256")
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def verify_token(token: str):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return int(user_id)
    except JWTError:
        raise credentials_exception
    
async def send_email_verification(email: str, subject: str, body: str):

    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
        server.sendmail(EMAIL_ADDRESS, email, msg.as_string())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

def generate_verification_token(email: str):
    expire = datetime.utcnow() + timedelta(hours=24)
    try:
        token = jwt.encode(
            {"sub": email, "exp": expire},  os.getenv("SECRET_KEY"), algorithm="HS256"
            )
        return token
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate token: {str(e)}")

def verify_email_token(token: str):
    
    try:
        payload = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])

        if payload is None:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        email: str = payload.get("sub")

        if email is None:
            raise HTTPException(status_code=400, detail="Invalid token")
        
        return True
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    

@router.post("/login")
async def login(credentials: LoginDetails, response: Response, db = Depends(get_db)):
    try:
        user = UserRepository.get_by_email(db, email=credentials.email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            return {"error": "Invalid credentials"}, 401
        access_token_expires = timedelta(hours=24)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        response.set_cookie(key="access_token", value=access_token, httponly=True)
        return {"message": "Login successful"}, 200
    except Exception as e:
        return {"error": str(e)}, 500


@router.post("/register")
async def register(credentials: RegisterDetails, response: Response, db = Depends(get_db)):
    try:
        user = UserRepository.get_by_email(db, email=credentials.email)
        if user:
            return {"error": "Email already registered"}, 400
        hashed_password = get_password_hash(credentials.password)
        new_user = User(
            email=credentials.email,
            name=credentials.name,
            hashed_password=hashed_password
        )

        UserRepository.create(db, user=new_user)

        email_verification_token = generate_verification_token(credentials.email)

        await send_email_verification( 
            email=credentials.email,
            subject="Verification Email",
            body=f"Cliquez ici pour valider votre email {BASE_URL}/verify-email/{email_verification_token}"
        )
        return {"message": "User registered successfully"}, 201
    except Exception as e:
        return {"error": str(e)}, 500

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    return {"message": "Logged out successfully"}, 200

@router.get("/verify-email/{token}")
async def verify_email(token: str, db = Depends(get_db)):
    try:
        is_valid = verify_email_token(token)
        if not is_valid:
            raise HTTPException(status_code=400, detail='Invalid or expired token')
        decoded_token = jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
        email = decoded_token.get("sub")
        user = UserRepository.get_by_email(db, email=email)
        if not user:
            return {"error": "User not found"}, 404
        updated_user = User(
            id=user.id,
            name =user.name,
            email=user.email,
            hashed_password=user.hashed_password,
            is_email_verified=True
            )
        UserRepository.update(db, user=updated_user)
        return {"message": "Email verified successfully"}, 200
    except Exception as e:
        return {"error": str(e)}, 500
    


