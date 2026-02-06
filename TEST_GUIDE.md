# DeliveryMS - Test Guide

## Quick Start

### 1. Start the System

**Backend Server:**
```bash
cd delivery-management/backend
npm run dev
```
Server runs at: http://localhost:3000

**Admin Panel:**
```bash
cd delivery-management/admin
npm run dev
```
Admin runs at: http://localhost:5176

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.com | admin123 |
| Driver | driver@delivery.com | driver123 |

---

## Test Scenarios

### A. Authentication

1. **Login Test**
   - Go to http://localhost:5176/login
   - Enter: `admin@delivery.com` / `admin123`
   - Expected: Redirect to Dashboard

2. **Invalid Login Test**
   - Enter wrong password
   - Expected: Error message "Invalid credentials"

3. **Logout Test**
   - Click "Sign Out" in sidebar
   - Expected: Redirect to Login page

---

### B. Dashboard

URL: http://localhost:5176/

**Check:**
- [ ] 4 stat cards displayed (Total, Pending, In Transit, Delivered)
- [ ] Recent shipments table
- [ ] "New Shipment" button works

---

### C. Shipment Management

#### C1. View Shipments
URL: http://localhost:5176/shipments

**Check:**
- [ ] Shipment list displayed
- [ ] Status badges with colors
- [ ] Search by tracking number works
- [ ] Filter by status works
- [ ] Pagination works

#### C2. Create New Shipment
URL: http://localhost:5176/shipments/new

**Test Data:**
```
Sender:
  Name: John Sender
  Phone: 010-1234-5678
  Address: Seoul, Gangnam-gu, 123

Recipient:
  Name: Jane Recipient
  Phone: 010-8765-4321
  Address: Busan, Haeundae-gu, 456

Package:
  Weight: 2.5
  Size: Medium
  Description: Electronics
```

**Check:**
- [ ] Form validation works (required fields)
- [ ] Submit creates shipment
- [ ] Success screen shows tracking number
- [ ] QR code displayed

#### C3. View Shipment Detail
Click "View" on any shipment

**Check:**
- [ ] Sender/Recipient info displayed
- [ ] Package info displayed
- [ ] Status history timeline
- [ ] QR code in sidebar

#### C4. Change Status
Click "Change Status" button

**Check:**
- [ ] Status dropdown works
- [ ] Note field accepts input
- [ ] Status updates after save
- [ ] History timeline updates

#### C5. Assign Driver
Click "Assign Driver" button

**Check:**
- [ ] Driver list displayed
- [ ] Can select and assign driver
- [ ] Driver shows in shipment detail

#### C6. Print Label
Click "Print Label" button

**Check:**
- [ ] Label preview displayed (4x6 format)
- [ ] QR code visible
- [ ] Barcode visible
- [ ] Print button works

---

### D. User Management (Admin Only)

URL: http://localhost:5176/users

#### D1. View Users
**Check:**
- [ ] User list displayed
- [ ] Role badges (Admin/Driver/Dispatcher)
- [ ] Status badges (Active/Inactive)
- [ ] Search works
- [ ] Filter by role works

#### D2. Create User
Click "Add User" button

**Test Data:**
```
Name: Test Driver
Email: test.driver@delivery.com
Password: test1234
Phone: 010-0000-0000
Role: Driver
Status: Active
```

**Check:**
- [ ] Form validation works
- [ ] User created successfully
- [ ] New user appears in list

#### D3. Edit User
Click "Edit" on any user

**Check:**
- [ ] Form pre-filled with user data
- [ ] Can update fields
- [ ] Changes saved successfully

#### D4. Deactivate User
Click "Deactivate" on active user

**Check:**
- [ ] Confirmation dialog appears
- [ ] User status changes to Inactive

---

### E. API Documentation

URL: http://localhost:3000/api-docs

**Check:**
- [ ] Swagger UI loads
- [ ] All endpoints listed
- [ ] Can test endpoints directly

---

## API Quick Test (Optional)

### Login API
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@delivery.com","password":"admin123"}'
```

### Get Shipments
```bash
curl http://localhost:3000/api/shipments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Track Shipment (Public)
```bash
curl http://localhost:3000/api/shipments/track/PKG-XXXXXXXX-XXXXX
```

---

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify `.env` database settings
- Run `npx prisma migrate dev`

### Admin panel won't start
- Run `npm install` in admin folder
- Check port 5176 is available

### Login fails
- Reset database: `npx prisma migrate reset`
- This recreates admin account

---

## Database Access

```bash
cd backend
npx prisma studio
```
Opens database browser at http://localhost:5555

---

## Support

For issues, check:
1. Backend console for API errors
2. Browser console (F12) for frontend errors
3. Network tab for failed requests
