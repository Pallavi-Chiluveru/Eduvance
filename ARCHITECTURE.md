
# 🏗️ Project Architecture

%%{init: {
  "theme": "base",
  "flowchart": {
    "curve": "basis",
    "nodeSpacing": 45,
    "rankSpacing": 65
  },
  "themeVariables": {
    "fontSize": "18px",
    "fontFamily": "Arial"
  }
}}%%

flowchart LR

%% =====================================================
%% USERS
%% =====================================================

subgraph USERS["👥 USERS & ROLES"]
    direction TB

    S["🎓 Student"]
    I["👨‍🏫 Instructor"]
    R["🔍 Content Reviewer"]
    M["🧑‍🏫 Mentor"]
    A["🛡️ Platform Admin"]
end


%% =====================================================
%% FRONTEND
%% =====================================================

subgraph FRONTEND["🖥️ FRONTEND — React + Vite"]
    direction TB

    AUTH["🔐 Authentication<br/>Login • Registration • Email Verification"]

    STUDENT["🎓 Student Portal<br/>Courses • Assessments • Progress • Certificates"]

    INSTRUCTOR["👨‍🏫 Instructor Portal<br/>Course Authoring • Assessments • Analytics"]

    REVIEWER["🔍 Reviewer Portal<br/>Review • Approve • Reject • Request Changes"]

    MENTOR["🧑‍🏫 Mentor Portal<br/>Learner Progress • Feedback"]

    ADMIN["🛡️ Admin Portal<br/>Users • Categories • Approvals • Analytics"]
end


%% =====================================================
%% BACKEND
%% =====================================================

subgraph BACKEND["⚙️ BACKEND — Node.js + Express"]
    direction TB

    API["REST API"]

    AUTHAPI["Authentication & Authorization<br/>JWT • Role-Based Access"]

    COURSE["Course Management<br/>Courses • Modules • Lessons"]

    ASSESS["Assessment Engine<br/>Quizzes • Questions • Assignments"]

    LEARNING["Learning Engine<br/>Enrollment • Progress • Submissions"]

    REVIEW["Content Review Workflow<br/>Draft → Submitted → Review → Approved → Published"]

    ANALYTICS["Analytics & Notifications"]
end


%% =====================================================
%% AI
%% =====================================================

subgraph AI["🤖 AI LEARNING SERVICES"]
    direction TB

    AI1["Personalized Learning Path"]

    AI2["Weak Concept Detection"]

    AI3["Targeted Revision & Feedback"]
end


%% =====================================================
%% DATABASE
%% =====================================================

subgraph DATABASE["💾 DATABASE — MongoDB"]
    direction TB

    USERSDB[("Users & Roles")]

    COURSEDB[("Courses<br/>Modules<br/>Lessons")]

    ASSESSDB[("Quizzes<br/>Assignments<br/>Submissions")]

    LEARNDB[("Enrollments<br/>Progress")]

    REVIEWDB[("Reviews<br/>Feedback")]

    CERTDB[("Certificates<br/>Analytics<br/>Notifications")]
end


%% =====================================================
%% USER → FRONTEND
%% =====================================================

S --> STUDENT
I --> INSTRUCTOR
R --> REVIEWER
M --> MENTOR
A --> ADMIN

S --> AUTH
I --> AUTH
R --> AUTH
M --> AUTH
A --> AUTH


%% =====================================================
%% FRONTEND → BACKEND
%% =====================================================

AUTH --> API

STUDENT --> API
INSTRUCTOR --> API
REVIEWER --> API
MENTOR --> API
ADMIN --> API


%% =====================================================
%% BACKEND FLOW
%% =====================================================

API --> AUTHAPI

API --> COURSE
API --> ASSESS
API --> LEARNING
API --> REVIEW
API --> ANALYTICS


%% =====================================================
%% BACKEND → DATABASE
%% =====================================================

AUTHAPI --> USERSDB

COURSE --> COURSEDB

ASSESS --> ASSESSDB

LEARNING --> LEARNDB
LEARNING --> ASSESSDB

REVIEW --> REVIEWDB
REVIEW --> COURSEDB

ANALYTICS --> CERTDB
ANALYTICS --> LEARNDB


%% =====================================================
%% AI FLOW
%% =====================================================

LEARNDB --> AI1
ASSESSDB --> AI2

AI1 --> AI3
AI2 --> AI3

AI3 --> REVIEWDB

AI3 --> STUDENT


%% =====================================================
%% CERTIFICATE
%% =====================================================

LEARNDB -->|Course Completed| CERTDB


%% =====================================================
%% STYLING
%% =====================================================

classDef student fill:#E3F2FD,stroke:#1565C0,stroke-width:3px,color:#0D47A1;
classDef instructor fill:#FFF3E0,stroke:#EF6C00,stroke-width:3px,color:#E65100;
classDef reviewer fill:#F3E5F5,stroke:#7B1FA2,stroke-width:3px,color:#4A148C;
classDef mentor fill:#E0F7FA,stroke:#00838F,stroke-width:3px,color:#006064;
classDef admin fill:#FFEBEE,stroke:#C62828,stroke-width:3px,color:#B71C1C;

classDef frontend fill:#E8F5E9,stroke:#2E7D32,stroke-width:2px,color:#1B5E20;
classDef backend fill:#FFF8E1,stroke:#F9A825,stroke-width:2px,color:#E65100;
classDef ai fill:#EDE7F6,stroke:#5E35B1,stroke-width:2px,color:#311B92;
classDef database fill:#ECEFF1,stroke:#455A64,stroke-width:2px,color:#263238;

class S student;
class I instructor;
class R reviewer;
class M mentor;
class A admin;

class AUTH,STUDENT,INSTRUCTOR,REVIEWER,MENTOR,ADMIN frontend;

class API,AUTHAPI,COURSE,ASSESS,LEARNING,REVIEW,ANALYTICS backend;

class AI1,AI2,AI3 ai;

class USERSDB,COURSEDB,ASSESSDB,LEARNDB,REVIEWDB,CERTDB database;

## Description of Architecture

1.  **User Roles**:
    *   **Student**: Accesses courses, watches lectures, takes quizzes, and submits assignments.
    *   **Instructor**: Creates courses, uploads lectures, manages content, and grades submissions.
    *   **Admin**: Oversees the entire platform, manages users, and handles system configurations.

2.  **Frontend**:
    *   Built with **React** and **Vite** for a fast, modern single-page application experience.
    *   Uses **Role-Based Dashboards** to show relevant information for each user type.

3.  **Backend**:
    *   **Node.js** and **Express** provide a robust RESTful API.
    *   **JWT Authentication** ensures secure access to routes.
    *   **Middleware** handles role verification (e.g., only Instructors can create courses).

4.  **Database**:
    *   **MongoDB** stores all application data in a flexible, document-oriented format.
    *   Collections include Users, Courses, Lectures, Enrollments, and Submissions.
