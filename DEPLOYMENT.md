# QuetzalEnvios - Guia de Despliegue en Servidor

## Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org/))
- **PostgreSQL** 15+ ([postgresql.org](https://www.postgresql.org/download/))
- **npm** (included with Node.js)

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/adambrookssolution-sketch/Delivery-management.git
cd Delivery-management
```

---

## Step 2: Database Setup

### 2.1 Create Database

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE delivery_db;
```

### 2.2 Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/delivery_db"
JWT_SECRET="your-jwt-secret-key-change-this"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-this"
PORT=3000
```

---

## Step 3: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate deploy

# Seed test data (creates test accounts)
npx prisma db seed

# Start server
npm run dev
```

The API server runs at: **http://YOUR_SERVER_IP:3000**

### Verify Backend

Open in browser: `http://YOUR_SERVER_IP:3000/api-docs`

You should see the Swagger API documentation.

---

## Step 4: Admin Panel Setup

```bash
cd admin

# Install dependencies
npm install

# Start development server
npm run dev
```

The admin panel runs at: **http://YOUR_SERVER_IP:5176**

---

## Step 5: Mobile App Setup

### Option A: Using Expo Go (Recommended for Testing)

1. Install **Expo Go** on your Android phone from Google Play Store
2. On the server machine:

```bash
cd mobile

# Install dependencies
npm install --legacy-peer-deps

# IMPORTANT: Update the server URL
# Edit mobile/services/api.js
# Change: const SERVER_URL = 'http://YOUR_SERVER_IP:3000';
```

3. Start Expo:

```bash
npx expo start
```

4. Scan the QR code with Expo Go app

### Option B: Using APK (if provided)

1. Install the APK on your Android device
2. The APK connects to the server URL configured during build
3. Make sure the backend server is running and accessible from the device

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.com | admin123 |
| Dispatcher | dispatcher@delivery.com | dispatcher123 |
| Driver 1 | driver1@delivery.com | driver123 |
| Driver 2 | driver2@delivery.com | driver123 |

---

## Quick Test Flow

### Admin Panel Test

1. Open `http://YOUR_SERVER_IP:5176` in browser
2. Login with: `admin@delivery.com` / `admin123`
3. Check: Dashboard stats, Shipment list, Create new shipment

### Mobile App Test

1. Open the app / Expo Go
2. Login with: `driver1@delivery.com` / `driver123`
3. Check: Dashboard stats, Deliveries list, Delivery detail
4. Test: Status change, Delivery completion flow

---

## Troubleshooting

### Backend won't start
- Verify PostgreSQL is running: `pg_isready`
- Check `.env` database credentials
- Run migrations: `npx prisma migrate deploy`

### Admin panel won't load
- Check backend is running first
- Verify port 5176 is available

### Mobile app can't connect
- Ensure backend server is accessible from the phone's network
- Update `SERVER_URL` in `mobile/services/api.js` to match your server IP
- Both phone and server must be on the same network (or server must be publicly accessible)

### Reset database
```bash
cd backend
npx prisma migrate reset
```
This recreates all tables and test accounts.

---

## Production Notes

- Change `JWT_SECRET` and `JWT_REFRESH_SECRET` to strong random values
- Use `npm start` instead of `npm run dev` for production
- Consider using a process manager like PM2: `pm2 start src/app.js`
- For HTTPS, put behind a reverse proxy (nginx/caddy)
