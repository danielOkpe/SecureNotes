FROM jenkins/jenkins:lts

USER root

# Installer dépendances système nécessaires
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    libssl-dev \
    libffi-dev \
    libpq-dev \
    nodejs \
    npm \
    git \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Mettre pip à jour de manière sécurisée
RUN python3 -m pip install --upgrade --no-cache-dir pip setuptools wheel

# Installer pytest
RUN pip install --no-cache-dir pytest

# Installer Angular CLI
RUN npm install -g @angular/cli

USER jenkins

EXPOSE 8080 