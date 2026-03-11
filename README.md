# Digital Learning Support and Evaluation System (DLSES)

DLSES is a comprehensive educational platform designed to bridge the gap between students, teachers, parents, and administrators. It provides a robust environment for course management, assessments, and AI-driven learning assistance.

## 🚀 Key Features

- **Multi-Role Dashboards**: Tailored experiences for Students, Teachers, Parents, and Admins.
- **Course Management**: Effortlessly organize and access educational content.
- **Secure Assessments**: Integrated testing and grading modules.
- **AI Learning Assistant**: Real-time support for subject-specific queries.
- **Real-time Notifications**: Keep everyone updated on progress and announcements.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT, Bcrypt
- **Deployment**: Vercel (Frontend), Render (Backend)

## 📦 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB Atlas account
- Docker & Docker Compose (optional)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/eduvance.git
   cd eduvance
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

### Running with Docker

```bash
docker-compose up --build
```

## 📄 License

This project is licensed under the MIT License.
