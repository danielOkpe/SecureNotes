# SecureNotes

SecureNotes est une application de prise de notes sécurisée.
Toutes les notes sont **chiffrées** avant d’être stockées dans la base de données afin de garantir la confidentialité des données.

---

## 🚀 Lancer l'application

L’application est entièrement dockerisée.
Pour démarrer l’ensemble des services (API FastAPI, base de données, etc.), exécute simplement :

```bash
docker-compose up --build
```

---

## 🧪 Tests

Des tests sont disponibles uniquement côté **back-end** (FastAPI).

Pour les exécuter :

1. Aller dans le répertoire du projet FastAPI
2. Activer l’environnement virtuel

   ```bash
   source venv/bin/activate
   ```
3. Installer les dépendances

   ```bash
   pip install -r requirements.txt
   ```
4. Lancer les tests

   ```bash
   pytest
   ```

---

## ⚙️ Variables d’environnement

Voici un exemple de fichier `.env` pour FastAPI.
⚠️ Pense à remplacer les valeurs sensibles par tes propres informations (base de données, clés, etc.).

```env
DATABASE_URL=postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>
CORS_ORIGINS=http://localhost:4200,http://127.0.0.1:4200,http://localhost,http://127.0.0.1
SECRET_KEY=<TON_SECRET_KEY>

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=<TON_ADRESSE_EMAIL>
EMAIL_PASSWORD=<TON_MOT_DE_PASSE_APPLICATION>

BASE_URL=http://localhost:4200
```

---

## 📌 Fonctionnalités principales

* ✍️ Prise de notes
* 🔒 Chiffrement des données en base
* 📧 Intégration d’un système d’envoi d’e-mails
* 🐳 Déploiement via **Docker & Docker Compose**

---

## 📖 Technologies utilisées

* **Back-end** : [FastAPI](https://fastapi.tiangolo.com/)
* **Base de données** : PostgreSQL
* **Conteneurisation** : Docker & Docker Compose
* **Tests** : Pytest

---

## 📜 Licence

Ce projet est sous licence libre.
Tu es libre de l’utiliser, le modifier et le distribuer.
