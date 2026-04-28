-- ==========================================================
-- 🏦 Banking System - Database Schema (Relational)
-- ==========================================================

-- ----------------------------------------------------------
-- 1. AUTH SERVICE (Database: authService)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    email               VARCHAR(100) NOT NULL UNIQUE,
    password            VARCHAR(255) NOT NULL,
    role                ENUM('CUSTOMER','STAFF','ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    enabled             BOOLEAN NOT NULL DEFAULT FALSE,
    verification_token  VARCHAR(255),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 2. ACCOUNT SERVICE (Database: accountService)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS accounts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    account_number  VARCHAR(20) NOT NULL UNIQUE,
    user_id         VARCHAR(255) NOT NULL, -- UUID or Email from Auth Service
    balance         DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    account_type    ENUM('SAVINGS','CURRENT') NOT NULL DEFAULT 'SAVINGS',
    status          ENUM('ACTIVE','FROZEN','CLOSED') NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 3. TRANSACTION SERVICE (Database: transactionService)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    idempotency_key     VARCHAR(64)  NOT NULL UNIQUE,
    sender_account_id   BIGINT,
    receiver_account_id BIGINT,
    amount              DECIMAL(15,2) NOT NULL,
    type                ENUM('TRANSFER','DEPOSIT','WITHDRAWAL') NOT NULL,
    status              ENUM('PENDING','SUCCESS','FAILED','REVERSED') NOT NULL DEFAULT 'PENDING',
    description         VARCHAR(255),
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- 4. AUDIT SERVICE (Database: auditService - MongoDB)
-- ----------------------------------------------------------
-- Note: Audit logs are stored in MongoDB. The schema is dynamic but 
-- generally follows this structure:
-- {
--   "id": ObjectId,
--   "userId": String,
--   "action": String,
--   "entity": String,
--   "entityId": String,
--   "details": String,
--   "ipAddress": String,
--   "timestamp": Date
-- }
