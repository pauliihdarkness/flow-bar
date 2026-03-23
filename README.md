# 🌊 Flow Bar

A modern, real-time bar management and ordering system designed for seamless interaction between customers and staff. Built with a retro-futuristic CRT aesthetic, combining nostalgia with powerful modern technology.

---

## 🚀 Key Features

### 🍹 Customer Experience
- **Digital Menu**: Interactive and visually appealing menu for browsing products.
- **Fast Checkout**: Simplified ordering process with real-time feedback.
- **Order Tracking**: Keep track of order status directly from the interface.

### 📋 Bar Staff View
- **Real-time Orders**: Instant notifications when a new order is placed.
- **Order Fulfillment**: Efficiently manage and mark orders as complete.
- **Live Communication**: Integrated chat system to stay in sync with the team.

### 🔐 Admin Control Center
- **Dashboard**: High-level overview of sales, active orders, and current shifts.
- **Inventory Management**: Full control over products and categories (CRUD functionality).
- **Shift Tracking**: Comprehensive staff management system with shift logs and details.
- **History Logs**: Detailed audit trail for past orders and administrative actions.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler/Dev Server**: [Vite](https://vite.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Backend Services**: [Firebase](https://firebase.google.com/) (Authentication & Cloud Firestore)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Routing**: [React Router Dom 7](https://reactrouter.com/)

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- Firebase Account (to set up your project environment)

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-link]
   cd flow-bar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory and add your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
src/
├── app/          # Core application logic and configuration
├── assets/       # Static assets (images, icons, etc.)
├── components/   # Reusable UI components
├── context/      # React context providers for state management
├── hooks/        # Custom React hooks
├── pages/        # Application pages (Admin, Bar, Menu)
├── services/     # Firebase and external API interaction services
├── styles/       # Global styles and tailwind configuration
└── utils/        # Helper functions and utilities
```

---

## 📜 License

Private project - All rights reserved.
