# Event Ticketing Platform - Backend API

A robust, secure, and scalable RESTful API for an **Event Ticketing & Management Platform** built using Node.js, Express, MongoDB, and JSON Web Token (JWT) authentication.

---

## 🚀 Key Features

* **Multi-Role User Management & Authentication**:
  * Role-based access control (`customer`, `organizer`).
  * JWT authentication with short-lived Access Tokens and long-lived Refresh Tokens stored in HTTP-only cookies.
  * Password encryption using `bcryptjs`.
  * User profile management (registration, login, profile updates, password changes).

* **Organizer & Venue Management**:
  * Business profile creation for event hosts (automatically upgrades user role to `organizer`).
  * Organizer verification status tracking and multi-organization support per account.

* **Event Management & Discovery**:
  * Comprehensive Event CRUD operations (Title, Description, Date/Time, Venue, City, Capacity).
  * Event publishing/unpublishing lifecycle control.
  * Public event discovery API with full-text title/description search regex, filtering by city and status, dynamic pagination, and custom sorting.

* **Ticket Tier & Pricing Management**:
  * Customizable ticket tiers (`VIP`, `Standard`, `Student`).
  * Activation, deactivation, and capacity bounds tracking per ticket tier.
  * Automatic validation against event dates and remaining ticket availability.

* **Order Processing & Workflow**:
  * Order status workflow (`pending` $\rightarrow$ `paid` / `failed` / `cancelled` / `refunded`).
  * Organizer approval flow: Automatically decrements ticket inventory and generates individual tickets upon order approval.

* **QR Code Gate Check-in & Entry Verification**:
  * Automatic generation of unique ticket QR codes (`TKY-<UUID>`) on approval.
  * Venue entrance QR code scanner endpoint that verifies ticket validity, prevents reuse/double-entry, and logs scanner user ID & timestamp.

---

## 🛠️ Technology Stack

* **Runtime**: Node.js (ES Modules `"type": "module"`)
* **Framework**: Express.js (v5)
* **Database**: MongoDB with Mongoose ODM (v9)
* **Authentication**: `jsonwebtoken` (JWT) + `cookie-parser`
* **Validation**: `validator.js`
* **Security & Utility**: `bcryptjs`, `cors`, `dotenv`, `crypto`
* **Dev Tooling**: `nodemon`, `prettier`

---

## 📁 Project Directory Structure

```text
Event Ticketing Platform/
├── Backend/
│   ├── src/
│   │   ├── controllers/         # Business logic for all modules
│   │   │   ├── event.controller.js
│   │   │   ├── order.controller.js
│   │   │   ├── organizer.controller.js
│   │   │   ├── ticket.controller.js
│   │   │   ├── ticketType.controller.js
│   │   │   └── user.controller.js
│   │   ├── db/                  # Database connection logic
│   │   │   └── index.js
│   │   ├── middlewares/         # Auth & authorization middlewares
│   │   │   └── auth.middleware.js
│   │   ├── models/              # Mongoose data schemas
│   │   │   ├── event.model.js
│   │   │   ├── order.model.js
│   │   │   ├── organizer.model.js
│   │   │   ├── scanlog.model.js
│   │   │   ├── ticket.model.js
│   │   │   ├── ticket_type.model.js
│   │   │   └── user.model.js
│   │   ├── routes/              # Express API route endpoints
│   │   │   ├── event.route.js
│   │   │   ├── order.route.js
│   │   │   ├── organizer.routes.js
│   │   │   ├── ticket.route.js
│   │   │   ├── ticketType.route.js
│   │   │   └── user.routes.js
│   │   ├── seed/                # Seed script for demo data
│   │   │   └── seed.js
│   │   ├── utils/               # Custom wrappers (ApiError, ApiResponse, asyncHandler)
│   │   ├── app.js               # Express application middleware setup
│   │   ├── constant.js          # App-wide constants (e.g. DB_NAME)
│   │   └── index.js             # Server startup entry point
│   ├── .env                     # Environment variables configuration
│   ├── package.json
│   └── package-lock.json
└── README.md
```

---

## 🔑 Environment Variables Configuration

Create a `.env` file inside the `Backend/` directory with the following variables:

```env
PORT=5000
MONGODB_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_access_token_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key
REFRESH_TOKEN_EXPIRY=7d
```

---

## 🗄️ Database Schemas & Entities

* **User**: `name`, `email`, `password`, `role` (`customer`, `organizer`, `admin`), `phone`, `refreshToken`.
* **Organizer**: `owner` (User Ref), `businessName`, `businessEmail`, `businessPhone`, `address`, `city`, `isVerified`.
* **Event**: `organizer` (Organizer Ref), `title`, `description`, `venue`, `city`, `eventDate`, `startTime`, `endTime`, `capacity`, `ticketsSold`, `status` (`upcoming`, `ongoing`, `completed`, `cancelled`), `isPublished`.
* **TicketType**: `event` (Event Ref), `name` (`VIP`, `Standard`, `Student`), `description`, `price`, `quantity`, `sold`, `isActive`, `saleStart`, `saleEnd`.
* **Order**: `userId` (User Ref), `eventId` (Event Ref), `ticketTypeId` (TicketType Ref), `quantity`, `amount`, `paymentMethod` (`cash`, `bank_transfer`, `easypaisa`, `jazzcash`), `paymentProof`, `status` (`pending`, `paid`, `failed`, `cancelled`, `refunded`), `paidAt`.
* **Ticket**: `ticketType` (TicketType Ref), `user` (User Ref), `event` (Event Ref), `purchasePrice`, `qrCode`, `order` (Order Ref), `status` (`active`, `used`, `cancelled`), `scannedAt`, `scannedBy`.
* **ScanLog**: `ticketId` (Ticket Ref), `scannedBy` (User Ref), `scannedAt`, `result` (`success`, `failure`).

---

## 📡 API Reference Overview

Base Path: `/api/v1`

### 1. Authentication & User Routes (`/api/v1/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register a new user |
| `POST` | `/login` | Public | Authenticate & issue JWT cookies/tokens |
| `POST` | `/logout` | Authenticated | Logout user and invalidate refresh token |
| `GET` | `/current-user` | Authenticated | Get logged-in user profile |
| `GET` | `/refresh-access-token` | Public (Cookie) | Renew access token via refresh token |
| `PATCH` | `/update-password` | Authenticated | Update user password |
| `PATCH` | `/update-user` | Authenticated | Update user details (name, email, phone) |
| `DELETE` | `/delete-user` | Authenticated | Delete user account |

### 2. Organizer Routes (`/api/v1/organizers`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Authenticated | Create organizer profile (upgrades role to `organizer`) |
| `GET` | `/` | Authenticated | Fetch organizer profiles owned by current user |
| `GET` | `/:organizerId` | Authenticated | Get specific organizer profile |
| `PATCH` | `/:organizerId` | Authenticated | Update organizer business details |
| `DELETE` | `/:organizerId` | Authenticated | Delete organizer profile |

### 3. Event Routes (`/api/v1/events`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Organizer | Create a new event |
| `GET` | `/` | Organizer | Get all events belonging to logged-in organizer |
| `GET` | `/published` or `/public` | Public / Auth | Search & filter published events (Query params: `search`, `city`, `status`, `sort`, `order`, `page`, `limit`) |
| `GET` | `/:eventId` | Organizer | Get event details by ID |
| `PATCH` | `/:eventId` | Organizer | Update event information |
| `DELETE` | `/:eventId` | Organizer | Delete an event |
| `PATCH` | `/:eventId/publish` | Organizer | Publish event to make it publicly viewable |
| `PATCH` | `/:eventId/unpublish` | Organizer | Unpublish event |

### 4. Ticket Type Routes (`/api/v1/ticket-types`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Organizer | Create a ticket tier for an event (`VIP`, `Standard`, `Student`) |
| `GET` | `/event/:eventId` | Organizer | Fetch all ticket tiers for an event |
| `GET` | `/:ticketTypeId` | Organizer | Get ticket tier details |
| `PATCH` | `/:ticketTypeId` | Organizer | Update ticket tier (price, quantity, sale dates) |
| `DELETE` | `/:ticketTypeId` | Organizer | Delete ticket tier (only if `sold == 0`) |
| `PATCH` | `/:ticketTypeId/activate` | Organizer | Activate ticket tier for sales |
| `PATCH` | `/:ticketTypeId/deactivate` | Organizer | Deactivate ticket tier from sales |

### 5. Order Routes (`/api/v1/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Customer | Purchase tickets / place a new order (Status: `pending`) |
| `PATCH` | `/:orderId/approve` | Organizer | Approve pending order $\rightarrow$ updates ticket counts & generates tickets |
| `GET` | `/` | Organizer | View all orders for organizer's events (Filter by `status`) |

### 6. Ticket & Gate Scan Routes (`/api/v1/tickets`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/my` | Customer | Fetch purchased tickets for customer |
| `GET` | `/:ticketId` | Customer | Get ticket details by ID |
| `GET` | `/event/:eventId` | Organizer | View all issued tickets for an event |
| `POST` | `/scan/:qrCode` | Organizer | Gate check-in: Scan QR code and mark ticket status as `used` |

---

## ⚡ Getting Started

### Prerequisites
* Node.js (v18 or higher recommended)
* MongoDB database instance (Local or MongoDB Atlas)

### Installation

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your `.env` file inside `Backend/` as detailed in the configuration section above.

### Running the Server

* **Development mode** (with hot reload via Nodemon):
  ```bash
  npm run dev
  ```

### Database Seeding

To populate the database with pre-configured demo users, organizers, and sample events:

```bash
npm run seed
```

**Default Demo Credentials:**
* **Admin**: `admin@test.com` / `Admin123@`
* **Organizer 1**: `ali@test.com` / `Organizer123@`
* **Organizer 2**: `ahmed@test.com` / `Organizer123@`
* **Customer 1**: `customer1@test.com` / `Customer123@`
* **Customer 2**: `customer2@test.com` / `Customer123@`
* **Customer 3**: `customer3@test.com` / `Customer123@`

---

## 🔒 Error & Response Handling

The backend implements standard JSON response structures for predictable client integration:

* **Success Response (`ApiResponse`)**:
  ```json
  {
    "statusCode": 200,
    "data": { ... },
    "message": "Operation successful",
    "success": true
  }
  ```

* **Error Response (`ApiError`)**:
  ```json
  {
    "statusCode": 400,
    "message": "Error description message",
    "errors": [],
    "data": null,
    "success": false
  }
  ```
