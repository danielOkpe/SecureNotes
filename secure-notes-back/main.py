from fastapi import FastAPI
from app.extensions import Base, engine
from app import models
import os
import time
import sys
from fastapi.middleware.cors import CORSMiddleware
from app.routes import notes_routes, auth_routes, users_routes
from sqlalchemy.exc import OperationalError
from sqlalchemy import text

app = FastAPI()

# Fonction pour attendre que PostgreSQL soit prêt
def wait_for_database(max_retries=30, delay=2):
    """Attend que la base de données soit prête avec des tentatives de reconnexion"""
    for attempt in range(max_retries):
        try:
            # Test de connexion simple
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            print(f"✅ Connexion à la base de données réussie (tentative {attempt + 1})")
            return True
        except OperationalError as e:
            if attempt < max_retries - 1:
                print(f"⏳ Tentative {attempt + 1}/{max_retries} - Base de données non prête: {e}")
                print(f"⏳ Nouvelle tentative dans {delay} secondes...")
                time.sleep(delay)
            else:
                print(f"❌ Échec de connexion à la base de données après {max_retries} tentatives")
                sys.exit(1)
    return False

# Configuration CORS
origins_env = os.getenv("CORS_ORIGINS")
if origins_env:
    origins = origins_env.split(",")
    print(".env enable")

else:
    # Valeurs par défaut pour le développement
    origins = ["http://localhost:4200", "http://127.0.0.1:4200", "http://localhost"]

print(origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoint de santé pour les health checks
@app.get("/health")
async def health_check():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# Attendre que la base soit prête avant de créer les tables
print("🔍 Vérification de la connexion à la base de données...")
wait_for_database()

# Créer les tables une fois que la base est prête
print("📋 Création des tables...")
try:
    #Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées avec succès")
except Exception as e:
    print(f"❌ Erreur lors de la création des tables: {e}")
    sys.exit(1)

# Inclure les routes
app.include_router(notes_routes.router)
app.include_router(auth_routes.router)
app.include_router(users_routes.router)

print("🚀 Application FastAPI prête!")