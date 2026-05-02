# ShareBook Management System 📚

ShareBook is a full-stack web application built on the MERN stack that allows users to seamlessly buy, sell, and auction books. Designed with a premium, responsive UI, it provides a comprehensive marketplace experience with dedicated roles for Users and Administrators.

## 🚀 Features

- **E-Commerce Marketplace**: Browse available books, add them to your cart, and place orders seamlessly.
- **Live Auctions Engine**: List your own rare or used books for auction. Users can place bids, and the system automatically tracks the highest bidder.
- **Automated Ownership Transfer**: Once an auction ends, the system automatically transfers ownership to the highest bidder by generating an order in their personal library.
- **Role-Based Access Control (RBAC)**: Securely register as a standard User or an Administrator.
- **Admin Dashboard**: Administrators have exclusive access to view all system-wide orders and manage delivery statuses (Mark as Delivered).
- **User Dashboard**: Track your personal order history, read your purchased books in "My Library", and manage the books you have listed for sale or auction.

## 💻 Tech Stack

- **Frontend**: React.js, Vite, Vanilla CSS 
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Authentication**: JSON Web Tokens (JWT), Bcrypt Password Hashing

## 🛠️ How to Run Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [MongoDB](https://www.mongodb.com/) installed on your machine.

### 1. Clone the Repository
```bash
git clone https://github.com/Manav240206/ShareBook-Management-System.git
cd ShareBook-Management-System
```

### 2. Start the Backend Server
```bash
cd backend
npm install
node server.js
```
*The backend will start running on `http://localhost:5005`*

### 3. Start the Frontend Application
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will start running on `http://localhost:5174`*

