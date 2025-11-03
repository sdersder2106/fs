-- Base44 - Script de données de démonstration (conforme au schéma)
-- Exécutez ce script dans Supabase SQL Editor

-- 1. Créer la company de démo
INSERT INTO "Company" (id, name, domain, "createdAt", "updatedAt")
VALUES ('demo-company', 'Demo Company', 'demo.com', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Créer l'utilisateur admin
-- Email: demo@demo.com  
-- Password: Test123!
-- Le hash du password a été généré avec bcrypt
INSERT INTO "User" (
  id, 
  email, 
  password, 
  "fullName", 
  role, 
  "companyId",
  "createdAt", 
  "updatedAt"
)
VALUES (
  'demo-user',
  'demo@demo.com',
  '$2b$10$K7L1OJ0/6HLa.NiRi3Jy8OgxK9u.eFdGZk3Yx0HvBQbKmdQh9u4WC',
  'Demo Admin',
  'ADMIN',
  'demo-company',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET 
  password = EXCLUDED.password,
  "fullName" = EXCLUDED."fullName",
  role = EXCLUDED.role;

-- 3. Créer des targets (AVANT les pentests car les pentests ont besoin d'un targetId)
INSERT INTO "Target" (
  id, 
  name, 
  type, 
  url, 
  "ipAddress", 
  description, 
  status, 
  "riskScore", 
  "companyId", 
  "createdAt", 
  "updatedAt"
)
VALUES
  ('tgt1', 'Production Web Server', 'WEB_APP', 'https://app.demo.com', '192.168.1.10', 'Main production web application server', 'ACTIVE', 85, 'demo-company', NOW(), NOW()),
  ('tgt2', 'API Gateway', 'API', 'https://api.demo.com', '192.168.1.20', 'Central API gateway for all services', 'ACTIVE', 75, 'demo-company', NOW(), NOW()),
  ('tgt3', 'Database Server', 'HOST', NULL, '10.0.0.50', 'PostgreSQL production database', 'ACTIVE', 95, 'demo-company', NOW(), NOW()),
  ('tgt4', 'Mobile Backend', 'MOBILE_APP', 'https://mobile.demo.com', '192.168.1.30', 'Mobile application backend services', 'ACTIVE', 60, 'demo-company', NOW(), NOW()),
  ('tgt5', 'Cloud Infrastructure', 'CLOUD', 'https://aws.demo.com', NULL, 'AWS cloud infrastructure', 'INACTIVE', 40, 'demo-company', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  "riskScore" = EXCLUDED."riskScore";

-- 4. Créer des pentests (avec targetId obligatoire)
INSERT INTO "Pentest" (
  id, 
  title, 
  description, 
  status, 
  progress,
  "startDate", 
  "endDate", 
  "targetId",
  "companyId", 
  "createdById", 
  "createdAt", 
  "updatedAt"
)
VALUES 
  ('pen1', 'Web Application Security Assessment Q1 2024', 'Comprehensive security testing of the main web application including OWASP Top 10', 'COMPLETED', 100, '2024-01-15'::timestamp, '2024-02-15'::timestamp, 'tgt1', 'demo-company', 'demo-user', NOW() - INTERVAL '2 months', NOW()),
  ('pen2', 'API Security Testing', 'REST API security assessment and authentication testing', 'IN_PROGRESS', 65, '2024-03-01'::timestamp, '2024-03-30'::timestamp, 'tgt2', 'demo-company', 'demo-user', NOW() - INTERVAL '1 month', NOW()),
  ('pen3', 'Infrastructure Pentest', 'Network and host security assessment', 'IN_PROGRESS', 40, '2024-03-15'::timestamp, '2024-04-15'::timestamp, 'tgt3', 'demo-company', 'demo-user', NOW() - INTERVAL '15 days', NOW()),
  ('pen4', 'Mobile App Security Review', 'iOS and Android application security testing', 'SCHEDULED', 0, '2024-04-01'::timestamp, '2024-04-15'::timestamp, 'tgt4', 'demo-company', 'demo-user', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  progress = EXCLUDED.progress;

-- 5. Créer des findings
INSERT INTO "Finding" (
  id, 
  title, 
  description, 
  severity, 
  status, 
  "cvssScore",
  "pentestId", 
  "targetId",
  "reporterId", 
  "companyId", 
  "createdAt", 
  "updatedAt"
)
VALUES
  ('f1', 'SQL Injection in Login Form', 'The login form is vulnerable to SQL injection attacks through the username parameter. An attacker can bypass authentication or extract sensitive data.', 'CRITICAL', 'OPEN', 9.8, 'pen1', 'tgt1', 'demo-user', 'demo-company', NOW() - INTERVAL '7 days', NOW()),
  ('f2', 'Cross-Site Scripting (XSS) in Comments', 'Stored XSS vulnerability found in the comments section. User input is not properly sanitized before being displayed.', 'HIGH', 'OPEN', 7.5, 'pen1', 'tgt1', 'demo-user', 'demo-company', NOW() - INTERVAL '6 days', NOW()),
  ('f3', 'Weak Password Policy', 'Password policy allows weak passwords (less than 8 characters, no complexity requirements)', 'MEDIUM', 'IN_PROGRESS', 5.3, 'pen1', 'tgt1', 'demo-user', 'demo-company', NOW() - INTERVAL '5 days', NOW()),
  ('f4', 'Missing Security Headers', 'Several important security headers are not implemented (CSP, X-Frame-Options, etc.)', 'LOW', 'RESOLVED', 3.1, 'pen1', 'tgt1', 'demo-user', 'demo-company', NOW() - INTERVAL '4 days', NOW()),
  ('f5', 'Outdated TLS Version', 'Server still supports deprecated TLS 1.0 and 1.1 protocols', 'HIGH', 'OPEN', 7.0, 'pen2', 'tgt2', 'demo-user', 'demo-company', NOW() - INTERVAL '3 days', NOW()),
  ('f6', 'Information Disclosure', 'Detailed error messages reveal system information and stack traces', 'INFO', 'OPEN', 2.5, 'pen2', 'tgt2', 'demo-user', 'demo-company', NOW() - INTERVAL '2 days', NOW()),
  ('f7', 'Insecure Direct Object Reference', 'User can access other users data by changing ID parameter in API calls', 'CRITICAL', 'OPEN', 8.9, 'pen2', 'tgt2', 'demo-user', 'demo-company', NOW() - INTERVAL '1 day', NOW()),
  ('f8', 'Unpatched CVE-2023-1234', 'System is running a vulnerable version of library X', 'HIGH', 'OPEN', 8.1, 'pen3', 'tgt3', 'demo-user', 'demo-company', NOW() - INTERVAL '12 hours', NOW()),
  ('f9', 'Default Credentials', 'Admin panel accessible with default credentials admin/admin', 'CRITICAL', 'OPEN', 9.5, 'pen3', 'tgt3', 'demo-user', 'demo-company', NOW() - INTERVAL '6 hours', NOW()),
  ('f10', 'Directory Listing Enabled', 'Web server has directory listing enabled on /backup/ folder', 'MEDIUM', 'OPEN', 5.0, 'pen1', 'tgt1', 'demo-user', 'demo-company', NOW() - INTERVAL '3 hours', NOW())
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  severity = EXCLUDED.severity;

-- 6. Créer quelques commentaires sur les findings
INSERT INTO "Comment" (
  id,
  text,
  "entityType",
  "entityId",
  "authorId",
  "createdAt",
  "updatedAt"
)
VALUES
  ('com1', 'This vulnerability needs immediate attention. I recommend patching within 24 hours.', 'FINDING', 'f1', 'demo-user', NOW() - INTERVAL '6 days', NOW()),
  ('com2', 'Working on a fix. Should be deployed by end of week.', 'FINDING', 'f3', 'demo-user', NOW() - INTERVAL '4 days', NOW()),
  ('com3', 'Verified the fix is working. Can be closed.', 'FINDING', 'f4', 'demo-user', NOW() - INTERVAL '3 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- 7. Créer des rapports
INSERT INTO "Report" (
  id,
  title,
  type,
  status,
  format,
  "pentestId",
  "companyId",
  "createdById",
  "createdAt",
  "updatedAt"
)
VALUES
  ('rep1', 'Q1 2024 Web Security Assessment Report', 'PENTEST', 'FINAL', 'PDF', 'pen1', 'demo-company', 'demo-user', NOW() - INTERVAL '1 month', NOW()),
  ('rep2', 'API Security Testing - Progress Report', 'PENTEST', 'DRAFT', 'DOCX', 'pen2', 'demo-company', 'demo-user', NOW() - INTERVAL '1 week', NOW())
ON CONFLICT (id) DO NOTHING;

-- 8. Vérifier que les données sont bien insérées
SELECT 'Setup Complete! Use email: demo@demo.com and password: Test123!' as message;
SELECT 'Companies:', COUNT(*) as count FROM "Company";
SELECT 'Users:', COUNT(*) as count FROM "User";  
SELECT 'Targets:', COUNT(*) as count FROM "Target";
SELECT 'Pentests:', COUNT(*) as count FROM "Pentest";
SELECT 'Findings:', COUNT(*) as count FROM "Finding";
SELECT 'Comments:', COUNT(*) as count FROM "Comment";
SELECT 'Reports:', COUNT(*) as count FROM "Report";