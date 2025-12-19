# Quick Start & Deployment Guide

## ⚡ 5-Minute Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Cloudinary account (optional - fallback to placeholder images)

### Step 1: Backend Setup
```bash
cd backend
npm install
```

**Create `.env`**:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hypenest
JWT_SECRET=super-secret-key-change-in-production
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Start**:
```bash
npm run dev
```
→ Server running at `http://localhost:5000`

### Step 2: Frontend Setup
```bash
cd frontend
npm install
```

**Create `.env`**:
```env
VITE_API_URL=http://localhost:5000/api
```

**Start**:
```bash
npm run dev
```
→ App running at `http://localhost:5173`

### Step 3: Test It
1. Click **"Register"** → Create an account
2. Click **"List Your Item"** → Create a product (images auto-approved)
3. See it on homepage → Product appears immediately
4. Click **"Shop Now"** → Browse by category
5. Click a **brand tile** → Filter works

**That's it!** 🎉

---

## 🌐 Production Deployment

### Backend (Render.com - Free Tier)

1. **Create Render Account**: https://render.com

2. **Deploy**:
   - Click "New +" → Web Service
   - Connect GitHub repo
   - Settings:
     - **Name**: hypenest-api
     - **Branch**: main
     - **Build Command**: `cd backend && npm install`
     - **Start Command**: `cd backend && npm start`
     - **Environment Variables**:
       ```
       MONGO_URI=mongodb+srv://...
       JWT_SECRET=<strong-random-key>
       CLOUDINARY_CLOUD_NAME=...
       CLOUDINARY_API_KEY=...
       CLOUDINARY_API_SECRET=...
       NODE_ENV=production
       ```

3. **Note**: Copy the deployed URL (e.g., `https://hypenest-api.onrender.com`)

### Frontend (Vercel - Free Tier)

1. **Create Vercel Account**: https://vercel.com

2. **Deploy**:
   ```bash
   npm install -g vercel
   cd frontend
   vercel
   ```

3. **Environment Variables in Vercel Dashboard**:
   ```
   VITE_API_URL=https://hypenest-api.onrender.com/api
   ```

4. **Done!** Vercel deploys on every push to main

---

## 🧪 Quick Testing Checklist

After deploying, verify:

- [ ] Signup works
- [ ] Login works  
- [ ] Can create product (auto-approves)
- [ ] Product visible on homepage
- [ ] Search filters work
- [ ] Category filters work
- [ ] Brand filters work
- [ ] "Browse All" scrolls to top
- [ ] Empty state shows helpful message
- [ ] Product badges display
- [ ] View counters show
- [ ] Seller badges show on profile

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000  # Windows
lsof -i :5000                  # Mac/Linux

# Kill the process or use different port
PORT=5001 npm run dev
```

### Frontend can't reach API
```
Error: "failed to fetch from /api/products"
```
Solution: Check `VITE_API_URL` in `.env` matches backend URL

### Images not uploading
```
Error: "Cloudinary upload failed"
```
Solutions:
1. Fallback mode works → you'll see placeholder images
2. Check Cloudinary credentials in `.env`
3. Restart backend after changing `.env`

### MongoDB connection fails
```
Error: "MongoDB connection error"
```
Solutions:
1. Verify `MONGO_URI` is correct
2. Add your IP to MongoDB Atlas whitelist (0.0.0.0/0 for dev)
3. Ensure password has no special chars (or URL-encode them)

---

## 🚀 What's New (Maturity Update)

### Features Added
✅ **Auto-approval** - Products visible immediately (testing)  
✅ **Toast notifications** - User feedback on actions  
✅ **Loading skeletons** - Better perceived performance  
✅ **Empty states** - Helpful guidance when no results  
✅ **Product badges** - New, Hot, Limited, Premium  
✅ **View counters** - 👁️ 256 views on each product  
✅ **Seller trust badges** - Verified, Trusted, Active  
✅ **Scroll behavior** - Smooth navigation when filtering  

### Documentation Added
📖 **ARCHITECTURE.md** - Complete design decisions guide  
📊 **MATURITY_REPORT.md** - What changed and why  

---

## 📚 Interview Talking Points

### "Tell me about your architecture"
**Point to**: ARCHITECTURE.md Sections 2-3

### "Why did you choose React?"
**Point to**: ARCHITECTURE.md Section 3.1 "Technology Choice"

### "How would you scale this?"
**Point to**: ARCHITECTURE.md Section 7 "How to Scale"

### "What would you do differently?"
**Point to**: ARCHITECTURE.md Section 6 "Intentional Limitations"

---

## 📞 Support

Having issues? Check:
1. **Local setup**: Section 1 of this guide
2. **Deployment**: Section 2 of this guide
3. **Architecture questions**: ARCHITECTURE.md
4. **What changed**: MATURITY_REPORT.md

---

**You're all set! Deploy, test, and confidently explain your product.** 🎯
