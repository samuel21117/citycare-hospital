# CityCare Hospital: AI-Powered Hospital Appointment and E-Prescription System

CityCare Hospital is a centralized, web-based appointment booking and hospital management system designed as a localized, highly scalable, and cost-effective digital solution leveraging modern web technologies and AI. It was developed to address traditional hospital management challenges like scheduling conflicts, lost prescriptions, and inventory mismanagement.

## Features

### 👨‍⚕️ Doctor Module
- **Schedule Management**: Dashboard displaying pending, scheduled, and completed appointments.
- **Teleconsultation Room**: Embedded video conferencing (via Jitsi) directly within the UI for online appointments.
- **E-Prescription Pad**: Integrated prescription system to select available medicines, assign dosages, and push directly to the pharmacy.

### 🤒 Patient Module
- **Appointment Booking**: Schedule in-person or online consultations based on primary symptoms.
- **My Prescriptions**: Read-only view of prescribed medications.
- **AI Health Assistant**: Integrated chatbot powered by Google Gemini AI to act as a preliminary health assistant for patient triage and operational guidance.

### 💊 Pharmacy Module
- **Prescription Fulfillment**: Real-time queue to review doctor's notes and dispense drugs.
- **Inventory Management**: Track medicine stock levels with automated low-stock thresholds and pricing tracking.

### 🛡️ Admin Module
- **System Overview**: Analytics dashboards (powered by Recharts) showing appointment volumes, pharmacy inventory value, and user demographics.
- **User Management**: Assign roles (doctor, pharmacy, admin) to registered accounts.

## Tech Stack

- **Frontend**: React 19, Vite 7, TailwindCSS, React Router v7, Jitsi React SDK, Recharts
- **Backend**: Node.js, Express.js, Google Gemini API (`@google/genai`)
- **Database & Auth**: Supabase (PostgreSQL with Row Level Security, Supabase Auth)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project
- Google Gemini API Key

## Getting Started

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd citycare-hospital
   ```

2. **Install dependencies**:
   Run the following command in the root directory to install backend dependencies:
   ```bash
   npm install
   ```
   You will also need to install the frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory based on the provided configuration in the project. You will typically need:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   # Add any other required backend environment variables here
   ```
   You will also need to configure the Supabase URL and Anon Key in your frontend environment variables.

4. **Database Setup**:
   Run the SQL scripts provided in the root directory to set up your Supabase database:
   - `supabase_schema.sql`: Sets up the database tables (users, appointments, prescriptions, medicines) and automated triggers.
   - `rls_policies.sql`: Configures Row Level Security (RLS) to ensure data privacy.

5. **Run the Application**:
   You can run both the frontend and backend concurrently from the root directory:
   ```bash
   npm run dev
   ```
   This will start the backend Express server and the frontend Vite development server.

## Security & Privacy
Data privacy is enforced at the database level using PostgreSQL Row Level Security (RLS) policies. This ensures that sensitive Protected Health Information (PHI) is only accessible to authorized roles (e.g., a patient can only see their own appointments, a doctor can only see their assigned patients).
