# WorkersConnect Backend

Express.js API for the WorkersConnect service marketplace platform.

## Setup

1. **Database**: Run `database/schema.sql` then `database/seed.sql` in your Supabase SQL editor
2. **Environment**: Copy `.env.example` to `.env` and fill in your Supabase credentials
3. **Install**: `npm install`
4. **Run**: `npm run dev` (with auto-reload) or `npm start`

The server runs on `http://localhost:5000` and serves the frontend from `../FrontEnd/`.

## Default Admin Login

- Email: `admin@workersconnect.com`
- Password: `admin123`

## API Endpoints

### Auth
- `POST /api/auth/register/client` - Client registration
- `POST /api/auth/register/worker` - Worker registration (pending approval)
- `POST /api/auth/login` - Login (all roles)
- `GET /api/auth/me` - Current user

### Workers
- `GET /api/workers` - List approved workers (filters: category, location, min_rating, sort, search)
- `GET /api/workers/:id` - Worker profile with reviews
- `GET /api/workers/profile/me` - Own profile (worker)
- `PUT /api/workers/profile/me` - Update profile (worker)
- `GET /api/workers/approval-status` - Check approval status (worker)

### Categories
- `GET /api/categories` - Active categories
- `GET /api/categories/all` - All categories (admin)
- `POST /api/categories` - Create (admin)
- `PUT /api/categories/:id` - Update (admin)
- `DELETE /api/categories/:id` - Delete (admin)

### Bookings
- `POST /api/bookings` - Create booking (client)
- `GET /api/bookings` - Own bookings (role-aware)
- `PUT /api/bookings/:id/accept` - Accept (worker)
- `PUT /api/bookings/:id/decline` - Decline (worker)
- `PUT /api/bookings/:id/complete` - Complete (worker)
- `PUT /api/bookings/:id/cancel` - Cancel (client)

### Reviews
- `POST /api/reviews` - Submit review (client, completed bookings only)
- `PUT /api/reviews/:id/reply` - Reply to review (worker, one-time)
- `GET /api/reviews/my` - Own reviews (worker)

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/approvals` - Approval queue
- `PUT /api/admin/approvals/:id` - Approve/reject worker
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id/block` - Block/unblock user
- `GET /api/admin/bookings` - All bookings
- `GET /api/admin/reviews` - All reviews
- `DELETE /api/admin/reviews/:id` - Remove review
- `GET /api/admin/activity-log` - System event log

### Upload
- `POST /api/upload/avatar` - Upload profile photo

## Tech Stack

- Express.js + CORS + JWT authentication
- Supabase (PostgreSQL + Storage)
- bcrypt for password hashing
- express-validator for request validation
- multer for file uploads
