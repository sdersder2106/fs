// scripts/create-users.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Création des utilisateurs test...');

  try {
    // Créer une company
    const company = await prisma.company.upsert({
      where: { id: 'test-company' },
      update: {},
      create: {
        id: 'test-company',
        name: 'Test Company',
      },
    });
    console.log('✅ Company créée:', company.name);

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('Test123!', 10);

    // Créer l'admin
    const admin = await prisma.user.upsert({
      where: { email: 'admin@test.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'admin@test.com',
        password: hashedPassword,
        name: 'Admin Test',
        role: 'ADMIN',
        companyId: company.id,
      },
    });
    console.log('✅ Admin créé:', admin.email);

    // Créer un utilisateur
    const user = await prisma.user.upsert({
      where: { email: 'user@test.com' },
      update: {
        password: hashedPassword,
      },
      create: {
        email: 'user@test.com',
        password: hashedPassword,
        name: 'User Test',
        role: 'USER',
        companyId: company.id,
      },
    });
    console.log('✅ User créé:', user.email);

    // Créer les utilisateurs demo mentionnés dans l'app
    const demoCompany = await prisma.company.upsert({
      where: { id: 'base44-company' },
      update: {},
      create: {
        id: 'base44-company',
        name: 'Base44',
      },
    });

    const client = await prisma.user.upsert({
      where: { email: 'client@base44.com' },
      update: {
        password: await bcrypt.hash('client123', 10),
      },
      create: {
        email: 'client@base44.com',
        password: await bcrypt.hash('client123', 10),
        name: 'Client Demo',
        role: 'CLIENT',
        companyId: demoCompany.id,
      },
    });
    console.log('✅ Client demo créé:', client.email);

    const pentester = await prisma.user.upsert({
      where: { email: 'pentester@base44.com' },
      update: {
        password: await bcrypt.hash('pentester123', 10),
      },
      create: {
        email: 'pentester@base44.com',
        password: await bcrypt.hash('pentester123', 10),
        name: 'Pentester Demo',
        role: 'PENTESTER',
        companyId: demoCompany.id,
      },
    });
    console.log('✅ Pentester demo créé:', pentester.email);

    console.log('\n📝 Utilisateurs créés avec succès !');
    console.log('================================');
    console.log('Email: admin@test.com');
    console.log('Password: Test123!');
    console.log('--------------------------------');
    console.log('Email: user@test.com');
    console.log('Password: Test123!');
    console.log('--------------------------------');
    console.log('Email: client@base44.com');
    console.log('Password: client123');
    console.log('--------------------------------');
    console.log('Email: pentester@base44.com');
    console.log('Password: pentester123');
    console.log('================================');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();