-- ==========================================================
-- 🏦 Banking System - Seed Data (Example Dataset)
-- ==========================================================

-- ----------------------------------------------------------
-- 1. SEED USERS (authService)
-- ----------------------------------------------------------
-- Passwords are hashed with BCrypt (strength 12). 
-- 'Pasiya12' hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/mfAHUpVQa

INSERT INTO users (email, password, role, enabled)
VALUES 
('admin@bank.lk', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/mfAHUpVQa', 'ADMIN', TRUE),
('alice@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/mfAHUpVQa', 'CUSTOMER', TRUE),
('bob@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/mfAHUpVQa', 'CUSTOMER', TRUE),
('staff@bank.lk', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/mfAHUpVQa', 'STAFF', TRUE);

-- ----------------------------------------------------------
-- 2. SEED ACCOUNTS (accountService)
-- ----------------------------------------------------------
INSERT INTO accounts (account_number, user_id, balance, account_type, status)
VALUES 
('ACC1001', 'alice@example.com', 50000.00, 'SAVINGS', 'ACTIVE'),
('ACC1002', 'bob@example.com', 25000.50, 'SAVINGS', 'ACTIVE'),
('ACC1003', 'alice@example.com', 1000.00, 'CURRENT', 'ACTIVE');

-- ----------------------------------------------------------
-- 3. SEED TRANSACTIONS (transactionService)
-- ----------------------------------------------------------
INSERT INTO transactions (idempotency_key, sender_account_id, receiver_account_id, amount, type, status, description)
VALUES 
('init-deposit-alice', NULL, 1, 50000.00, 'DEPOSIT', 'SUCCESS', 'Initial Deposit'),
('init-deposit-bob', NULL, 2, 25000.50, 'DEPOSIT', 'SUCCESS', 'Initial Deposit'),
('transfer-1', 1, 2, 500.00, 'TRANSFER', 'SUCCESS', 'Dinner split');
