#!/bin/bash

# Script de vérification rapide pour Railway Authentication
# Usage: ./check-railway-auth.sh

echo "🔍 Vérification de l'Authentification Railway"
echo "==========================================="

APP_URL="https://fs-production-c597.up.railway.app"

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n📍 URL de l'application: ${GREEN}$APP_URL${NC}"

# 1. Test de l'accès à l'application
echo -e "\n1️⃣ Test d'accès à l'application..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL")
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "308" ]; then
    echo -e "${GREEN}✅ Application accessible (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Application non accessible (HTTP $HTTP_CODE)${NC}"
fi

# 2. Test de la page de login
echo -e "\n2️⃣ Test de la page de login..."
LOGIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/login")
if [ "$LOGIN_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Page de login accessible${NC}"
else
    echo -e "${RED}❌ Page de login non accessible (HTTP $LOGIN_CODE)${NC}"
fi

# 3. Test de l'API auth
echo -e "\n3️⃣ Test de l'API d'authentification..."
SESSION_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$APP_URL/api/auth/session")
echo -e "Session endpoint: HTTP $SESSION_CODE"

# 4. Variables à vérifier dans Railway
echo -e "\n4️⃣ ${YELLOW}Variables d'environnement à configurer dans Railway :${NC}"
echo "=================================================="
echo -e "${GREEN}NEXTAUTH_URL${NC}=$APP_URL"
echo -e "${GREEN}NEXTAUTH_SECRET${NC}=[Générer avec: openssl rand -base64 32]"
echo -e "${GREEN}DATABASE_URL${NC}=[Automatique avec PostgreSQL Railway]"
echo -e "${GREEN}NODE_ENV${NC}=production"

# 5. Commandes SQL utiles
echo -e "\n5️⃣ ${YELLOW}Commandes SQL pour vérifier la base de données :${NC}"
echo "================================================"
cat << 'EOF'
-- Lister tous les utilisateurs
SELECT id, email, fullName, role FROM "User";

-- Vérifier le hash du mot de passe
SELECT email, LEFT(password, 10) as pwd_check FROM "User";

-- Créer un utilisateur test (mot de passe: Test123!)
INSERT INTO "User" (id, email, password, fullName, role, companyId)
VALUES (
  gen_random_uuid(),
  'test@railway.com',
  '$2a$10$K7L1OJ0TfIKoFTvHKI5m6eUg4jKFbCbCiCnM8IzLt5XvOJnFfGq8K',
  'Test User',
  'USER',
  (SELECT id FROM "Company" LIMIT 1)
);
EOF

# 6. Test de login avec curl
echo -e "\n6️⃣ ${YELLOW}Commande pour tester le login :${NC}"
echo "================================"
cat << 'EOF'
curl -X POST https://fs-production-c597.up.railway.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}' \
  -c cookies.txt -v
EOF

echo -e "\n✨ ${GREEN}Vérification terminée !${NC}"
echo -e "📚 Consultez le guide complet : fix-railway-login.md"
