# QuetzalEnvios - Test Guide

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

**Mobile App:**
```bash
cd delivery-management/mobile
npm install --legacy-peer-deps
npx expo start
```
Open Expo Go on your device and scan the QR code.

> **Note**: Update `LOCAL_IP` in `mobile/services/api.js` to your PC's local IP for device testing.

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@delivery.com | admin123 |
| Dispatcher | dispatcher@delivery.com | dispatcher123 |
| Driver 1 | driver1@delivery.com | driver123 |
| Driver 2 | driver2@delivery.com | driver123 |

---

## Test Scenarios - Admin Panel

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

## Test Scenarios - Mobile Driver App

### F. Mobile App - Authentication

1. **Login Screen**
   - Open the app in Expo Go
   - Expected: Login screen with DeliveryMS logo, email/password fields

2. **Login with Driver Account**
   - Enter: `driver1@delivery.com` / `driver123`
   - Tap "Sign In"
   - Expected: Navigate to Dashboard with greeting "Hello, John Driver"

3. **Invalid Login**
   - Enter wrong credentials
   - Expected: Red error message displayed

---

### G. Mobile App - Dashboard

**Check:**
- [ ] Greeting shows driver name
- [ ] 4 stat cards: Total, Pending, In Delivery, Delivered
- [ ] Stats reflect actual assigned shipments
- [ ] "View All Deliveries" button navigates to Deliveries tab
- [ ] Active deliveries list shows non-delivered shipments
- [ ] Pull down to refresh updates data
- [ ] Tapping a delivery card opens detail screen

---

### H. Mobile App - Deliveries List

**Check:**
- [ ] "My Deliveries" title with shipment count
- [ ] Filter tabs: All, Pending, Active, Delivered
- [ ] "All" shows all assigned shipments
- [ ] "Pending" shows only PENDING/PICKED_UP shipments
- [ ] "Active" shows only IN_TRANSIT/OUT_FOR_DELIVERY shipments
- [ ] "Delivered" shows only DELIVERED shipments
- [ ] Empty state shown when no shipments match filter
- [ ] Pull down to refresh
- [ ] Tapping a card opens delivery detail

---

### I. Mobile App - Delivery Detail

**Check:**
- [ ] Back button returns to previous screen
- [ ] Status badge displayed (correct color per status)
- [ ] Tracking number displayed
- [ ] Recipient card: name, phone, address
- [ ] "Call" button present (opens phone dialer on real device)
- [ ] "Navigate" button present (opens maps app on real device)
- [ ] Sender card: name, phone, address
- [ ] Package card: weight, size, description
- [ ] Timeline shows full status history with timestamps
- [ ] Note input field (optional)

---

### J. Mobile App - Status Changes

Test the full delivery flow by progressing through each status:

1. **PENDING > PICKED_UP**
   - Open a PENDING shipment
   - Tap "Pick Up Package" (blue button)
   - Confirm in dialog
   - Expected: Status changes, timeline updates

2. **PICKED_UP > IN_TRANSIT**
   - Tap "Start Transit" (purple button)
   - Expected: Status changes to IN_TRANSIT

3. **IN_TRANSIT > OUT_FOR_DELIVERY**
   - Tap "Out for Delivery" (cyan button)
   - Expected: Status changes to OUT_FOR_DELIVERY

4. **OUT_FOR_DELIVERY > DELIVERED** (Completion Flow)
   - Tap "Complete Delivery" (green button)
   - Expected: 3-step completion modal opens

---

### K. Mobile App - Delivery Completion

When "Complete Delivery" is tapped on an OUT_FOR_DELIVERY shipment:

**Step 1: Photo**
- [ ] Camera permission requested
- [ ] "Open Camera" button opens full-screen camera
- [ ] Flash toggle button (on/off)
- [ ] Front/back camera switch button
- [ ] Capture button takes photo
- [ ] Photo preview with "Retake" and "Next" options
- [ ] "Skip photo" option available

**Step 2: Delivery Code** (if shipment has delivery code)
- [ ] 6-digit code input with large numbers
- [ ] "Next" button disabled until 6 digits entered
- [ ] Keyboard shows number pad

**Step 3: Confirm**
- [ ] Summary shows recipient name, photo status, code
- [ ] "Confirm Delivery" button submits to API
- [ ] Success alert: "Delivery Complete!"
- [ ] Returns to deliveries list
- [ ] Shipment now appears under "Delivered" filter

---

### L. Mobile App - Profile

**Check:**
- [ ] Avatar with first letter of name
- [ ] Name and role displayed
- [ ] Email, phone, role info cards
- [ ] "Change Password" expandable section
- [ ] Password change form (current, new, confirm)
- [ ] Password validation (min 6 chars, must match)
- [ ] "Sign Out" button with confirmation dialog
- [ ] After logout, returns to login screen
- [ ] App version "DeliveryMS Driver v1.0.0" at bottom

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

### Mobile app won't connect
- Ensure backend is running on port 3000
- Update `LOCAL_IP` in `mobile/services/api.js` to your PC's IP
- Ensure phone/emulator is on the same network as your PC
- For Android emulator: use `10.0.2.2` as IP

### Login fails
- Reset database: `npx prisma migrate reset`
- This recreates all test accounts

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
4. Metro bundler console for mobile app errors
