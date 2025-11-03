#!/usr/bin/env node

/**
 * BASE44 - Script de Diagnostic
 * 
 * Ce script vérifie que tout est correctement configuré
 * Usage: node check-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 BASE44 - Diagnostic de Configuration\n');
console.log('========================================\n');

let hasErrors = false;
let warnings = 0;

// Vérifier Node.js version
console.log('📦 Node.js Version');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion >= 18) {
  console.log(`   ✅ Node.js ${nodeVersion} (OK)\n`);
} else {
  console.log(`   ❌ Node.js ${nodeVersion} (Requis: v18+)\n`);
  hasErrors = true;
}

// Vérifier package.json
console.log('📄 package.json');
try {
  const packageJson = require('./package.json');
  console.log(`   ✅ package.json trouvé`);
  console.log(`   📌 Version: ${packageJson.version || 'N/A'}`);
  console.log(`   📌 Name: ${packageJson.name || 'N/A'}\n`);
} catch (e) {
  console.log('   ❌ package.json non trouvé\n');
  hasErrors = true;
}

// Vérifier node_modules
console.log('📦 Dépendances');
if (fs.existsSync('./node_modules')) {
  console.log('   ✅ node_modules installé\n');
} else {
  console.log('   ⚠️  node_modules manquant');
  console.log('   💡 Exécuter: npm install\n');
  warnings++;
}

// Vérifier .env
console.log('⚙️  Variables d\'environnement');
if (fs.existsSync('./.env')) {
  console.log('   ✅ .env trouvé');
  
  const envContent = fs.readFileSync('./.env', 'utf8');
  
  // Vérifier DATABASE_URL
  if (envContent.includes('DATABASE_URL=') && !envContent.includes('DATABASE_URL=""')) {
    const dbUrlMatch = envContent.match(/DATABASE_URL="([^"]*)"/);
    if (dbUrlMatch && dbUrlMatch[1]) {
      if (dbUrlMatch[1].includes('postgresql://')) {
        console.log('   ✅ DATABASE_URL configuré');
      } else {
        console.log('   ❌ DATABASE_URL invalide (doit commencer par postgresql://)');
        hasErrors = true;
      }
    }
  } else {
    console.log('   ❌ DATABASE_URL manquant ou vide');
    hasErrors = true;
  }
  
  // Vérifier NEXTAUTH_URL
  if (envContent.includes('NEXTAUTH_URL=') && !envContent.includes('NEXTAUTH_URL=""')) {
    console.log('   ✅ NEXTAUTH_URL configuré');
  } else {
    console.log('   ⚠️  NEXTAUTH_URL manquant ou vide');
    warnings++;
  }
  
  // Vérifier NEXTAUTH_SECRET
  if (envContent.includes('NEXTAUTH_SECRET=') && !envContent.includes('NEXTAUTH_SECRET=""')) {
    const secretMatch = envContent.match(/NEXTAUTH_SECRET="([^"]*)"/);
    if (secretMatch && secretMatch[1] && secretMatch[1].length >= 32) {
      console.log('   ✅ NEXTAUTH_SECRET configuré (longueur OK)');
    } else if (secretMatch && secretMatch[1]) {
      console.log('   ⚠️  NEXTAUTH_SECRET trop court (min 32 caractères)');
      warnings++;
    }
  } else {
    console.log('   ❌ NEXTAUTH_SECRET manquant ou vide');
    hasErrors = true;
  }
  
  console.log();
} else {
  console.log('   ❌ .env non trouvé');
  console.log('   💡 Exécuter: cp .env.example .env\n');
  hasErrors = true;
}

// Vérifier Prisma
console.log('🗄️  Prisma');
if (fs.existsSync('./prisma/schema.prisma')) {
  console.log('   ✅ schema.prisma trouvé');
} else {
  console.log('   ❌ schema.prisma non trouvé\n');
  hasErrors = true;
}

if (fs.existsSync('./node_modules/.prisma/client')) {
  console.log('   ✅ Prisma Client généré\n');
} else {
  console.log('   ⚠️  Prisma Client non généré');
  console.log('   💡 Exécuter: npx prisma generate\n');
  warnings++;
}

// Vérifier les dossiers principaux
console.log('📁 Structure du projet');
const requiredDirs = ['app', 'components', 'lib', 'prisma', 'public'];
let allDirsExist = true;

requiredDirs.forEach(dir => {
  if (fs.existsSync(`./${dir}`)) {
    console.log(`   ✅ ${dir}/`);
  } else {
    console.log(`   ❌ ${dir}/ manquant`);
    allDirsExist = false;
    hasErrors = true;
  }
});
console.log();

// Résumé
console.log('========================================\n');
console.log('📊 RÉSUMÉ\n');

if (!hasErrors && warnings === 0) {
  console.log('✅ Configuration parfaite !');
  console.log('🚀 Vous pouvez lancer: npm run dev\n');
} else if (!hasErrors && warnings > 0) {
  console.log(`⚠️  Configuration OK avec ${warnings} avertissement(s)`);
  console.log('💡 Voir les recommandations ci-dessus\n');
} else {
  console.log('❌ Configuration incomplète');
  console.log('🔧 Corriger les erreurs ci-dessus avant de continuer\n');
}

// Prochaines étapes
if (!hasErrors) {
  console.log('📝 PROCHAINES ÉTAPES:\n');
  
  if (warnings > 0) {
    console.log('1. Corriger les avertissements (optionnel)');
    console.log('2. npx prisma db push');
    console.log('3. npx prisma db seed');
    console.log('4. npm run dev\n');
  } else {
    console.log('1. npx prisma db push');
    console.log('2. npx prisma db seed');
    console.log('3. npm run dev\n');
  }
}

process.exit(hasErrors ? 1 : 0);
