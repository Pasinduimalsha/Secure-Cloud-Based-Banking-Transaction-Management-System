db = db.getSiblingDB('auditService');

db.createUser({
  user: 'admin',
  pwd: process.env.MONGODB_ADMIN_PASS || 'Pasiya12',
  roles: [
    {
      role: 'readWrite',
      db: 'auditService',
    },
  ],
});

db.createCollection('audit_logs');

print('MongoDB Initialization Complete: auditService database and admin user created.');
