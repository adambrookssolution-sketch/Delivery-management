# QuetzalEnvios - Sistema de Gestion de Envios

Plataforma completa de gestion de envios y logistica con Panel de Administracion, API REST, Aplicacion Movil para Conductores y Pagina de Rastreo Publico.

## Caracteristicas

### Panel de Administracion
- **Panel Principal** - Estadisticas generales y envios recientes
- **Gestion de Envios** - Crear, rastrear y administrar entregas
- **Gestion de Usuarios** - Administrar administradores, conductores y despachadores
- **Impresion de Etiquetas** - Generar etiquetas de envio 4x6 con codigos QR

### API Backend
- API RESTful con autenticacion JWT
- Control de acceso basado en roles (Admin, Conductor, Despachador)
- Rastreo de envios con historial de estados
- Carga de archivos para firmas y fotos
- Documentacion Swagger API

### Aplicacion Movil (Conductor)
- **Inicio de Sesion** - Autenticacion JWT con renovacion de token
- **Panel Principal** - Estadisticas de entregas (Total, Pendientes, En Entrega, Entregados)
- **Entregas** - Ver envios asignados con filtros (Todos/Pendientes/Activos/Entregados)
- **Detalle de Entrega** - Info completa, tarjetas de destinatario/remitente, detalles del paquete, linea de tiempo
- **Actualizacion de Estado** - Progresar envios: PENDIENTE > RECOGIDO > EN TRANSITO > EN CAMINO > ENTREGADO
- **Completar Entrega** - Flujo de 3 pasos: Foto > Codigo de entrega > Confirmacion
- **Camara** - Fotos de prueba de entrega con flash y cambio de camara
- **Navegacion** - Abrir mapas hacia la ubicacion del destinatario
- **Llamar** - Llamada directa al numero del destinatario
- **Perfil** - Ver info del conductor, cambiar contrasena, cerrar sesion
- **Actualizar** - Deslizar para actualizar datos en todas las pantallas
- **Modo Offline** - Cola automatica de solicitudes sin conexion, se envian al reconectar

### Rastreo Publico
- Pagina web publica para rastrear envios por numero de seguimiento
- Linea de tiempo visual del estado del envio
- No requiere autenticacion

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

## Estados de Envio

| Estado | Descripcion |
|--------|-------------|
| PENDING | Pendiente - Esperando recogida |
| PICKED_UP | Recogido - Recogido del remitente |
| IN_TRANSIT | En Transito - En camino al destino |
| OUT_FOR_DELIVERY | En Camino - En entrega final |
| DELIVERED | Entregado - Entregado exitosamente |
| FAILED | Fallido - Entrega fallida |
| RETURNED | Devuelto - Devuelto al remitente |

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

## Progreso del Proyecto

- [x] **Milestone 1**: Backend API + Panel de Administracion + Rastreo Publico
- [x] **Milestone 2**: Aplicacion Movil (Conductor)
- [x] **Milestone 3**: Traduccion a Espanol + Modo Offline + Rebranding

---

## License

Private - All rights reserved
