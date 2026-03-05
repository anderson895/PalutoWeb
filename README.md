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


# 🔧 PALUTO APP — Setup Guide

Kumpleto na gabay para sa pag-setup ng **Firebase** at **Cloudinary** para sa PALUTO APP.

---

## 📋 Table of Contents

1. [Firebase Setup](#1-firebase-setup)
   - [Create Project](#11-create-firebase-project)
   - [Enable Authentication](#12-enable-authentication)
   - [Setup Firestore Database](#13-setup-firestore-database)
   - [Firestore Security Rules](#14-firestore-security-rules)
   - [Firestore Indexes](#15-firestore-indexes)
2. [Cloudinary Setup](#2-cloudinary-setup)
   - [Create Account](#21-create-cloudinary-account)
   - [Create Upload Preset](#22-create-upload-preset)
3. [Run the App](#3-run-the-app)
4. [Create Admin Account](#4-create-admin-account)

---

## 1. Firebase Setup

### 1.1 Create Firebase Project

1. Pumunta sa 👉 [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"**
3. Pangalanan ng **`paluto-app`**
4. I-disable ang Google Analytics (optional) → Click **Create project**
5. Hintayin na ma-create (30 seconds)

---

### 1.2 Enable Authentication

Kailangan ito para mag-register at mag-login ang mga users.

1. Sa left sidebar, click **Authentication**
2. Click **Get started**
3. Click ang **Sign-in method** tab
4. Click **Email/Password**
5. I-toggle ang **Enable** → ON ✅
6. Click **Save**

> ⚠️ Kapag hindi ito na-enable, lalabas ang error na `400 Bad Request` kapag nag-register.

---

### 1.3 Setup Firestore Database

1. Sa left sidebar, click **Firestore Database**
2. Click **Create database**
3. Piliin ang **Start in production mode**
4. Piliin ang pinakamalapit na location (hal. `asia-southeast1` para Philippines)
5. Click **Enable**

---

### 1.4 Firestore Security Rules

1. Sa Firestore Database, click ang **Rules** tab
2. Burahin ang lahat ng existing rules
3. I-paste ang rules sa ibaba:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isLoggedIn() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isAdmin() {
      return isLoggedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // USERS
    match /users/{userId} {
      allow read: if isOwner(userId) || isAdmin();
      allow create: if isLoggedIn()
        && isOwner(userId)
        && request.resource.data.role == 'customer'
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.email is string
        && request.resource.data.name is string;
      allow update: if (
          isOwner(userId)
          && request.resource.data.role == resource.data.role
          && request.resource.data.uid == resource.data.uid
          && request.resource.data.email == resource.data.email
        ) || isAdmin();
      allow delete: if isAdmin();
    }

    // PRODUCTS
    match /products/{productId} {
      allow read: if true;
      allow create: if isAdmin()
        && request.resource.data.name is string
        && request.resource.data.price is number
        && request.resource.data.price > 0
        && request.resource.data.category is string;
      allow update: if isAdmin()
        && request.resource.data.price is number
        && request.resource.data.price > 0;
      allow delete: if isAdmin();
    }

    // CATEGORIES
    match /categories/{categoryId} {
      allow read: if true;
      allow create: if isAdmin()
        && request.resource.data.name is string
        && request.resource.data.emoji is string;
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // ORDERS
    match /orders/{orderId} {
      allow read: if isLoggedIn()
        && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isLoggedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.status == 'pending'
        && request.resource.data.items is list
        && request.resource.data.items.size() > 0
        && request.resource.data.total is number
        && request.resource.data.total > 0
        && request.resource.data.address is string
        && request.resource.data.userName is string
        && request.resource.data.userPhone is string;
      allow update: if (
          isLoggedIn()
          && resource.data.userId == request.auth.uid
          && resource.data.status == 'pending'
          && request.resource.data.status == 'cancelled'
          && request.resource.data.userId == resource.data.userId
        ) || isAdmin();
      allow delete: if isAdmin();
    }

    // REVIEWS
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isLoggedIn()
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.rating is number
        && request.resource.data.rating >= 1
        && request.resource.data.rating <= 5
        && request.resource.data.comment is string;
      allow update, delete: if isLoggedIn()
        && (resource.data.userId == request.auth.uid || isAdmin());
    }

    // SETTINGS
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // DENY EVERYTHING ELSE
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

4. Click **Publish** ✅

---

### 1.5 Firestore Indexes

Kailangan ang composite index para sa Orders query (filter by userId + sort by createdAt).

**Option A — Automatic (Pinakamadali)**

1. I-run ang app
2. Pumunta sa `/orders` page
3. Makikita ang error sa browser console na may link
4. I-click ang link sa console — dadalhin ka sa Firebase para auto-create ang index
5. Click **Create index**
6. Hintayin na maging **Enabled** (1–2 minuto)

**Option B — Manual**

1. Sa Firestore Database, click ang **Indexes** tab
2. Click **Create index**
3. Punan ng ganito:

| Setting | Value |
|---|---|
| **Collection ID** | `orders` |
| **Field 1** | `userId` — Ascending ↑ |
| **Field 2** | `createdAt` — Descending ↓ |
| **Query scope** | Collection |

4. Click **Create index**
5. Hintayin na maging **Enabled** ✅ (1–2 minuto)

> ⚠️ Habang naglo-load ang index, lalabas ang `FirebaseError: The query requires an index`. Normal lang ito — hintayin lang maging Enabled.

---

## 2. Cloudinary Setup

### 2.1 Create Cloudinary Account

1. Pumunta sa 👉 [cloudinary.com/users/register_free](https://cloudinary.com/users/register_free)
2. Mag-sign up ng libre
3. Pagkatapos mag-login, makikita mo ang **Dashboard**
4. Hanapin ang iyong **Cloud Name** — dapat `dj87temic` (already set sa code)

---

### 2.2 Create Upload Preset

Kailangan ito para makapag-upload ng product images mula sa admin panel.

1. Sa Cloudinary Console, click ang ⚙️ **Settings** (gear icon, lower left)
2. Click ang **Upload** tab
3. Scroll down sa **Upload presets** section
4. Click **Add upload preset**
5. Punan ng ganito:

| Setting | Value |
|---|---|
| **Preset name** | `paluto_uploads` |
| **Signing Mode** | `Unsigned` ⚠️ |
| **Folder** | `paluto-app` (optional) |
| **Allowed formats** | `jpg, png, webp, gif` (optional) |

6. Click **Save** ✅

> ⚠️ **MAHALAGA:** Dapat **Unsigned** ang Signing Mode. Kapag **Signed**, hindi mag-wo-work ang upload mula sa frontend at lalabas ang `400 Bad Request` error.

---

## 3. Run the App

Pagkatapos ma-setup ang Firebase at Cloudinary, i-run na ang app:

```bash
# I-install ang dependencies
npm install

# I-start ang development server
npm run dev
```

Buksan ang browser sa 👉 `http://localhost:5173`

---

## 4. Create Admin Account

### Step 1 — Mag-register ng account

1. Pumunta sa `/register`
2. Mag-fill up ng name, email, password
3. Click **Create Account**

### Step 2 — I-promote sa Admin sa Firebase Console

1. Pumunta sa 👉 [console.firebase.google.com](https://console.firebase.google.com)
2. Piliin ang **paluto-app** project
3. Click **Firestore Database** sa left sidebar
4. Click ang **users** collection
5. Hanapin ang iyong user document (pangalan mo ang makikita)
6. Hanapin ang field na **`role`** — value ay `"customer"`
7. Click ang **pencil icon ✏️** para i-edit
8. Palitan ng `"admin"`
9. Click **Update** ✅

### Step 3 — Mag-logout at mag-login ulit

1. Sa app, click ang avatar mo sa taas
2. Click **Logout**
3. Mag-login ulit gamit ang parehong email at password

### Step 4 — I-access ang Admin Panel

Pumunta sa 👉 `http://localhost:5173/admin`

Dapat makita mo na ang Admin Dashboard! 🎉

---

## ✅ Setup Checklist

Bago i-launch ang app, siguraduhing naka-check lahat:

- [ ] Firebase project created
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] Firestore security rules published
- [ ] Firestore composite index created (orders: userId + createdAt)
- [ ] Cloudinary account created
- [ ] Cloudinary upload preset `paluto_uploads` created (Unsigned)
- [ ] Admin account promoted in Firestore
- [ ] App running with `npm run dev`

---

## 🚨 Common Errors & Fixes

| Error | Dahilan | Solusyon |
|---|---|---|
| `400 Bad Request` sa register/login | Hindi enabled ang Email/Password auth | I-enable sa Firebase → Authentication → Sign-in method |
| `FirebaseError: The query requires an index` | Wala pang Firestore composite index | I-click ang link sa console o gumawa ng manual index |
| `400 Bad Request` sa image upload | Walang Cloudinary upload preset | Gumawa ng unsigned preset na `paluto_uploads` |
| `Missing or insufficient permissions` | Mali ang Firestore rules | I-copy-paste ulit ang rules at i-publish |
| `/admin` redirects to home | Hindi admin ang account | I-update ang `role` sa Firestore mula `customer` → `admin` |

---

*PALUTO APP — Made with ❤️ in the Philippines* 🇵🇭
