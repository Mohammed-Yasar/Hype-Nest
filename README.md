# HypeNest

A production-ready full-stack marketplace for sneakers, streetwear, and collectibles.

## Project Overview

HypeNest is a modern marketplace platform that allows users to buy and sell sneakers, streetwear, and collectibles. The platform features user authentication, product management, search and filtering, admin approval workflow, and a clean, responsive UI.

### Business Features
- User registration and authentication
- Product listing creation with image uploads
- Advanced search and filtering (brand, category, price range)
- Product approval workflow (admin moderation)
- User dashboard for managing listings
- Admin interface for product moderation

### Technical Stack
- **Frontend**: React + TypeScript + Vite, TailwindCSS, Axios, React Router, Context API
- **Backend**: Node.js + Express, Mongoose (MongoDB), JWT, bcrypt, Cloudinary
- **Database**: MongoDB (MongoDB Atlas)
- **Dev Tools**: nodemon, Vite

## Project Structure

```
hype-nest/
├── backend/              # Node.js + Express API
│   ├── config/          # Database configuration
│   ├── models/          # Mongoose models (User, Product)
│   ├── routes/          # API routes (auth, products, upload, admin)
│   ├── middleware/      # Auth middleware (protect, admin)
│   ├── server.js        # Express server entry point
│   └── package.json     # Backend dependencies
├── frontend/            # React + TypeScript + Vite
│   ├── src/
│   │   ├── api/        # API client configuration
│   │   ├── components/ # React components
│   │   ├── context/    # Auth context provider
│   │   ├── pages/      # Page components
│   │   └── types/      # TypeScript type definitions
│   └── package.json    # Frontend dependencies
└── README.md           # This file
```

## Local Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (or local MongoDB instance)
- Cloudinary account (optional - fallback mode available for development)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hypenest?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Note**: If Cloudinary credentials are not provided, the image upload will use placeholder URLs for development.

5. Start the development server:
```bash
npm run dev
```

Backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
# Windows PowerShell
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173` (default Vite port)

## Environment Variables

### Backend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `PORT` | Server port (default: 5000) | No |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | No* |
| `CLOUDINARY_API_KEY` | Cloudinary API key | No* |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | No* |

*Cloudinary variables are optional - fallback mode will use placeholder URLs

### Frontend (.env)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend API base URL | Yes |

## API Reference

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201)**:
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "jwt_token_here"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200)**:
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "token": "jwt_token_here"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

### Product Endpoints

#### Get Products (with search/filters/pagination)
```http
GET /api/products?search=nike&brand=Nike&category=Sneakers&minPrice=50&maxPrice=200&sort=newest&page=1&limit=12
```

**Query Parameters**:
- `search` - Text search across title, description, brand
- `brand` - Filter by brand (case-insensitive)
- `category` - Filter by category (case-insensitive)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `sort` - Sort option: `newest`, `price_asc`, `price_desc` (default: `newest`)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Response (200)**:
```json
{
  "products": [
    {
      "_id": "product_id",
      "title": "Nike Air Max 90",
      "description": "Classic sneakers",
      "price": 120,
      "brand": "Nike",
      "category": "Sneakers",
      "images": ["https://..."],
      "seller": {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "approved",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 57,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}
```

#### Get Product by ID
```http
GET /api/products/:id
```

**Response (200)**:
```json
{
  "_id": "product_id",
  "title": "Nike Air Max 90",
  "description": "Classic sneakers",
  "price": 120,
  "brand": "Nike",
  "category": "Sneakers",
  "images": ["https://..."],
  "seller": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "status": "approved",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Create Product
```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Nike Air Max 90",
  "description": "Classic sneakers in excellent condition",
  "price": 120,
  "brand": "Nike",
  "category": "Sneakers",
  "images": ["https://cloudinary.com/image.jpg"]
}
```

**Response (201)**: Product object

#### Get User's Products
```http
GET /api/products/user/my-products
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "products": [...]
}
```

#### Update Product (Owner Only)
```http
PATCH /api/products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 150,
  "images": ["https://new-image.jpg"]
}
```

**Response (200)**: Updated product object

#### Delete Product (Owner Only)
```http
DELETE /api/products/:id
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "message": "Product deleted successfully"
}
```

### Upload Endpoints

#### Upload Image
```http
POST /api/upload/image
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form Data:
  image: [file]
```

**Response (200)**:
```json
{
  "url": "https://cloudinary.com/image.jpg"
}
```

**Note**: If Cloudinary is not configured, returns a placeholder URL.

### Admin Endpoints

#### Get Pending Products
```http
GET /api/admin/products/pending
Authorization: Bearer {admin_token}
```

**Response (200)**:
```json
{
  "products": [...]
}
```

#### Approve Product
```http
PATCH /api/admin/products/:id/approve
Authorization: Bearer {admin_token}
```

**Response (200)**: Updated product object

#### Reject Product
```http
PATCH /api/admin/products/:id/reject
Authorization: Bearer {admin_token}
```

**Response (200)**: Updated product object

## Testing

### Manual Testing

1. **Backend API Testing**:
   - Use Postman or Thunder Client
   - Test all endpoints with sample data
   - Verify JWT token authentication
   - Test admin routes with admin user

2. **Frontend Testing**:
   - Register a new user
   - Login and verify token storage
   - Create a product with image upload
   - Search and filter products
   - View product details
   - Access dashboard to manage products
   - Test admin interface (requires admin user)

### Example cURL Commands

**Register User**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

**Get Products**:
```bash
curl http://localhost:5000/api/products?search=nike&page=1&limit=12
```

**Create Product** (with token):
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Nike Shoes","description":"Great shoes","price":120,"brand":"Nike","category":"Sneakers","images":[]}'
```

## Deployment

### Backend Deployment (Render/Railway)

1. Create a new web service on Render or Railway
2. Connect your GitHub repository
3. Set environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `PORT` (usually auto-set)
   - Cloudinary credentials (optional)
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Deploy

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. Navigate to frontend directory: `cd frontend`
3. Run: `vercel`
4. Set environment variable `VITE_API_URL` to your backend URL
5. Deploy

### Production Environment Variables

**Backend**:
- `MONGO_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong, random secret key
- `CLOUDINARY_*` - Production Cloudinary credentials

**Frontend**:
- `VITE_API_URL` - Production backend API URL (e.g., `https://api.hypenest.com/api`)

## Git Branches

The project uses feature branches:
- `feat/mvp` - Main MVP branch with all core features
- `feat/dashboard` - User dashboard feature
- `feat/admin-ui` - Admin interface feature

All features have been merged into `feat/mvp`.

## Implementation Status

### ✅ Completed (MVP)

- **Sprint 0**: Project structure and dependencies
- **Sprint 1**: Backend MVP
  - User authentication (register, login, JWT)
  - Product CRUD operations
  - Image upload with Cloudinary (fallback mode)
  - Search, filters, sorting, pagination
  - Admin approval workflow
- **Sprint 2**: Frontend MVP
  - Authentication pages (login/register)
  - Product creation page
  - Product feed with search/filters
  - Product detail page
  - Protected routes
  - Responsive UI with TailwindCSS
- **Future Features**:
  - User dashboard with edit/delete
  - Admin UI for product approval/rejection

### 🚧 Future Enhancements

- Real-time chat (Socket.io)
- Order/checkout system
- Ratings & reviews
- Advanced analytics dashboard
- CI/CD pipeline (GitHub Actions)
- Payment integration
- Email notifications

## Troubleshooting

### Backend Issues

**MongoDB Connection Error**:
- Verify `MONGO_URI` is correct
- Check MongoDB Atlas IP whitelist
- Ensure network access is enabled

**JWT Errors**:
- Verify `JWT_SECRET` is set
- Check token expiration
- Ensure Authorization header format: `Bearer {token}`

### Frontend Issues

**API Connection Error**:
- Verify `VITE_API_URL` in `.env`
- Check backend is running
- Verify CORS settings on backend

**Image Upload Issues**:
- Check Cloudinary credentials (or use fallback mode)
- Verify file size limits (5MB max)
- Check file format (jpg, png, webp)

## License

This project is for educational/demonstration purposes.

## Support

For issues or questions, please check the troubleshooting section or review the code comments.
