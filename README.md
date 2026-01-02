# Hyperion CMS & RBAC Workspace

Welcome to the Hyperion CMS project workspace. This repository contains the backend and frontend services for the application, along with reference implementations for the IAM logic.

## 📂 Repository Structure

-   **[Hyperion-backend](./Hyperion-backend)**:
    -   The core backend service providing APIs for the CMS and IAM.
    -   Built with **Spring Boot 3**, **MyBatis**, and **Java 17**.
    -   Runs on port `8081`.

-   **[Hyperion-cms](./Hyperion-cms)**:
    -   The frontend user interface.
    -   Built with **React**, **TypeScript**, and **Vite**.
    -   Typically runs on port `5173`.

-   **[rbac-iam-like](./rbac-iam-like)**:
    -   A comprehensive reference implementation for the RBAC (Role-Based Access Control) system.
    -   Contains detailed design documents and prototype implementations for policy management and AWS-style IAM.

## 🚀 Quick Start

### 1. Start the Backend
```bash
cd Hyperion-backend
mvn spring-boot:run
```
*Access API Docs at: [http://localhost:8081/swagger-ui.html](http://localhost:8081/swagger-ui.html)*

### 2. Start the Frontend
```bash
cd Hyperion-cms
npm install
npm run dev
```
*Access the App at: [http://localhost:5173](http://localhost:5173)*

## 📚 Documentation

-   **Backend Details**: See [Hyperion-backend/README.md](./Hyperion-backend/README.md)
-   **IAM Reference**: See [rbac-iam-like/README.md](./rbac-iam-like/README.md)
