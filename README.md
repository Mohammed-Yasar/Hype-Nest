# HypeNest

A full-stack marketplace for sneakers, streetwear, and collectibles.

## Project Structure

```
hype-nest/
├── backend/          # Node.js + Express API
├── frontend/         # React + TypeScript + Vite
└── README.md         # This file
```

## Tech Stack

- **Frontend**: React + TypeScript + Vite, TailwindCSS, Axios, React Router
- **Backend**: Node.js + Express, Mongoose (MongoDB), JWT, bcrypt, Cloudinary
- **Database**: MongoDB (MongoDB Atlas)

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (optional - fallback mode available)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Start the server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

Frontend runs on `http://localhost:5173` (default Vite port)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get products with search/filters/pagination
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (protected)
- `PATCH /api/admin/products/:id/approve` - Approve product (admin only)

### Upload
- `POST /api/upload/image` - Upload image (protected)

## Environment Variables

See `.env.example` files in backend and frontend directories.

## Deployment

See deployment section in README for production setup instructions.

