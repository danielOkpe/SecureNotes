from fastapi import FastAPI
from app.extensions import Base, engine
from app import models
import os
from fastapi.middleware.cors import CORSMiddleware
from app.routes import notes_routes, auth_routes, users_routes

app = FastAPI()

origins = os.getenv("CORS_ORIGINS").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(notes_routes.router)
app.include_router(auth_routes.router)
app.include_router(users_routes.router)

