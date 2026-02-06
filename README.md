# DeliveryMS - Delivery Management System

A complete delivery/logistics management platform with Admin Panel, REST API, and Mobile Driver App.

## Features

### Admin Panel
- **Dashboard** - Overview statistics and recent shipments
- **Shipment Management** - Create, track, and manage deliveries
- **User Management** - Manage admins, drivers, and dispatchers
- **Label Printing** - Generate 4x6 shipping labels with QR codes

### Backend API
- RESTful API with JWT authentication
- Role-based access control (Admin, Driver, Dispatcher)
- Shipment tracking with status history
- File upload for signatures and photos
- Swagger API documentation

### Mobile Driver App
- **Login** - JWT authentication with token refresh
- **Dashboard** - Delivery stats overview (Total, Pending, In Delivery, Delivered)
- **Deliveries** - View assigned shipments with filter tabs (All/Pending/Active/Delivered)
- **Delivery Detail** - Full shipment info, recipient/sender cards, package details, status timeline
- **Status Updates** - Progress shipments through PENDING > PICKED_UP > IN_TRANSIT > OUT_FOR_DELIVERY > DELIVERED
- **Delivery Completion** - 3-step flow: Photo capture > Delivery code > Confirmation
- **Camera** - Take proof-of-delivery photos with flash toggle and front/back camera switch
- **Navigation** - Open maps to recipient location (Google Maps / Apple Maps)
- **Call** - One-tap call to recipient phone number
- **Profile** - View driver info, change password, logout
- **Pull-to-Refresh** - Refresh data on all screens
- **Offline Detection** - Alert when no internet connection

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Admin Panel | React, Vite |
| Mobile App | React Native, Expo SDK 54 |
| Navigation | Expo Router |
| Authentication | JWT |
| API Docs | Swagger/OpenAPI |

---

## Project Structure

```
delivery-management/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── controllers/    # API controllers
│   │   ├── middlewares/    # Auth, validation
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── uploads/            # Uploaded files
│
├── admin/                   # React Admin Panel
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       ├── context/        # Auth context
│       └── services/       # API services
│
├── mobile/                  # React Native Driver App
│   ├── app/
│   │   ├── index.jsx       # Login screen
│   │   ├── _layout.jsx     # Root layout
│   │   ├── (tabs)/         # Tab navigation
│   │   │   ├── index.jsx   # Dashboard
│   │   │   ├── deliveries.jsx
│   │   │   └── profile.jsx
│   │   └── delivery/
│   │       └── [id].jsx    # Delivery detail + completion
│   ├── components/         # StatusBadge, DeliveryCard
│   ├── context/            # AuthContext
│   └── services/           # API service (axios)
│
├── README.md               # This file
└── TEST_GUIDE.md           # Testing guide
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### 1. Database Setup

Create PostgreSQL database:
```sql
CREATE DATABASE delivery_db;
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
npx prisma migrate dev

# Seed database (creates test accounts)
npx prisma db seed

# Start server
npm run dev
```

Backend runs at: **http://localhost:3000**

### 3. Admin Panel Setup

```bash
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
```

Admin runs at: **http://localhost:5176**

### 4. Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install --legacy-peer-deps

# Start Expo dev server
npx expo start
```

Then:
- **Android**: Open Expo Go app, scan QR code or connect via `exp://YOUR_IP:8081`
- **iOS**: Open Expo Go app, scan QR code (requires Mac + Xcode for simulator)

> **Note**: Update `LOCAL_IP` in `mobile/services/api.js` to your PC's local IP address for device/emulator testing.

---

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.com | admin123 |
| Dispatcher | dispatcher@delivery.com | dispatcher123 |
| Driver 1 | driver1@delivery.com | driver123 |
| Driver 2 | driver2@delivery.com | driver123 |

---

## API Documentation

Swagger UI: **http://localhost:3000/api-docs**

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Current user info |
| PUT | /api/auth/password | Change password |
| GET | /api/shipments | List shipments |
| POST | /api/shipments | Create shipment |
| GET | /api/shipments/:id | Shipment detail |
| PUT | /api/shipments/:id/status | Update status |
| POST | /api/shipments/:id/deliver | Complete delivery |
| GET | /api/shipments/driver/my | Driver's assigned shipments |
| GET | /api/shipments/track/:tracking | Public tracking |
| POST | /api/uploads/photo | Upload delivery photo |
| GET | /api/users | List users (Admin) |
| POST | /api/users | Create user (Admin) |

---

## Shipment Statuses

| Status | Description |
|--------|-------------|
| PENDING | Awaiting pickup |
| PICKED_UP | Picked up from sender |
| IN_TRANSIT | In transit to destination |
| OUT_FOR_DELIVERY | Out for final delivery |
| DELIVERED | Successfully delivered |
| FAILED | Delivery failed |
| RETURNED | Returned to sender |

---

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/delivery_db"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=3000
```

---

## Testing

See [TEST_GUIDE.md](./TEST_GUIDE.md) for detailed testing instructions.

---

## Roadmap

- [x] **Milestone 1**: Backend API + Admin Panel
- [x] **Milestone 2**: Mobile App (Driver)
- [ ] **Milestone 3**: Customer Tracking Website
- [ ] **Milestone 4**: Advanced Features (Notifications, Reports)

---

## License

Private - All rights reserved
