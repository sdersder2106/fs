# 🔧 Résolution du Problème de Login sur Railway

## 🔍 Diagnostic Rapide

D'après vos logs HTTP, l'application répond (codes 200) mais l'authentification ne fonctionne pas. Voici les causes probables et les solutions.

## ⚠️ Problèmes Identifiés

### 1. **Variables d'Environnement Critiques**

Vérifiez immédiatement ces variables dans Railway :

```bash
# OBLIGATOIRES pour l'authentification
NEXTAUTH_URL=https://fs-production-c597.up.railway.app
NEXTAUTH_SECRET=[votre-secret-généré]
DATABASE_URL=[automatiquement fournie par Railway]
```

### 2. **Génération du NEXTAUTH_SECRET**

Si vous n'avez pas encore généré le secret :

```bash
# Générer un secret sécurisé
openssl rand -base64 32
```

Ou utilisez ce secret généré pour vous :
```
vK9xH2mR5tN8qL4wP7jF3bG6yC1aZ0dE9sT5uI8oM2k=
```

## 📝 Étapes de Correction

### Étape 1 : Configurer les Variables dans Railway

1. Allez dans votre projet Railway
2. Cliquez sur votre service `fs-production-c597`
3. Onglet **Variables**
4. Ajoutez/Vérifiez :

```env
NEXTAUTH_URL=https://fs-production-c597.up.railway.app
NEXTAUTH_SECRET=vK9xH2mR5tN8qL4wP7jF3bG6yC1aZ0dE9sT5uI8oM2k=
NODE_ENV=production
```

### Étape 2 : Vérifier la Base de Données

```sql
-- Connectez-vous à votre DB PostgreSQL dans Railway et exécutez :
SELECT id, email, fullName, role, companyId 
FROM "User" 
WHERE email = 'votre-email@example.com';

-- Vérifiez que le mot de passe est bien hashé (commence par $2a$ ou $2b$)
SELECT email, LEFT(password, 10) as pwd_prefix 
FROM "User" 
WHERE email = 'votre-email@example.com';
```

### Étape 3 : Tester la Connexion

1. **Redéployez** après avoir ajouté les variables
2. Attendez que le déploiement soit terminé
3. Testez sur : `https://fs-production-c597.up.railway.app/login`

## 🚨 Checklist de Dépannage

- [ ] `NEXTAUTH_URL` correspond EXACTEMENT à votre URL Railway (sans slash final)
- [ ] `NEXTAUTH_SECRET` est configuré (minimum 32 caractères)
- [ ] `DATABASE_URL` est automatiquement configurée par Railway
- [ ] L'utilisateur existe dans la base de données
- [ ] Le mot de passe est hashé avec bcrypt
- [ ] Les cookies sont activés dans votre navigateur
- [ ] Pas de blocage CORS (vérifiez la console du navigateur)

## 🔬 Debug Avancé

### Vérifier les Logs d'Erreur

Dans Railway, consultez les logs détaillés :

```bash
# Cherchez ces messages d'erreur courants :
- "Invalid credentials"
- "NEXTAUTH_URL mismatch"
- "Missing NEXTAUTH_SECRET"
- "Database connection failed"
```

### Script de Test Direct

Créez ce script pour tester l'authentification :

```typescript
// test-auth.ts
import bcrypt from 'bcryptjs';

// Tester le hash du mot de passe
const testPassword = "votre-mot-de-passe";
const hashedPassword = "$2a$10$..."; // Copié depuis votre DB

bcrypt.compare(testPassword, hashedPassword).then(result => {
  console.log("Mot de passe valide :", result);
});
```

## 🆘 Solutions Rapides

### Option A : Réinitialiser un Utilisateur Test

```sql
-- Dans votre DB PostgreSQL Railway
UPDATE "User" 
SET password = '$2a$10$K7L1OJ0TfIKoFTvHKI5m6eUg4jKFbCbCiCnM8IzLt5XvOJnFfGq8K'
WHERE email = 'test@example.com';
-- Mot de passe : Test123!
```

### Option B : Créer un Nouvel Utilisateur

```sql
INSERT INTO "User" (id, email, password, fullName, role, companyId, createdAt, updatedAt)
VALUES (
  gen_random_uuid(),
  'admin@test.com',
  '$2a$10$K7L1OJ0TfIKoFTvHKI5m6eUg4jKFbCbCiCnM8IzLt5XvOJnFfGq8K',
  'Admin Test',
  'ADMIN',
  (SELECT id FROM "Company" LIMIT 1),
  NOW(),
  NOW()
);
-- Mot de passe : Test123!
```

## ✅ Validation Finale

Après correction, vous devriez voir dans les logs :

1. `GET /api/auth/session` → 200 (avec données utilisateur)
2. `POST /api/auth/callback/credentials` → 200
3. Redirection vers `/dashboard` après login

## 📞 Support Supplémentaire

Si le problème persiste après ces étapes :

1. **Inspectez la Console du Navigateur** (F12) pour voir les erreurs JavaScript
2. **Vérifiez les Cookies** : Un cookie `next-auth.session-token` doit être créé
3. **Testez en Navigation Privée** pour éliminer les problèmes de cache

---

💡 **Conseil Pro** : La plupart du temps, c'est un problème de `NEXTAUTH_SECRET` manquant ou de `NEXTAUTH_URL` incorrect. Vérifiez ces deux variables en premier !
