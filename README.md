# DeliveryMS - Delivery Management System

A complete delivery/logistics management platform with Admin Panel and REST API.

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

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js, Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Admin Panel | React, Vite |
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

# Seed database (creates admin account)
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

---

## Default Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.com | admin123 |
| Driver | driver@delivery.com | driver123 |

---

## API Documentation

Swagger UI: **http://localhost:3000/api-docs**

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | User login |
| GET | /api/auth/me | Current user info |
| GET | /api/shipments | List shipments |
| POST | /api/shipments | Create shipment |
| GET | /api/shipments/:id | Shipment detail |
| PUT | /api/shipments/:id/status | Update status |
| GET | /api/shipments/track/:tracking | Public tracking |
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
- [ ] **Milestone 2**: Mobile App (Driver)
- [ ] **Milestone 3**: Customer Tracking Website
- [ ] **Milestone 4**: Advanced Features (Notifications, Reports)

---

## License

Private - All rights reserved
