pipeline {
    agent any

    environment {
        ANGULAR_APP_DIR = "frontend"      // chemin de ton projet Angular
        FASTAPI_APP_DIR = "backend"       // chemin de ton projet FastAPI
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/ton-repo.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Backend
                sh "cd ${FASTAPI_APP_DIR} && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
                // Frontend
                sh "cd ${ANGULAR_APP_DIR} && npm install"
            }
        }

        stage('Run Backend Tests') {
            steps {
                sh "cd ${FASTAPI_APP_DIR} && source venv/bin/activate && pytest"
            }
        }

        stage('Run Frontend Tests') {
            steps {
                sh "cd ${ANGULAR_APP_DIR} && npm run test -- --watch=false"
            }
        }

        stage('Build & Start Apps') {
            steps {
                // Angular build
                sh "cd ${ANGULAR_APP_DIR} && npm run build"
                // Lancer FastAPI
                sh "cd ${FASTAPI_APP_DIR} && source venv/bin/activate && uvicorn main:app --host 0.0.0.0 --port 8000 &"
            }
        }
    }
}
