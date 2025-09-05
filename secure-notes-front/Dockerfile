# --- Étape 1 : Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Installer Angular CLI si besoin (peut être évité si déjà dans devDependencies)
RUN npm install -g @angular/cli@latest

# Copier tout le code source
COPY . .

# Compiler l'app en mode production
RUN ng build --configuration=production

# --- Étape 2 : Serveur Nginx ---
FROM nginx:alpine

# Supprimer la configuration nginx par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copier notre configuration nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/

# Copier le build Angular vers Nginx
COPY --from=builder /app/dist/secure-notes-front/browser /usr/share/nginx/html

# Exposer le port HTTP
EXPOSE 80

# Lancer Nginx
CMD ["nginx", "-g", "daemon off;"]