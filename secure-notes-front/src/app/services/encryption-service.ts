import { Injectable } from '@angular/core';
import { SECRET_KEY } from '../constants/constants';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private encoder = new TextEncoder();
  private decoder = new TextDecoder();

  private defaultPassword = SECRET_KEY!;

  // Générer une clé cryptographique à partir d'un mot de passe
  private async getKey(password: string = this.defaultPassword): Promise<CryptoKey> {
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      this.encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );
    
    // Utiliser un salt statique pour la compatibilité avec les données existantes
    // En production, utilisez un salt unique par utilisateur
    const salt = this.encoder.encode('note-app-salt-2024');
    
    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Chiffrement
  async encrypt(text: string, password?: string): Promise<string> {
    if (!text) return '';
    
    try {
      const key = await this.getKey(password);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        this.encoder.encode(text)
      );
      
      // Combiner IV + données chiffrées
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Échec du chiffrement');
    }
  }

  // Déchiffrement
  async decrypt(encryptedText: string, password?: string): Promise<string> {
    if (!encryptedText) return '';
    
    try {
      // Vérifier si c'est du Base64 valide (données chiffrées)
      if (!this.isBase64(encryptedText)) {
        // Probablement du texte non chiffré - le retourner tel quel
        return encryptedText;
      }

      const combined = new Uint8Array(
        atob(encryptedText).split('').map(c => c.charCodeAt(0))
      );
      
      // Vérifier si la taille est suffisante (au moins 12 bytes pour l'IV)
      if (combined.length < 12) {
        return encryptedText; // Probablement pas chiffré
      }
      
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);
      
      const key = await this.getKey(password);
      
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
      );
      
      return this.decoder.decode(decrypted);
    } catch (error) {
      console.warn('Decryption failed, returning original text:', error);
      // Si le déchiffrement échoue, c'est probablement du texte non chiffré
      return encryptedText;
    }
  }

  // Vérifier si une chaîne est du Base64 valide
  private isBase64(str: string): boolean {
    if (!str || str.length % 4 !== 0) return false;
    
    try {
      const decoded = atob(str);
      return btoa(decoded) === str;
    } catch (error) {
      return false;
    }
  }

  // Version synchrone pour la compatibilité (retourne le texte tel quel)
  // À utiliser seulement si vous êtes sûr que les données ne sont pas chiffrées
  decryptSync(text: string): string {
    return text || '';
  }
  
}
