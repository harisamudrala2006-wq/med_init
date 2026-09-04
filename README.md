# Sri Maheswari Medical — Pharmacy Management System

A modern, fast, and responsive web-based Pharmacy Management and Inventory Tracking System designed for retail pharmacies (Sri Maheswari Medical / Sri Balaji Pharmacy).

![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/ES_Modules-JavaScript-F7DF1E?logo=javascript&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11.x-FFCA28?logo=firebase&logoColor=black)
![License](https://img.shields.io/badge/license-Private-red)

---

## 🌟 Key Features

- **Dashboard & Analytics**: Real-time sales summaries, critical stock alerts, payment balance tracking, and expiry notifications.
- **Purchase Bills & Invoices**: Digital bill logging with distributor tagging, payment status (Paid, Pending, Partial), and invoice viewer.
- **OCR Invoice Extraction**: Upload or scan distributor purchase invoices and automatically extract medicine names, quantities, batches, and amounts.
- **Inventory & Batch Tracking**: Manage medicine stock with batch numbers, expiry dates, pack sizes, and low-stock indicators.
- **Distributor Balances & Ledgers**: Keep track of outstanding balances, payment terms, distributor contacts, and transaction history.
- **Dark & Light Mode**: Complete theme support with persistent preferences.
- **Hybrid Cloud & Offline/Demo Mode**: Runs with full mock datasets out-of-the-box if Firebase credentials are not provided, and seamlessly syncs to Firebase Firestore and Authentication when configured.

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/harisamudrala2006-wq/med_init.git
cd med_init
npm install
```

### 2. Configure Environment Variables (Optional)

Copy the example environment configuration:

```bash
cp .env.example .env
```

Edit `.env` with your Firebase project credentials:

```env
VITE_FIREBASE_API_KEY="your_api_key_here"
VITE_FIREBASE_AUTH_DOMAIN="your_project_id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your_project_id"
VITE_FIREBASE_STORAGE_BUCKET="your_project_id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your_messaging_sender_id"
VITE_FIREBASE_APP_ID="your_app_id"
```

> **Note:** If you skip configuring Firebase credentials, the application will automatically run in **Demo Mode** using realistic in-memory mock data so you can test all features immediately.

### 3. Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

### 4. Build for Production

```bash
npm run build
```

The production-ready assets will be generated in the `dist/` directory.

---

## 🌐 Flexible Deployment Options

This project is pre-configured for instant deployment on any modern cloud hosting provider.

### Option A: Vercel (Recommended)

1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com/new).
3. The included `vercel.json` automatically configures Vite builds and SPA routing rewrites.
4. *(Optional)* Add your `VITE_FIREBASE_*` environment variables in the Vercel Project Settings.

### Option B: Netlify

1. Connect your repository to [Netlify](https://app.netlify.com/).
2. Netlify will detect the included `netlify.toml` and `public/_redirects`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. *(Optional)* Set environment variables in Site settings > Environment variables.

### Option C: Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   firebase login
   ```
2. Initialize Firebase Hosting in the project root:
   ```bash
   firebase init hosting
   ```
   - Public directory: `dist`
   - Configure as single-page app: `Yes`
   - Set up automatic builds and deploys with GitHub: `Optional`
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

### Option D: GitHub Pages

The build uses relative base paths (`./`) by default, so it can be deployed on GitHub Pages under a subpath (e.g. `https://<username>.github.io/med_init/`).

1. Enable GitHub Pages in repository **Settings > Pages** > Source: **GitHub Actions**.
2. Or build locally:
   ```bash
   npm run build
   ```
   and deploy the `dist/` folder to the `gh-pages` branch.

### Option E: Docker / Nginx Static Server

To serve with Nginx or a static server, point the web root to `dist/` and configure fallback to `index.html`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 📂 Project Structure

```
├── .github/
│   └── workflows/
│       └── build.yml        # Continuous Integration build workflow
├── public/
│   └── _redirects           # Static SPA redirect fallback
├── src/
│   ├── components/          # Reusable UI components (Sidebar, TopBar, Modals, etc.)
│   ├── config/              # Firebase initialization and demo mode logic
│   ├── context/             # State management and Auth context
│   ├── services/            # Firestore data services and OCR utilities
│   ├── views/               # Page views (Dashboard, Bills, Inventory, Distributors, Settings)
│   ├── main.js              # Application entry point
│   └── router.js            # Client-side hash/history router
├── stitch_reference/        # UI/UX design mockups and specifications
├── .env.example             # Environment variables template
├── .gitignore               # Ignored files (node_modules, dist, secrets)
├── firestore.rules          # Firestore security rules
├── index.html               # Main HTML entry
├── netlify.toml             # Netlify deployment configuration
├── package.json             # Dependencies and scripts
├── vercel.json              # Vercel deployment configuration
└── vite.config.js           # Vite build configuration
```

---

## 🔒 Security Rules

Firestore security rules are defined in `firestore.rules`. To deploy them to your Firebase project:

```bash
firebase deploy --only firestore:rules
```
