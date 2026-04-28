# 🏦 Secure Cloud-Based Banking Transaction Management System

[![Build Status](https://github.com/pasinduimalsha/Secure-Cloud-Based-Banking-Transaction-Management-System/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/pasinduimalsha/Secure-Cloud-Based-Banking-Transaction-Management-System/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust, secure, and scalable microservices-based banking system designed for high-concurrency transaction management. This project leverages modern cloud-native technologies to ensure data integrity, security, and high availability.

---

## 🌐 Live Demo

> [!NOTE]
> **Live URL**: [https://securebankingsys.indevs.in/](https://securebankingsys.indevs.in/)
> - **SSL Enabled**: The application is served over HTTPS for secure communication.
> - **Status**: This instance is active for demonstration purposes only. To manage costs, the instance will be taken down following the demo period.

---

## 🏗️ Architecture Overview

![Component Diagram](./docs/assets/component_diagram.png)

The system is built on a **Microservices Architecture**, where each service is responsible for a specific domain. Communication between services is handled via synchronous REST APIs (through an API Gateway) and asynchronous event-driven messaging.


### 🧩 Components & Responsibilities

| Component | Responsibility | Tech Stack | Port |
| :--- | :--- | :--- | :--- |
| **Frontend** | Customer & Staff Dashboard | React, Vite, CSS3 | 5173 |
| **API Gateway** | Routing, Security, Load Balancing | Spring Cloud Gateway | 8000 |
| **Auth Service** | User JWT Auth, Registration, RBAC | Spring Boot, MySQL | 8081 |
| **Account Service** | Balance & Account Management | Spring Boot, MySQL | 8082 |
| **Transaction Service** | ACID Fund Transfers, Deposits | Spring Boot, MySQL, Redis | 8083 |
| **Audit Service** | Security Logging & Audit Trails | Spring Boot, MongoDB | 8084 |
| **Notification Service**| Real-time Alerts (RabbitMQ) | Spring Boot, MongoDB | 8085 |

---

## 🚀 Key Features

- **Secure Transactions**: ACID-compliant fund transfers with pessimistic locking to prevent race conditions.
- **Idempotency**: Prevents duplicate transactions using Redis-based caching.
- **Security**: JWT-based authentication, BCrypt hashing, and Role-Based Access Control (RBAC).
- **Asynchronous Processing**: Decoupled services using RabbitMQ for notifications and auditing.
- **Infrastructure as Code**: Terraform for cloud deployment and Kubernetes for orchestration.

---

## 🚦 Getting Started (Full System)

### Prerequisites
- [Docker](https://www.docker.com/get-started) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Java 17+](https://adoptium.net/)
- [Node.js 20+](https://nodejs.org/)

### 1. Setup Environment
Copy the example environment file and fill in your secrets.
```bash
cp .env.example .env
```
> [!IMPORTANT]
> Update `JWT_SECRET`, `MYSQL_ROOT_PASSWORD`, and `MONGODB_ADMIN_PASS` in your `.env` file before running the system.

### 2. Database Initialization
The system uses two main scripts to initialize the databases. These are automatically executed by Docker on the first run, but you should ensure they are present and correctly formatted:

#### 🟢 MySQL Initialization (`init-db.sh`)
This script creates the necessary relational databases and dedicated users for each microservice:
- **Databases**: `authService`, `accountService`, `transactionService`.
- **Action**: Drops existing DBs (if any), creates new ones, and assigns `readWrite` privileges to dedicated service users.

#### 🟠 MongoDB Initialization (`init-mongo.js`)
This script initializes the NoSQL environment for auditing:
- **Database**: `auditService`.
- **Action**: Creates an admin user and the `audit_logs` collection.

---

### 3. Run with Docker Compose (Recommended)

This starts all databases, microservices, and the frontend in a single network.
```bash
docker-compose up --build -d
```

### 3. Access Points

| Component | URL | Credentials (Default) |
| :--- | :--- | :--- |
| **Frontend UI** | [http://localhost:5173](http://localhost:5173) | register via UI |
| **API Gateway** | [http://localhost:8000](http://localhost:8000) | - |
| **RabbitMQ UI** | [http://localhost:15672](http://localhost:15672) | `guest` / `guest` |

---

## 🛠️ Individual Service Development

If you prefer to run services individually for debugging or development:

### Infrastructure Only
> [!IMPORTANT]
> To run services individually on your local machine, you **must** first start the infrastructure services and ensure the initialization scripts have run. These scripts set up the required databases and users that the services expect.

```bash
docker-compose -f docker-compose-infra.yml up -d
```



### Backend Services
Navigate to any service directory in `Backend/` and run:
```bash
cd Backend/transaction-service
./gradlew bootRun
```

### API Gateway
```bash
cd api-gateway
./gradlew bootRun
```

### Frontend
```bash
cd Frontend
npm install
npm run dev
```

---

## 📊 Database Schema & Example Data

The system uses a combination of Relational (MySQL) and NoSQL (MongoDB) databases.

- **Schema Definitions**: You can find the complete SQL schema in [docs/database/schema.sql](./docs/database/schema.sql).
- **Example Dataset**: A sample dataset for testing (including an admin user and demo customers) is available in [docs/database/seed.sql](./docs/database/seed.sql).

### 🛠️ Entity Relationship (ER) Summary
- **Users**: Managed by `auth-service`. Each user has an email, role (ADMIN, STAFF, CUSTOMER), and status.
- **Accounts**: Managed by `account-service`. Linked to users via `user_id`.
- **Transactions**: Managed by `transaction-service`. Records all movements of funds with status tracking and idempotency.
- **Audit Logs**: Managed by `audit-service`. Documented in MongoDB as unstructured JSON events.

---

## ⚙️ Detailed Configurations

The system relies on several environment variables defined in your `.env` file. Below is a breakdown of the most critical ones:

| Variable | Purpose | Default / Example |
| :--- | :--- | :--- |
| `MYSQL_ROOT_PASSWORD` | Root password for the MySQL container. | `Pasiya12` |
| `AUTH_DB_PASS` | Password for the `authService_user`. | `authService_pass12` |
| `JWT_SECRET` | Secret key used to sign JWT tokens (Min 256-bit). | (SHA-256 string) |
| `MONGODB_ADMIN_PASS` | Password for the MongoDB admin user. | `Pasiya12` |
| `MAIL_USERNAME` | SMTP username for the Notification Service. | (Mailtrap user) |
| `SPRING_PROFILES_ACTIVE`| Set to `docker` when running in containers. | `docker` |

---

## 🚀 Deployment Architecture

![Deployment Diagram](./docs/assets/deployment_diagram.png)

The system is deployed on AWS using a highly available and secure infrastructure. The CI/CD pipeline automates the build and deployment process to an EKS (Elastic Kubernetes Service) cluster.

---

## 📁 Project Structure


```text
.
├── Backend/                # Microservices source code
├── Frontend/               # React + Vite application
├── api-gateway/            # Spring Cloud Gateway
├── docs/                   # Documentation & Database Assets
│   └── database/           # schema.sql & seed.sql
├── k8s/                    # Kubernetes manifests
├── terraform/              # Infrastructure as Code
├── docker-compose.yml      # Full system orchestration
└── docker-compose-infra.yml# Databases & Messaging only
```


---

## 🛡️ Security & Compliance

The system implements several security layers:
- **JWT Authentication**: Stateless authentication for microservices.
- **Pessimistic Locking**: Ensures data consistency during concurrent transactions.
- **Audit Logging**: Every sensitive action is logged with user details and IP addresses.
- **Idempotency**: Every transaction request requires a unique key to prevent replays.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.