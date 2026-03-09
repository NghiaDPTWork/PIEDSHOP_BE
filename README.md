# PIEDSHOP_BE

A robust and complete backend system for a Shopping Cart application. This project heavily focuses on security, high performance, and maintaining a clean code structure utilizing TypeScript.

## Tech Stack

* **Runtime:** Node.js & Express.js
* **Language:** TypeScript
* **Database:** MongoDB (using the native MongoDB Driver for optimal performance)
* **Authentication:** JWT (Access Token & Refresh Token) with Refresh Token Rotation mechanism
* **Media Processing:** `formidable` (file upload handling) and `sharp` (image compression and format conversion)

## Architecture (Service Layer)

The project is strictly organized into distinct layers to ensure high maintainability and scalability:

* **Middleware & Validator:** Enforces strict data validation and access control before requests reach the core logic.
* **Controller:** Manages request and response routing, kept entirely decoupled from business operations.
* **Service:** The core "brain" of the application, handling all database interactions and complex business logic.
* **Utilities:** Shared helper functions for JWT generation, password hashing, and file manipulation.

## Core Features

* **Advanced Authentication Flow:** A comprehensive and secure authentication system supporting registration, login, email verification, forgot password, and password reset functionalities.
* **Smart Media Processing:** Automatically processes uploaded media files. All images are compressed and converted to `.jpg` format to ensure data consistency and optimize storage capacity.
* **Centralized Error Handling:** A unified error-handling mechanism that catches all systemic and logical errors, returning standardized and accurate HTTP responses to the Frontend.
