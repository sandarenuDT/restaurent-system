# 🍽️ Restaurant Management System

A production-grade full-stack restaurant operations platform that replaces paper-based workflows with four real-time digital interfaces — customer ordering, waiter management, kitchen display, and admin analytics.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=flat&logo=socket.io)](https://socket.io/)

---

## ✨ Features

### Customer Menu
- Scan a QR code at the table — no app install needed
- Browse menu by category with photos, descriptions, and prices
- Add items to cart with special instructions (e.g. "no onions")
- Track order status in real time

### Waiter App
- Live table grid showing status (Empty / Occupied / Waiting / Bill Requested)
- View all active orders per table
- Mark items as served
- Generate and request bills

### Kitchen Display
- Real-time incoming orders — no page refresh needed
- Color-coded urgency: 🔴 New → 🟡 In Progress → 🟢 Done
- Mark individual items as preparing / ready

### Admin Dashboard
- Today's revenue, order count, and table occupancy at a glance
- Add / edit / delete menu items with image upload
- Manage staff accounts with role-based access
- Daily and weekly sales reports

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     4 Interfaces                         │
│  Customer Menu │ Waiter App │ Kitchen Display │ Admin    │
└────────────────────────┬────────────────────────────────┘
                         │  REST API + WebSocket
┌────────────────────────▼────────────────────────────────┐
│              Node.js + Express Backend                    │
│  Auth │ Menu │ Orders │ Tables │ Sessions │ Billing      │
└────────────────────────┬────────────────────────────────┘
                         │  Prisma ORM
┌────────────────────────▼────────────────────────────────┐
│                   PostgreSQL Database                     │
│  Staff │ Tables │ Menu │ Orders │ Sessions │ Bills       │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Role-Based Access Control

| Role    | Customer Menu | Waiter App | Kitchen Display | Admin Panel |
|---------|:---:|:---:|:---:|:---:|
| Public  | ✅ | ❌ | ❌ | ❌ |
| WAITER  | ✅ | ✅ | ❌ | ❌ |
| KITCHEN | ❌ | ❌ | ✅ | ❌ |
| ADMIN   | ✅ | ✅ | ✅ | ✅ |

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| TypeScript | Type safety across entire backend |
| PostgreSQL | Primary database |
| Prisma ORM | Type-safe database queries and migrations |
| Socket.io | Real-time WebSocket communication |
| JWT + Refresh Tokens | Authentication and session management |
| Zod | Request body validation |
| Cloudinary | Menu item image storage and delivery |
| Multer | Multipart file upload handling |
| bcryptjs | Password hashing |
| QRCode | QR code generation per table |

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type-safe components and API calls |
| Tailwind CSS | Utility-first styling |
| React Router v6 | Client-side routing |
| Socket.io Client | Real-time order updates |
| Axios | HTTP client with interceptors |
| Recharts | Revenue and analytics charts |
| React Hot Toast | Toast notifications |

---

## 📁 Project Structure

```
restaurant-system/
├── server/
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts             # Prisma client
│   │   │   ├── socket.ts         # Socket.io init + auth guard
│   │   │   └── cloudinary.ts     # Cloudinary + multer config
│   │   ├── middleware/
│   │   │   ├── auth.ts           # JWT verify + role check
│   │   │   ├── rateLimiter.ts    # Request rate limiting
│   │   │   └── errorHandler.ts   # Global error handler
│   │   ├── routes/
│   │   │   ├── auth.ts           # Login, refresh, seed
│   │   │   ├── menu.ts           # Menu CRUD + image upload
│   │   │   ├── tables.ts         # Table management + QR
│   │   │   ├── orders.ts         # Place + update orders
│   │   │   ├── sessions.ts       # Table session lifecycle
│   │   │   ├── billing.ts        # Bill generation + payment
│   │   │   ├── admin.ts          # Dashboard + reports
│   │   │   └── staff.ts          # Staff management
│   │   ├── sockets/
│   │   │   ├── orderHandlers.ts  # New order → kitchen event
│   │   │   ├── kitchenHandlers.ts# Ready → waiter notification
│   │   │   ├── tableHandlers.ts  # Table status broadcasts
│   │   │   └── billingHandlers.ts# Bill request events
│   │   ├── utils/
│   │   │   ├── tokens.ts         # JWT helpers
│   │   │   ├── qrGenerator.ts    # QR code generation
│   │   │   ├── billCalculator.ts # Tax, totals, discounts
│   │   │   └── printer.ts        # Thermal receipt formatter
│   │   └── index.ts              # Express + Socket.io entry
│   ├── .env.example
│   └── package.json
│
└── client/
    ├── src/
    │   ├── pages/
    │   │   ├── CustomerMenu/     # Customer-facing menu
    │   │   ├── Kitchen/          # Kitchen display screen
    │   │   ├── Waiter/           # Waiter dashboard
    │   │   └── Admin/            # Admin panel
    │   ├── components/           # Shared UI components
    │   ├── context/              # Auth, Cart, Socket context
    │   ├── hooks/                # useSocket, useOrders, etc.
    │   └── api/                  # Axios API modules
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Cloudinary account (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/restaurant-system.git
cd restaurant-system
```

### 2. Set up the backend

```bash
cd server
npm install
```

Copy the environment file and fill in your values:

```bash
cp .env.example .env
```

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/restaurant_db
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Run database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Seed the admin account:

```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3001/api/auth/seed
```

### 3. Set up the frontend

```bash
cd ../client
npm install
npm run dev
```

### 4. Open the app

| Interface | URL | Credentials |
|---|---|---|
| Admin Panel | http://localhost:5173/admin | admin@restaurant.com / admin123 |
| Waiter App | http://localhost:5173/waiter | waiter@restaurant.com / waiter123 |
| Kitchen Display | http://localhost:5173/kitchen | kitchen@restaurant.com / kitchen123 |
| Customer Menu | http://localhost:5173/menu?table=TABLE_ID | No login needed |

---

## 🔄 Real-Time Flow

```
Customer scans QR → Opens menu → Places order
         │
         ▼
Waiter receives notification → Confirms order
         │
         ▼
Kitchen display updates instantly (Socket.io)
         │
         ▼
Chef marks items ready → Waiter notified
         │
         ▼
Waiter marks as served → Customer requests bill
         │
         ▼
Bill generated with tax → Payment recorded → Table freed
```

---

## 📡 API Reference

### Authentication
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/login` | Public | Login and get tokens |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/auth/me` | Any role | Get current user |

### Menu
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/menu` | Public | Get full menu with categories |
| POST | `/api/menu/items` | Admin | Create item with image |
| PATCH | `/api/menu/items/:id` | Admin | Update item |
| PATCH | `/api/menu/items/:id/toggle` | Admin | Toggle availability |
| DELETE | `/api/menu/items/:id` | Admin | Delete item |

### Orders
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/orders` | Waiter | Place new order |
| GET | `/api/orders` | Waiter/Kitchen | Get active orders |
| PATCH | `/api/orders/:id/items/:itemId` | Kitchen | Update item status |
| PATCH | `/api/orders/:id/status` | Waiter | Update order status |

### Tables & Sessions
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tables` | Any role | Get all tables |
| POST | `/api/tables` | Admin | Create table + QR |
| POST | `/api/sessions` | Waiter | Start table session |
| PATCH | `/api/sessions/:id/end` | Waiter | End session |

### Billing
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/billing/generate` | Waiter | Generate bill |
| PATCH | `/api/billing/:id/pay` | Waiter | Record payment |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/admin/dashboard` | Admin | Revenue + stats |
| GET | `/api/admin/reports` | Admin | Date-range sales report |

---

## 🗄️ Database Schema

```
Staff ──────────────── Order ──────────── OrderItem
  │                      │                    │
  │                      │                    │
RestaurantTable ─────────┘                MenuItem
  │                      │
  │                      │
Session ─────────────────┘
  │
  │
Bill
```

---

## 🌐 Deployment

### Backend — Railway
1. Push to GitHub
2. Create new Railway project → Deploy from GitHub
3. Add PostgreSQL plugin
4. Set environment variables in Railway dashboard
5. Set start command: `npm run build && npm start`

### Frontend — Vercel
1. Import GitHub repo to Vercel
2. Set root directory to `client`
3. Add environment variable: `VITE_API_URL=https://your-railway-url.up.railway.app`
4. Deploy

---

## 🧪 Testing with Postman

Import the Postman collection from `/postman/Restaurant_API.postman_collection.json`.

Test order:
1. `POST /api/auth/seed` → create admin
2. `POST /api/auth/login` → token auto-saves
3. `POST /api/staff` → create waiter + kitchen accounts
4. `POST /api/menu/items` → add menu items
5. `POST /api/tables` → create tables
6. `POST /api/sessions` → start table session
7. `POST /api/orders` → place order
8. `PATCH /api/orders/:id/items/:itemId` → kitchen marks ready
9. `POST /api/billing/generate` → generate bill
10. `PATCH /api/billing/:id/pay` → pay bill
11. `GET /api/admin/dashboard` → see revenue updated

---

## 👨‍💻 Author

**Tharuka** — Computer Engineering Graduate, University of Ruhuna

[![GitHub](https://img.shields.io/badge/GitHub-sandarenuDT-181717?style=flat&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sandarenuDT-0A66C2?style=flat&logo=linkedin)](https://linkedin.com/in/yourname)

---

## 📄 License

MIT License — feel free to use this project as a reference or starting point.
