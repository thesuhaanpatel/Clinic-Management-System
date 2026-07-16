 🏥 Clinic Management System

A modern, lightweight Clinic Management System built with Next.js, designed for small clinics that need an easy-to-use web application without relying on expensive cloud infrastructure.

 ✨ Features

 👨‍⚕️ Patient Management
- Add new patients
- Store patient information
- Search patient records
- View patient history

 📅 Appointment Management
- Create appointments
- Assign doctors
- Manage appointment schedules
- Track upcoming visits

 👨‍⚕️ Doctor Management
- Add and manage doctors
- Store specialties
- Employment type support

 💳 Membership Plans
- Create membership plans
- Register members
- Track memberships

 🔒 Admin Dashboard
- Centralized dashboard
- Clinic overview
- Manage doctors
- Manage patients
- Manage memberships

 🖥️ Receptionist Dashboard
- Add patients
- Book appointments
- Register memberships
- Simple workflow for front desk staff

---

 🛠️ Tech Stack

- Framework: Next.js 15
- Language: TypeScript
- UI: React
- Styling:** Tailwind CSS
- Components: shadcn/ui
- Database: SQLite
- ORM: Drizzle ORM
- Validation: Zod
- Forms: React Hook Form
- Icons: Lucide React

 🚀 Getting Started

 Clone the repository

```bash
git clone https://github.com/yourusername/clinic-management.git
cd clinic-management
```

### Install dependencies

```bash
npm install
```

### Run database migrations

```bash
npx drizzle-kit push
```

Start development server

```bash
npm run dev
```

Open **http://localhost:3000**


Database

 This project uses SQLite with Drizzle ORM, making it ideal for small clinics that prefer local data storage without recurring cloud database costs.


Future Improvements

- Authentication & Role-Based Access
- Billing & Invoice Generation
- Prescription Management
- Patient Visit Timeline
- Medical Records Upload
- SMS/WhatsApp Appointment Reminders
- Reports & Analytics
- Backup & Restore
- Multi-Clinic Support


Why This Project?

 Many small clinics don't require large, cloud-hosted hospital management systems. This project focuses on delivering a clean, fast, and cost-effective solution that can run locally while covering the essential day-to-day clinic operations.



License

This project is licensed under the MIT License.
