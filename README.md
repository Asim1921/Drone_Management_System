# DMS - Pakistan Drone Management System

A comprehensive web portal for managing drone registration, licensing, and operations in Pakistan.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: MongoDB with Mongoose

## Features

- User authentication with JWT
- **Two-Factor Authentication (2FA)** - Choose between Email or SMS verification
- **SMS OTP verification** for Pakistani phone numbers (+92)
- **Email OTP verification** as alternative 2FA method
- Role-based access control (6 user roles)
- License Registration Module
- Operator/Pilot Registration Module
- Vendor/Manufacturer Registration Module
- Dashboard with role-based views

## User Roles

1. **System Administrator** - Full system access
2. **CAA Officer** - Approves licenses and manages compliance
3. **Operator/Pilot** - Applies for licenses and manages flights
4. **Vendor/Manufacturer** - Registers products and maintains compliance
5. **Enforcement/Intelligence Agencies** - Monitors and enforces compliance
6. **Audit & Reporting Officer** - Generates reports and tracks data

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. Set up environment variables:

**Backend** (`backend/.env`):
```
PORT=5050
MONGODB_URI=mongodb://localhost:27017/keyrex
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
NODE_ENV=development

# Email Configuration (for OTP verification)
EMAIL_USER=zahmedasim@gmail.com
EMAIL_APP_PASSWORD=ivfglysvxpgapurr

# Twilio SMS Configuration (for SMS OTP verification)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
```

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5050/api
```

4. Start MongoDB (if running locally):
```bash
# Windows
mongod

# Linux/Mac
sudo systemctl start mongod
```

5. Seed the database with initial data:

```bash
# From backend directory
npm run seed
```

This will create:
- 7+ users (admin, CAA officer, operators, vendors, enforcement, audit officer)
- 2 vendors (local and foreign)
- 50+ drone models
- 10+ operators with training records
- 23+ licenses (individual, commercial, government)

**Test Credentials:**
- Email: `admin@dms.gov.pk` | Password: `password123`
- Email: `caa.officer@dms.gov.pk` | Password: `password123`
- Email: `operator1@dms.gov.pk` | Password: `password123`
- Email: `vendor1@dms.gov.pk` | Password: `password123`

All users have verified emails and can login directly.

## Two-Factor Authentication (2FA)

The system supports two methods of 2FA:

1. **Email Verification** (Default)
   - OTP is sent to user's email address
   - 6-digit code valid for 10 minutes

2. **SMS Verification**
   - OTP is sent to Pakistani phone number (+92)
   - Supports formats: `+92XXXXXXXXXX`, `03XXXXXXXXX`, or `3XXXXXXXXX`
   - 6-digit code valid for 10 minutes

### Setting up Twilio for SMS

Your Twilio credentials are already configured in the `.env` example above. 

**To activate SMS functionality:**
1. Create a `backend/.env` file with the configuration shown above
2. Add your Twilio credentials from your Twilio dashboard:
   ```
   TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_PHONE_NUMBER=your_twilio_phone_number_here
   ```
3. Restart your backend server

**Security Note:** Never commit your `.env` file to version control (it's already in `.gitignore`). Keep your Twilio credentials secure.

**Note:** If Twilio credentials are not configured, OTP codes will be logged to the console in development mode instead of being sent via SMS. With the credentials above, SMS will work properly.

6. Start the development servers:

```bash
# Backend (from backend directory)
npm run dev

# Frontend (from frontend directory)
npm run dev
```

7. Open [http://localhost:3050](http://localhost:3050) in your browser

## Project Structure

```
KeyRex/
├── frontend/          # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # Reusable UI components
│   ├── lib/          # Utilities, API clients
│   └── contexts/     # React contexts
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── utils/
│   └── config/
└── shared/           # Shared types/interfaces
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (sends OTP via email or SMS based on user choice)
  - Body: `{ email, password, role, profile: { firstName, lastName, phone }, twoFactorMethod: 'email' | 'sms' }`
- `POST /api/auth/login` - User login (requires email or phone verification based on 2FA method)
- `POST /api/auth/verify-email` - Verify email with OTP code
- `POST /api/auth/verify-phone` - Verify phone with SMS OTP code
- `POST /api/auth/resend-otp` - Resend OTP code (email or SMS)
  - Body: `{ email, method: 'email' | 'sms' }`
- `GET /api/auth/me` - Get current user

### Licenses
- `POST /api/licenses` - Create license application
- `GET /api/licenses` - List licenses
- `GET /api/licenses/:id` - Get license details
- `PUT /api/licenses/:id/approve` - Approve license (CAA)
- `PUT /api/licenses/:id/renew` - Renew license
- `PUT /api/licenses/:id/suspend` - Suspend license

### Operators
- `POST /api/operators` - Register operator
- `GET /api/operators` - List operators
- `GET /api/operators/:id` - Get operator details
- `PUT /api/operators/:id` - Update operator
- `PUT /api/operators/:id/blacklist` - Blacklist operator

### Vendors
- `POST /api/vendors` - Register vendor
- `GET /api/vendors` - List vendors
- `GET /api/vendors/:id` - Get vendor details
- `POST /api/vendors/:id/models` - Register drone model
- `GET /api/vendors/:id/models` - List vendor models

## Development

The project uses:
- **React Hook Form** with **Zod** for form validation
- **TanStack Query** for server state management
- **Axios** for API communication
- **date-fns** for date formatting

## License

This project is part of the Pakistan Drone Management System.

