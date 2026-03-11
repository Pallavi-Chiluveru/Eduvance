
# 🏗️ Project Architecture

This document outlines the high-level architecture of the application, including the Frontend, Backend, Database, and User Roles.

```mermaid
graph TD
    %% ==========================================
    %% 🎨 STYLING & CLASSES
    %% ==========================================
    classDef student fill:#E3F2FD,stroke:#1565C0,stroke-width:2px,color:#0D47A1;
    classDef teacher fill:#FFF3E0,stroke:#EF6C00,stroke-width:2px,color:#E65100;
    classDef parent fill:#F3E5F5,stroke:#7B1FA2,stroke-width:2px,color:#4A148c;
    classDef admin fill:#FFEBEE,stroke:#C62828,stroke-width:2px,color:#B71c1c;
    classDef frontend fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20;
    classDef backend fill:#FFF8E1,stroke:#FBC02D,stroke-width:2px,color:#F57F17;
    classDef database fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238;
    classDef external fill:#F5F5F5,stroke:#9E9E9E,stroke-width:2px,stroke-dasharray: 5 5;

    %% ==========================================
    %% 👥 USER ROLES
    %% ==========================================
    subgraph Roles ["👥 User Roles"]
        direction LR
        Student(Student 👨‍🎓):::student
        Teacher(Teacher 👩‍🏫):::teacher
        Parent(Parent 👨‍👩‍👧):::parent
        Admin(Admin 🛡️):::admin
    end

    %% ==========================================
    %% 🖥️ FRONTEND (React + Vite)
    %% ==========================================
    subgraph Frontend ["🖥️ Frontend Application (React + Vite)"]
        WebApp[Web App Interface]:::frontend
        
        subgraph FE_Modules [Modules]
            AuthPages[Login/Register]:::frontend
            Dashboards[Role-Based Dashboards]:::frontend
            CourseView[Course Player]:::frontend
        end
        
        WebApp --> AuthPages
        AuthPages --> Dashboards
        Dashboards --> CourseView
    end

    %% ==========================================
    %% ⚙️ BACKEND (Node.js + Express)
    %% ==========================================
    subgraph Backend ["⚙️ Backend API (Node.js + Express)"]
        APIGateway{API Routes}:::backend
        
        subgraph Controllers [Controllers & Logic]
            AuthCtrl[Auth Controller]:::backend
            UserCtrl[User Controller]:::backend
            CourseCtrl[Course Controller]:::backend
            EnrollCtrl[Enrollment Controller]:::backend
        end
        
        Middleware[Auth Middleware JWT]:::backend
    end

    %% ==========================================
    %% 💾 DATABASE (MongoDB)
    %% ==========================================
    subgraph Database ["💾 Database (MongoDB)"]
        DB_Users[("Users (Roles)")]:::database
        DB_Courses[("Courses & Lectures")]:::database
        DB_Enrollments[("Enrollments")]:::database
        DB_Submissions[("Submissions")]:::database
    end

    %% ==========================================
    %% 🔗 CONNECTIONS & FLOWS
    %% ==========================================

    %% User Interactions
    Student -->|Learns & Submits| WebApp
    Teacher -->|Creates Content| WebApp
    Parent -->|Monitors Progress| WebApp
    Admin -->|Manages System| WebApp

    %% Frontend to Backend
    WebApp == "HTTP/REST JSON" ==> APIGateway

    %% Backend Routing
    APIGateway --> Middleware
    Middleware --> Controllers

    %% Controller Logic
    AuthCtrl -->|Verifies| DB_Users
    UserCtrl -->|CRUD| DB_Users
    CourseCtrl -->|Reads/Writes| DB_Courses
    EnrollCtrl -->|Manages| DB_Enrollments
    EnrollCtrl -->|Tracks| DB_Submissions
    
    %% Specific Role Data Access
    Student -.->|Reads| DB_Courses
    Student -.->|Creates| DB_Submissions
    
    Teacher -.->|Creates| DB_Courses
    Teacher -.->|Grades| DB_Submissions
    
    Parent -.->|Views| DB_Users
    
    Admin -.->|Full Access| DB_Users
```

## Description of Architecture

1.  **User Roles**:
    *   **Student**: Accesses courses, watches lectures, takes quizzes, and submits assignments.
    *   **Teacher**: Creates courses, uploads lectures, manages content, and grades submissions.
    *   **Parent**: Links to their children's accounts to monitor progress and attendance.
    *   **Admin**: Oversees the entire platform, manages users, and handles system configurations.

2.  **Frontend**:
    *   Built with **React** and **Vite** for a fast, modern single-page application experience.
    *   Uses **Role-Based Dashboards** to show relevant information for each user type.

3.  **Backend**:
    *   **Node.js** and **Express** provide a robust RESTful API.
    *   **JWT Authentication** ensures secure access to routes.
    *   **Middleware** handles role verification (e.g., only Teachers can create courses).

4.  **Database**:
    *   **MongoDB** stores all application data in a flexible, document-oriented format.
    *   Collections include Users, Courses, Lectures, Enrollments, and Submissions.
