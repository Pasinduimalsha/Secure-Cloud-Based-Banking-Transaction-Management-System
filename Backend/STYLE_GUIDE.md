# Banking Service Style Guide

This document outlines the architectural patterns, API design principles, and coding standards adopted across the Banking Transaction Management System. Adhering to these guidelines ensures consistency, maintainability, and a high-quality developer experience.

## 1. API Design Principles

The services in this system follow **RESTful** architecture principles.

### Versioning
All API endpoints must be versioned to ensure backward compatibility.
- **Base Path**: `/api/v1/`
- **Example**: `/api/v1/products`

### HTTP Methods
Endpoints should use standard HTTP methods to represent actions:
- **GET**: Retrieve resource(s).
- **POST**: Create a new resource.
- **PUT**: Update an existing resource.
- **DELETE**: Remove a resource.

### Endpoint Naming
- Use **plural nouns** for resource names (e.g., `/products`, `/categories`).
- **Path Variables**: Use camelCase for path variables (e.g., `productId`).
- **Static Paths**: Use kebab-case for multi-word paths in endpoints (e.g., `/api/v1/product-reviews`).

---

## 2. Request & Response Format

### Success Response Structure
All successful responses are wrapped in a standard JSON envelope to provide consistent metadata:

```json
{
  "status": "success",
  "message": "Product retrieved successfully",
  "data": {
    "id": 1,
    "name": "Smartphone",
    "sku": "SKU123",
    "status": "APPROVED"
  }
}
```

### Data Transfer Objects (DTOs)
- Never expose JPA entities directly to the client.
- Use **DTOs** for both request bodies and response data.
- Mapping between Entities and DTOs is handled by dedicated Mapper classes (e.g., `ProductMapper`).

### Validation
- Use `jakarta.validation` annotations (e.g., `@NotNull`, `@Size`, `@Min`) in DTOs.
- Annotate controller parameters with `@Valid` to trigger validation and return structured error messages for invalid inputs.

---

## 3. Standardizing Responses: ProductAbstractController

To maintain consistency across all endpoints, all controllers must extend the `ProductAbstractController`. This base class provides standardized methods for constructing `ResponseEntity` objects.

### Core Functionality
- **Response Wrapper**: Automatically wraps data in a uniform JSON structure containing `status`, `message`, and `data`.
- **Health Check**: Provides a common `/health` endpoint for monitoring service availability.
- **Validation Helpers**: Includes reusable validation logic (e.g., `isValidSearchValue`).

### Standard Response Methods
The following protected methods should be used to return responses from controllers:

- `sendSuccessResponse(T data, String message)`: Returns a 200 OK with the provided data and message.
- `sendCreatedResponse(T data, String message)`: Returns a 201 Created after a successful resource creation.
- `sendNoContentResponse(String message)`: Returns a 204 No Content.
- `sendBadRequestResponse(String message)`: Returns a 400 Bad Request.
- `sendNotFoundResponse(String message)`: Returns a 404 Not Found.
- `sendInternalServerErrorResponse(String message)`: Returns a 500 Internal Server Error.

### Usage Example
```java
@RestController
@RequestMapping("/api/v1/resource")
public class ResourceController extends ProductAbstractController {
    
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getResource(@PathVariable Long id) {
        // ... logic ...
        return sendSuccessResponse(resourceDto, "Resource retrieved successfully");
    }
}

---

## 4. Error Handling

### Global Exception Handler
Exceptions are handled centrally using `@RestControllerAdvice` in the `GlobalExceptionHandler` class. This ensures all errors have a consistent format.

### Error Response Structure
When an error occurs, the service returns a structured error response:

```json
{
  "status": "error",
  "message": "Product with ID 456 not found",
  "errorCode": "RESOURCE_NOT_FOUND",
  "timestamp": "2026-04-18T12:00:00Z"
}
```

### Standard Exceptions
- `ResourceNotFoundException`: For 404 errors when a requested resource is missing.
- `InvalidInputException`: For 400 errors during manual validation logic.
- `InternalServerException`: For 500 unexpected errors.
- `DuplicateSkuException`: For business logic violations involving unique constraints.

---

## 5. Coding Standards

### Boilerplate Reduction
- Use **Lombok** to reduce boilerplate code:
    - `@Data` for DTOs.
    - `@RequiredArgsConstructor` for dependency injection.
    - `@Slf4j` for logging.

### Dependency Injection
- Prefer **Constructor Injection** over field injection (`@Autowired`). Lombok's `@RequiredArgsConstructor` with `final` fields is the standard way to achieve this.

### Logging
- Use standard SLF4J logging levels:
    - `log.info()`: Key business events (e.g., "Request to create product").
    - `log.warn()`: Expected but significant events (e.g., "Search returned no results").
    - `log.error()`: Failures and exceptions.
- Always include relevant context (e.g., IDs) in log messages.

### Database Access
- Use **Spring Data JPA** repositories.
- Method names in repositories should follow Spring Data's derived query naming conventions (e.g., `findByStatus`).

---

## 6. Communication & Messaging

The system supports both synchronous and asynchronous communication patterns. Depending on the service requirements, messaging can be implemented in two ways:

### Scenario A: Synchronous (No Messaging)
In the initial phase or for internal service logic where message persistence is not required:
- **Direct Service Calls**: Use service implementation classes directly for logic execution.
- **REST Clients**: For inter-service communication, use `RestTemplate` or `FeignClient`.
- **Logic Flow**: The request completes only after all downstream logic is finished.

### Scenario B: Asynchronous (With RabbitMQ)
When the service requires high availability or eventual consistency:
- **RabbitMQ Integration**: Use RabbitMQ for publishing and consuming events.
- **Event Publishing**: Services publish events (e.g., `TransactionCreatedEvent`) after major state changes.
- **DTO Structure**: Events follows a strict DTO contract to ensure consistency between producer and consumer services.
- **Configuration**: Messaging configuration should be centralized in a `RabbitMQConfig` class.

---

## 7. Project Structure

```text
src/main/java/com/pasi/{service_name}/
├── config/      # Configuration classes (Security, RabbitMQ, etc.)
├── controller/  # REST Controllers (Extending AbstractController)
├── dto/         # Data Transfer Objects
├── entity/      # JPA Entities
├── exception/   # Custom Exceptions & Global Handler
├── mapper/      # Entity-DTO Mappers
├── repository/  # Spring Data JPA Repositories
└── service/     # Business Logic (Interfaces & Impl)
```
---

## 8. Configuration Management

Each service must include an `application-local.properties` file for localized development. This profile is intended for local environment settings and should use **MySQL** as the primary database.

### Local Properties Format

```properties
spring.application.name=[service-name]
server.port=[port]

# Local development configuration (MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/[db_name]?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=@Pasiya12
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Session Configuration
spring.session.store-type=jdbc
spring.session.jdbc.initialize-schema=always
spring.session.timeout=1800

# Logging
logging.level.org.springframework.jdbc.core.JdbcTemplate=DEBUG
logging.level.org.springframework.boot.autoconfigure=INFO
logging.level.root=INFO
```

### Standard Port & DB Assignments
- **Auth Service**: Port 8081, DB `authService`
- **Account Service**: Port 8082, DB `accountService`
- **Transaction Service**: Port 8083, DB `transactionService`
- **Audit Service**: Port 8084, DB `auditService`
- **Notification Service**: Port 8085, DB `notificationService`
