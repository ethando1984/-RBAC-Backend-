# Hyperion CMS Backend

This is the backend service for the Hyperion CMS, built with Spring Boot and MyBatis.

## 🛠 Tech Stack

- **Java**: 17
- **Framework**: Spring Boot 3.2.1
- **Database**: H2 (In-Memory for Dev), PostgreSQL (supported)
- **ORM**: MyBatis 3.0.3
- **Security**: Spring Security 6, OAuth2 Resource Server (JWT)
- **Documentation**: SpringDoc OpenAPI (Swagger UI)
- **Build Tool**: Maven

## 🚀 Getting Started

### Prerequisites

- Java Development Kit (JDK) 17 or higher
- Maven 3.6+

### 🏃‍♂️ Running the Application

1.  **Clone the repository** (if you haven't already).
2.  **Navigate to the backend directory**:
    ```bash
    cd Hyperion-backend
    ```
3.  **Run with Maven**:
    ```bash
    mvn spring-boot:run
    ```

The application will start on **port 8081**.

### 🔌 API Documentation & Tools

Once the application is running, you can access:

-   **Swagger UI (API Docs)**: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)
-   **H2 Database Console**: [http://localhost:8081/h2-console](http://localhost:8081/h2-console)
    -   **JDBC URL**: `jdbc:h2:mem:hyperion`
    -   **User Name**: `sa`
    -   **Password**: *(leave blank)*

## ⚙️ Configuration

Key configuration settings can be found in `src/main/resources/application.yml`.

-   **Server Port**: `8081`
-   **CORS**: Allows `http://localhost:5173` (Vite Frontend)
-   **JWT Secret**: Configured via `JWT_SECRET` env var or default fallback.

## 📂 Key Features

-   **Authentication**: JWT-based stateless authentication.
-   **RBAC**: Role-Based Access Control for managing user permissions.
-   **CMS**: Content management capabilities.
