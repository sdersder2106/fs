import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database
  await prisma.externalTicket.deleteMany();
  await prisma.integrationLog.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.vulnerabilityActivity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.report.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.pentest.deleteMany();
  await prisma.target.deleteMany();
  await prisma.complianceResult.deleteMany();
  await prisma.vulnerabilityTemplate.deleteMany();
  await prisma.reportTemplate.deleteMany();
  await prisma.sLAConfiguration.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('✅ Database cleaned');

  // Create Companies
  const acmeCorp = await prisma.company.create({
    data: {
      name: 'Acme Corporation',
      industry: 'Technology',
      logo: '/logos/acme.png',
    },
  });

  const techStart = await prisma.company.create({
    data: {
      name: 'TechStart Inc',
      industry: 'FinTech',
      logo: '/logos/techstart.png',
    },
  });

  console.log('✅ Companies created');

  // Create Users
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const hashedClientPassword = await bcrypt.hash('client123', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@base44.com',
      password: hashedAdminPassword,
      fullName: 'John Pentester',
      role: 'ADMIN',
      avatar: '/avatars/admin.png',
      isActive: true,
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      email: 'client@demo.com',
      password: hashedClientPassword,
      fullName: 'Jane Client',
      role: 'CLIENT',
      avatar: '/avatars/client.png',
      isActive: true,
      companyId: acmeCorp.id,
    },
  });

  const clientUser2 = await prisma.user.create({
    data: {
      email: 'dev@acme.com',
      password: hashedClientPassword,
      fullName: 'Bob Developer',
      role: 'CLIENT',
      avatar: '/avatars/dev.png',
      isActive: true,
      companyId: acmeCorp.id,
    },
  });

  console.log('✅ Users created');
  console.log('  📧 Admin: admin@base44.com / admin123');
  console.log('  📧 Client: client@demo.com / client123');

  // Create SLA Configuration
  await prisma.sLAConfiguration.create({
    data: {
      companyId: acmeCorp.id,
      criticalDays: 7,
      highDays: 14,
      mediumDays: 30,
      lowDays: 60,
      autoEscalate: true,
      escalationEmail: 'security@acme.com',
    },
  });

  console.log('✅ SLA Configuration created');

  // Create Targets
  const webTarget = await prisma.target.create({
    data: {
      name: 'Acme E-commerce Website',
      description: 'Main customer-facing e-commerce platform',
      type: 'WEB_APP',
      url: 'https://shop.acme.com',
      status: 'ACTIVE',
      riskScore: 75.5,
      scope: ['https://shop.acme.com/*', 'https://api.shop.acme.com/*'],
      companyId: acmeCorp.id,
    },
  });

  const apiTarget = await prisma.target.create({
    data: {
      name: 'Payment API',
      description: 'REST API for payment processing',
      type: 'API',
      url: 'https://api.payments.acme.com',
      status: 'ACTIVE',
      riskScore: 85.0,
      scope: ['https://api.payments.acme.com/v1/*'],
      companyId: acmeCorp.id,
    },
  });

  const cloudTarget = await prisma.target.create({
    data: {
      name: 'AWS Cloud Infrastructure',
      description: 'Production AWS environment',
      type: 'CLOUD',
      status: 'ACTIVE',
      riskScore: 60.0,
      scope: ['AWS Account: 123456789012', 'VPC: vpc-abc123'],
      companyId: acmeCorp.id,
    },
  });

  console.log('✅ Targets created');

  // Create Pentests
  const pentest1 = await prisma.pentest.create({
    data: {
      title: 'Q4 2024 Web Application Security Assessment',
      description: 'Comprehensive security testing of e-commerce platform',
      status: 'IN_PROGRESS',
      progress: 65,
      startDate: new Date('2024-10-01'),
      endDate: new Date('2024-10-31'),
      targetId: webTarget.id,
      companyId: acmeCorp.id,
    },
  });

  const pentest2 = await prisma.pentest.create({
    data: {
      title: 'Payment API Penetration Test',
      description: 'Security assessment of payment processing API',
      status: 'SCHEDULED',
      progress: 0,
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-11-15'),
      targetId: apiTarget.id,
      companyId: acmeCorp.id,
    },
  });

  const pentest3 = await prisma.pentest.create({
    data: {
      title: 'Cloud Security Review',
      description: 'AWS infrastructure security assessment',
      status: 'COMPLETED',
      progress: 100,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-09-15'),
      targetId: cloudTarget.id,
      companyId: acmeCorp.id,
    },
  });

  console.log('✅ Pentests created');

  // Create Findings (Vulnerabilities)
  const finding1 = await prisma.finding.create({
    data: {
      title: 'SQL Injection in Search Parameter',
      description: 'The search functionality is vulnerable to SQL injection attacks, allowing attackers to extract sensitive data from the database.',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      status: 'OPEN',
      category: 'SQL Injection',
      proofOfConcept: 'By injecting `\' OR \'1\'=\'1` in the search parameter, all records are returned.',
      affectedUrls: ['https://shop.acme.com/search?q=test'],
      reproductionSteps: '1. Navigate to search page\n2. Enter payload: \' OR \'1\'=\'1\n3. Observe all records returned',
      requestExample: 'GET /search?q=%27+OR+%271%27%3D%271 HTTP/1.1\nHost: shop.acme.com',
      responseExample: '{"results": [...all_database_records...]}',
      evidenceImages: ['/evidence/sqli-proof.png'],
      remediation: 'Use parameterized queries (prepared statements) instead of string concatenation. Implement input validation and sanitization.',
      remediationCode: 'const query = "SELECT * FROM products WHERE name = ?";\ndb.execute(query, [userInput]);',
      references: ['CVE-2024-1234', 'OWASP A03:2021 - Injection'],
      pentestId: pentest1.id,
      targetId: webTarget.id,
      companyId: acmeCorp.id,
      reporterId: adminUser.id,
      assignedToId: clientUser2.id,
      firstFound: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
  });

  const finding2 = await prisma.finding.create({
    data: {
      title: 'Cross-Site Scripting (XSS) in Product Reviews',
      description: 'Stored XSS vulnerability in product review functionality allows attackers to inject malicious scripts.',
      severity: 'HIGH',
      cvssScore: 7.5,
      status: 'IN_PROGRESS',
      category: 'XSS',
      proofOfConcept: 'Injected script tag in review text field executes when other users view the product page.',
      affectedUrls: ['https://shop.acme.com/product/123/reviews'],
      reproductionSteps: '1. Go to product page\n2. Submit review with: <script>alert("XSS")</script>\n3. View product page\n4. Alert executes',
      requestExample: 'POST /api/reviews HTTP/1.1\nContent-Type: application/json\n\n{"productId": 123, "text": "<script>alert(1)</script>"}',
      responseExample: '{"success": true, "reviewId": 456}',
      evidenceImages: ['/evidence/xss-proof.png'],
      remediation: 'Implement proper output encoding and Content Security Policy (CSP). Use DOMPurify for sanitization.',
      remediationCode: 'import DOMPurify from \'dompurify\';\nconst clean = DOMPurify.sanitize(userInput);',
      references: ['OWASP A07:2021 - XSS', 'CWE-79'],
      pentestId: pentest1.id,
      targetId: webTarget.id,
      companyId: acmeCorp.id,
      reporterId: adminUser.id,
      assignedToId: clientUser2.id,
      firstFound: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    },
  });

  const finding3 = await prisma.finding.create({
    data: {
      title: 'Insecure Direct Object Reference (IDOR) in Order API',
      description: 'Users can access other users\' orders by manipulating the order ID parameter.',
      severity: 'HIGH',
      cvssScore: 8.1,
      status: 'FIX_SUBMITTED',
      category: 'Broken Access Control',
      proofOfConcept: 'By changing orderId from 100 to 101, accessed another user\'s order details.',
      affectedUrls: ['https://api.shop.acme.com/orders/{orderId}'],
      reproductionSteps: '1. Login as User A\n2. Get your order: /orders/100\n3. Change to /orders/101\n4. Access User B\'s order',
      requestExample: 'GET /api/orders/101 HTTP/1.1\nAuthorization: Bearer user_a_token',
      responseExample: '{"orderId": 101, "userId": "user_b", "items": [...]}',
      evidenceImages: ['/evidence/idor-proof.png'],
      remediation: 'Implement proper authorization checks. Verify that the authenticated user owns the requested resource.',
      remediationCode: 'if (order.userId !== req.user.id) {\n  return res.status(403).json({error: "Forbidden"});\n}',
      references: ['OWASP A01:2021 - Broken Access Control', 'CWE-639'],
      pentestId: pentest1.id,
      targetId: apiTarget.id,
      companyId: acmeCorp.id,
      reporterId: adminUser.id,
      assignedToId: clientUser2.id,
      fixSubmittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      fixSubmittedBy: clientUser2.id,
      fixDescription: 'Added authorization middleware to verify user ownership before returning order data.',
      fixProofUrls: ['/evidence/idor-fix-code.png'],
      firstFound: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    },
  });

  const finding4 = await prisma.finding.create({
    data: {
      title: 'Missing Security Headers',
      description: 'Application is missing critical security headers including CSP, HSTS, and X-Frame-Options.',
      severity: 'MEDIUM',
      cvssScore: 5.3,
      status: 'RESOLVED',
      category: 'Security Misconfiguration',
      affectedUrls: ['https://shop.acme.com/*'],
      remediation: 'Configure web server to include security headers: Content-Security-Policy, Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options.',
      remediationCode: 'helmet.contentSecurityPolicy({\n  directives: {\n    defaultSrc: ["\'self\'"],\n    scriptSrc: ["\'self\'", "\'unsafe-inline\'"]\n  }\n});',
      references: ['OWASP A05:2021 - Security Misconfiguration'],
      pentestId: pentest3.id,
      targetId: webTarget.id,
      companyId: acmeCorp.id,
      reporterId: adminUser.id,
      assignedToId: clientUser2.id,
      validatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      validatedBy: adminUser.id,
      validationNotes: 'Verified all security headers are now present. PASS.',
      firstFound: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  });

  const finding5 = await prisma.finding.create({
    data: {
      title: 'Weak Password Policy',
      description: 'Application allows weak passwords with no complexity requirements.',
      severity: 'MEDIUM',
      cvssScore: 5.0,
      status: 'ASSIGNED',
      category: 'Broken Authentication',
      remediation: 'Implement password complexity requirements: minimum 12 characters, mix of uppercase, lowercase, numbers, and special characters.',
      references: ['OWASP A07:2021 - Authentication Failures'],
      pentestId: pentest1.id,
      targetId: webTarget.id,
      companyId: acmeCorp.id,
      reporterId: adminUser.id,
      assignedToId: clientUser.id,
      firstFound: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 27 * 24 * 60 * 60 * 1000),
    },
  });

  const finding6 = await prisma.finding.create({
    data: {
      title: 'Information Disclosure in Error Messages',
      description: 'Detailed error messages reveal internal system information including database structure.',
      severity: 'LOW',
      cvssScore: 3.5,
      status: 'OPEN',
      category: 'Information Disclosure',
      affectedUrls: ['https://shop.acme.com/api/*'],
      remediation: 'Implement generic error messages for production. Log detailed errors server-side only.',
      remediationCode: 'if (process.env.NODE_ENV === "production") {\n  res.status(500).json({error: "Internal server error"});\n} else {\n  res.status(500).json({error: err.message, stack: err.stack});\n}',
      references: ['OWASP A05:2021 - Security Misconfiguration'],
      pentestId: pentest1.id,
      targetId: apiTarget.id,
      companyId: acmeCorp.id,
      reporterId: adminUser.id,
      firstFound: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 58 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Findings created (6 vulnerabilities)');

  // Create Comments
  await prisma.comment.create({
    data: {
      text: 'This is a critical issue. I\'ve assigned it to Bob for immediate remediation. Please prioritize this.',
      authorId: adminUser.id,
      findingId: finding1.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: 'Working on the fix now. Will submit a patch by end of day.',
      authorId: clientUser2.id,
      findingId: finding1.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: 'Starting phase 2 testing today. Will focus on authentication and authorization.',
      authorId: adminUser.id,
      pentestId: pentest1.id,
    },
  });

  await prisma.comment.create({
    data: {
      text: 'Fix has been deployed to production. Please re-test when you get a chance.',
      authorId: clientUser2.id,
      findingId: finding3.id,
    },
  });

  console.log('✅ Comments created');

  // Create Compliance Results
  await prisma.complianceResult.create({
    data: {
      standard: 'SOC2',
      score: 92.5,
      status: 'PASSED',
      passedCount: 37,
      failedCount: 3,
      totalTests: 40,
      companyId: acmeCorp.id,
      details: 'Overall strong security posture with minor improvements needed.',
    },
  });

  await prisma.complianceResult.create({
    data: {
      standard: 'PCI_DSS',
      score: 78.0,
      status: 'FAILED',
      passedCount: 195,
      failedCount: 55,
      totalTests: 250,
      companyId: acmeCorp.id,
      details: 'Critical issues found in payment processing security. Requires immediate attention.',
    },
  });

  await prisma.complianceResult.create({
    data: {
      standard: 'ISO_27001',
      score: 85.5,
      status: 'PASSED',
      passedCount: 102,
      failedCount: 18,
      totalTests: 120,
      companyId: acmeCorp.id,
    },
  });

  await prisma.complianceResult.create({
    data: {
      standard: 'GDPR',
      score: 88.0,
      status: 'PASSED',
      passedCount: 44,
      failedCount: 6,
      totalTests: 50,
      companyId: acmeCorp.id,
    },
  });

  await prisma.complianceResult.create({
    data: {
      standard: 'OWASP_2021',
      score: 75.0,
      status: 'FAILED',
      passedCount: 23,
      failedCount: 10,
      totalTests: 33,
      companyId: acmeCorp.id,
      details: 'Multiple high-severity vulnerabilities found. See detailed findings report.',
    },
  });

  console.log('✅ Compliance results created');

  // Create Vulnerability Templates (OWASP Top 10)
  const templates = [
    {
      name: 'SQL Injection',
      description: 'SQL injection attacks allow attackers to interfere with database queries, potentially accessing or modifying sensitive data.',
      category: 'Injection',
      severity: 'CRITICAL',
      cvssScoreMin: 8.0,
      cvssScoreMax: 10.0,
      remediation: 'Use parameterized queries (prepared statements) instead of string concatenation. Implement input validation and use an ORM where possible.',
      remediationCode: '// Good - Using parameterized query\nconst query = "SELECT * FROM users WHERE email = ?";\ndb.execute(query, [userInput]);\n\n// Bad - String concatenation\nconst query = "SELECT * FROM users WHERE email = \'" + userInput + "\'";\ndb.execute(query);',
      references: ['OWASP A03:2021 - Injection', 'CWE-89'],
      owaspCategory: 'A03:2021',
      cweId: 'CWE-89',
    },
    {
      name: 'Cross-Site Scripting (XSS) - Reflected',
      description: 'Reflected XSS occurs when user input is immediately returned in the response without proper encoding, allowing script execution.',
      category: 'XSS',
      severity: 'HIGH',
      cvssScoreMin: 6.0,
      cvssScoreMax: 8.0,
      remediation: 'Encode all user input before displaying. Use Content Security Policy (CSP). Sanitize HTML input using libraries like DOMPurify.',
      remediationCode: '// React automatically escapes\n<div>{userInput}</div>\n\n// For HTML content, use DOMPurify\nimport DOMPurify from \'dompurify\';\nconst clean = DOMPurify.sanitize(dirty);',
      references: ['OWASP A03:2021 - Injection', 'CWE-79'],
      owaspCategory: 'A03:2021',
      cweId: 'CWE-79',
    },
    {
      name: 'Cross-Site Scripting (XSS) - Stored',
      description: 'Stored XSS occurs when malicious scripts are saved to the database and executed when other users view the content.',
      category: 'XSS',
      severity: 'HIGH',
      cvssScoreMin: 7.0,
      cvssScoreMax: 9.0,
      remediation: 'Sanitize and validate all user input before storage. Encode output. Implement CSP headers.',
      remediationCode: 'import DOMPurify from \'dompurify\';\n\n// Before saving to database\nconst sanitized = DOMPurify.sanitize(userInput, {\n  ALLOWED_TAGS: [\'b\', \'i\', \'em\', \'strong\'],\n  ALLOWED_ATTR: []\n});',
      references: ['OWASP A03:2021 - Injection', 'CWE-79'],
      owaspCategory: 'A03:2021',
      cweId: 'CWE-79',
    },
    {
      name: 'Broken Access Control (IDOR)',
      description: 'Insecure Direct Object References allow users to access objects by manipulating identifiers without proper authorization checks.',
      category: 'Broken Access Control',
      severity: 'HIGH',
      cvssScoreMin: 7.0,
      cvssScoreMax: 9.0,
      remediation: 'Implement proper authorization checks. Verify that the authenticated user has permission to access the requested resource. Use indirect references (UUIDs).',
      remediationCode: '// Check ownership before returning data\nconst order = await db.orders.findById(orderId);\nif (order.userId !== req.user.id) {\n  return res.status(403).json({error: "Forbidden"});\n}\nreturn res.json(order);',
      references: ['OWASP A01:2021 - Broken Access Control', 'CWE-639'],
      owaspCategory: 'A01:2021',
      cweId: 'CWE-639',
    },
    {
      name: 'Broken Authentication',
      description: 'Weak authentication mechanisms allow attackers to compromise passwords, keys, or session tokens.',
      category: 'Authentication',
      severity: 'CRITICAL',
      cvssScoreMin: 8.0,
      cvssScoreMax: 10.0,
      remediation: 'Implement multi-factor authentication. Use strong password policies. Secure session management. Implement rate limiting on login attempts.',
      remediationCode: '// Use bcrypt for password hashing\nimport bcrypt from \'bcryptjs\';\nconst hashedPassword = await bcrypt.hash(password, 10);\n\n// Verify password\nconst isValid = await bcrypt.compare(inputPassword, hashedPassword);',
      references: ['OWASP A07:2021 - Identification and Authentication Failures', 'CWE-287'],
      owaspCategory: 'A07:2021',
      cweId: 'CWE-287',
    },
    {
      name: 'Security Misconfiguration',
      description: 'Application is missing security hardening, has unnecessary features enabled, or uses default configurations.',
      category: 'Misconfiguration',
      severity: 'MEDIUM',
      cvssScoreMin: 5.0,
      cvssScoreMax: 7.0,
      remediation: 'Disable unnecessary features. Remove default credentials. Keep software updated. Implement security headers.',
      remediationCode: '// Express.js security headers\nimport helmet from \'helmet\';\napp.use(helmet());\napp.use(helmet.contentSecurityPolicy({\n  directives: {\n    defaultSrc: ["\'self\'"],\n    styleSrc: ["\'self\'", "\'unsafe-inline\'"]\n  }\n}));',
      references: ['OWASP A05:2021 - Security Misconfiguration'],
      owaspCategory: 'A05:2021',
    },
    {
      name: 'Sensitive Data Exposure',
      description: 'Application exposes sensitive data such as passwords, credit cards, or personal information without proper protection.',
      category: 'Data Exposure',
      severity: 'HIGH',
      cvssScoreMin: 7.0,
      cvssScoreMax: 9.0,
      remediation: 'Encrypt sensitive data at rest and in transit. Use HTTPS. Don\'t store unnecessary sensitive data. Implement proper key management.',
      remediationCode: '// Use TLS/HTTPS\n// Encrypt sensitive fields\nimport crypto from \'crypto\';\nconst algorithm = \'aes-256-gcm\';\nconst encrypted = crypto.encrypt(data, key, iv);',
      references: ['OWASP A02:2021 - Cryptographic Failures', 'CWE-311'],
      owaspCategory: 'A02:2021',
      cweId: 'CWE-311',
    },
    {
      name: 'XML External Entity (XXE)',
      description: 'XML parsers process XML input containing references to external entities, potentially leading to file disclosure or SSRF.',
      category: 'Injection',
      severity: 'HIGH',
      cvssScoreMin: 7.0,
      cvssScoreMax: 9.0,
      remediation: 'Disable external entity processing in XML parsers. Use less complex data formats like JSON when possible.',
      remediationCode: '// Disable external entities\nconst libxmljs = require("libxmljs");\nconst doc = libxmljs.parseXml(xml, {\n  noent: false,  // Disable entity substitution\n  noblanks: true\n});',
      references: ['OWASP A05:2021 - Security Misconfiguration', 'CWE-611'],
      owaspCategory: 'A05:2021',
      cweId: 'CWE-611',
    },
    {
      name: 'Cross-Site Request Forgery (CSRF)',
      description: 'Application doesn\'t properly validate that requests come from legitimate users, allowing attackers to forge requests.',
      category: 'CSRF',
      severity: 'MEDIUM',
      cvssScoreMin: 5.0,
      cvssScoreMax: 7.0,
      remediation: 'Implement CSRF tokens for state-changing operations. Use SameSite cookie attribute. Verify Origin/Referer headers.',
      remediationCode: '// Express.js CSRF protection\nimport csrf from \'csurf\';\nconst csrfProtection = csrf({ cookie: true });\napp.post(\'/api/transfer\', csrfProtection, (req, res) => {\n  // Protected endpoint\n});',
      references: ['OWASP A01:2021 - Broken Access Control', 'CWE-352'],
      owaspCategory: 'A01:2021',
      cweId: 'CWE-352',
    },
    {
      name: 'Server-Side Request Forgery (SSRF)',
      description: 'Application fetches remote resources without validating user-supplied URLs, allowing access to internal systems.',
      category: 'SSRF',
      severity: 'HIGH',
      cvssScoreMin: 7.0,
      cvssScoreMax: 9.0,
      remediation: 'Validate and sanitize all user-supplied URLs. Use allowlists for permitted domains. Disable unused URL schemes.',
      remediationCode: '// Validate URL before fetching\nconst allowedHosts = [\'api.example.com\'];\nconst url = new URL(userInput);\nif (!allowedHosts.includes(url.hostname)) {\n  throw new Error(\'Invalid host\');\n}\nconst response = await fetch(url);',
      references: ['OWASP A10:2021 - Server-Side Request Forgery', 'CWE-918'],
      owaspCategory: 'A10:2021',
      cweId: 'CWE-918',
    },
  ];

  for (const template of templates) {
    await prisma.vulnerabilityTemplate.create({
      data: template,
    });
  }

  console.log('✅ Vulnerability templates created (10 templates)');

  // Create Notification Preferences
  await prisma.notificationPreference.create({
    data: {
      userId: clientUser.id,
      emailEnabled: true,
      pushEnabled: true,
      dailyDigest: false,
      notifyOnComment: true,
      notifyOnAssign: true,
      notifyOnStatus: true,
      notifyOnDeadline: true,
    },
  });

  console.log('✅ Notification preferences created');

  // Create some notifications
  await prisma.notification.create({
    data: {
      type: 'NEW_VULN',
      title: 'New Critical Vulnerability Found',
      message: 'SQL Injection vulnerability discovered in search functionality',
      link: `/dashboard/vulnerabilities/${finding1.id}`,
      isRead: false,
      userId: clientUser.id,
      metadata: { findingId: finding1.id, severity: 'CRITICAL' },
    },
  });

  await prisma.notification.create({
    data: {
      type: 'COMMENT',
      title: 'New comment on vulnerability',
      message: 'John Pentester commented on "SQL Injection in Search Parameter"',
      link: `/dashboard/vulnerabilities/${finding1.id}`,
      isRead: false,
      userId: clientUser2.id,
      metadata: { findingId: finding1.id },
    },
  });

  await prisma.notification.create({
    data: {
      type: 'ASSIGNMENT',
      title: 'Vulnerability assigned to you',
      message: 'You have been assigned to fix "Weak Password Policy"',
      link: `/dashboard/vulnerabilities/${finding5.id}`,
      isRead: false,
      userId: clientUser.id,
      metadata: { findingId: finding5.id },
    },
  });

  console.log('✅ Notifications created');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('='.repeat(50));
  console.log('📊 Summary:');
  console.log('='.repeat(50));
  console.log('✅ 2 Companies');
  console.log('✅ 3 Users (1 Admin, 2 Clients)');
  console.log('✅ 3 Targets');
  console.log('✅ 3 Pentests');
  console.log('✅ 6 Vulnerabilities');
  console.log('✅ 4 Comments');
  console.log('✅ 5 Compliance Results');
  console.log('✅ 10 Vulnerability Templates');
  console.log('✅ 3 Notifications');
  console.log('='.repeat(50));
  console.log('\n🔐 Login Credentials:');
  console.log('  Admin:  admin@base44.com  /  admin123');
  console.log('  Client: client@demo.com   /  client123');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
