# 🍳 PALUTO APP - Online Food Ordering System

A full-featured online food ordering system built with Vue.js 3, Firebase, and Cloudinary.

## Tech Stack
- **Frontend**: Vue.js 3 + Composition API + Vue Router + Pinia
- **Backend/DB**: Firebase (Firestore + Authentication + Storage)
- **Image CDN**: Cloudinary
- **Build Tool**: Vite

## Features

### Customer
- 🏠 Beautiful landing page with featured dishes
- 🍽️ Menu browsing with category filters & search
- 🛒 Shopping cart with drawer UI
- 🔐 Authentication (Register / Login)
- 💳 Checkout with delivery details & payment method
- 📋 Order history with real-time status tracking
- 👤 Profile management

### Admin Panel (`/admin`)
- 📊 Dashboard with real-time stats & revenue
- 📋 Orders management with live updates (Firestore subscription)
- 🍽️ Product CRUD with Cloudinary image upload
- 📂 Category management

## Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Configure Cloudinary Upload Preset
1. Go to https://cloudinary.com/console
2. Settings → Upload → Upload presets
3. Create an **unsigned** preset named `paluto_uploads`
4. Or update `CLOUDINARY_UPLOAD_PRESET` in `src/cloudinary.js`

### 3. Firebase Firestore Rules
Set up your Firestore security rules:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    match /products/{doc} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /categories/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /orders/{doc} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null;
    }
  }
}
```

### 4. Set Admin User
After registering, go to Firebase Console → Firestore → users collection
Find your user document and change `role` from `"customer"` to `"admin"`.

### 5. Run dev server
```bash
npm run dev
```

### 6. Build for production
```bash
npm run build
```

## Project Structure
```
src/
├── components/
│   ├── AppNav.vue       # Top navigation
│   ├── AppFooter.vue    # Footer
│   ├── CartDrawer.vue   # Slide-out cart
│   ├── ProductCard.vue  # Product card component
│   └── Toast.vue        # Toast notifications
├── views/
│   ├── HomeView.vue     # Landing page
│   ├── MenuView.vue     # Full menu with filters
│   ├── ProductView.vue  # Single product detail
│   ├── CheckoutView.vue # Order checkout
│   ├── OrdersView.vue   # Customer order history
│   ├── ProfileView.vue  # User profile
│   ├── LoginView.vue    # Login page
│   ├── RegisterView.vue # Registration page
│   └── admin/
│       ├── AdminLayout.vue    # Admin sidebar layout
│       ├── DashboardView.vue  # Admin dashboard
│       ├── OrdersView.vue     # Order management
│       ├── ProductsView.vue   # Product management
│       └── CategoriesView.vue # Category management
├── stores/
│   ├── auth.js          # Auth state (Pinia)
│   ├── cart.js          # Cart state (Pinia)
│   ├── products.js      # Products + Firebase
│   ├── orders.js        # Orders + Firebase
│   └── toast.js         # Toast notifications
├── router/index.js      # Vue Router config
├── firebase.js          # Firebase initialization
└── cloudinary.js        # Cloudinary helpers
```
