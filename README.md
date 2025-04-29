# Click To Flip 💻

**Click To Flip** is a web app designed for PC flipping enthusiasts, hobbyists, and sellers.  
It lets you **build**, **track**, and **manage** custom PC builds — and even **analyze your sales stats** — all within a simple, powerful web interface.

---

## 🚀 Features
- 🔎 **7000+ Components** to choose from when building PCs
- ➕ **Add Your Own Components** if something is missing
- 🖥️ **Create and Track Builds** with detailed part lists and pricing
- 📈 **View Sale Stats** and monitor your flipping performance
- ☀️ Light / Dark Theme
- 🎯 **Simple, Intuitive Interface** built for speed and flexibility

---

## 🛠 Tech Stack
- **Frontend:** React, Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Authentication:** Secure session-based auth local login (Google login support coming soon)

---

## 📸 Screenshots

---

## 🧰 Getting Started (Development)
1. Clone the repository:
   ```bash
   git clone https://github.com/Dempsey845/ClickToFlip.git
   ```
2. Install dependencies:
   ```bash
   cd frontend && npm install
   cd ../backend && npm install
   ```
Here’s an improved version of the section for better clarity and formatting in your GitHub README:

---

3. Set up your `.env` files

You need to configure two `.env` files: one for the backend and one for the frontend.

#### Backend (`/backend/.env`)

Set the following environment variables for the backend:

- `PORT`: Port number the backend will listen on (e.g., `5000`)
- `PG_USER`: PostgreSQL username
- `PG_HOST`: PostgreSQL host (e.g., `localhost`)
- `PG_DATABASE`: PostgreSQL database name
- `PG_PASSWORD`: PostgreSQL password
- `PG_PORT`: PostgreSQL port number (e.g., `5432`)
- `FRONT_END_URL`: The URL for your frontend (e.g., `http://localhost:3000`)
- `SALTS`: The number of salts for hashing passwords (e.g., `10`)
- `SESSION_SECRET`: A secret key for signing session cookies (e.g., a long random string)

Example:

```env
PORT=5000
PG_USER=myuser
PG_HOST=localhost
PG_DATABASE=mydb
PG_PASSWORD=mypassword
PG_PORT=5432
FRONT_END_URL=http://localhost:3000
SALTS=10
SESSION_SECRET=your_random_secret_key_here
```

#### Frontend (`/frontend/.env`)

Set the following environment variables for the frontend:

- `VITE_BACKEND_URL`: The backend URL (e.g., `http://localhost:5000`)
- `VITE_FRONTEND_URL`: The frontend URL (e.g., `http://localhost:3000`)

Example:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:3000
```

---
4. Set up PostgreSQL DB
5. ```bash
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     password TEXT NOT NULL,
     user_name TEXT
   );
   
   CREATE TABLE components (
     id SERIAL PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     type VARCHAR(50) NOT NULL,
     brand VARCHAR(50) NOT NULL,
     model VARCHAR(255) NOT NULL,
     specs TEXT NOT NULL,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   
   CREATE INDEX idx_type ON components(type);
   CREATE INDEX idx_brand ON components(brand);
   
   CREATE TABLE builds (
     id SERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     description TEXT,
     total_cost NUMERIC,
     status TEXT DEFAULT 'planned',
     sale_price NUMERIC,
     sold_date DATE,
     profit NUMERIC,
     image_url TEXT,
     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
   );
   
   CREATE TABLE build_components (
     id SERIAL PRIMARY KEY,
     build_id INT REFERENCES builds(id) ON DELETE CASCADE,
     component_id INT REFERENCES components(id) ON DELETE CASCADE
   );
   ```
6. Run locally:
   ```bash
   cd backend && npm run dev
   cd frontend && npm start
   ```

---

## ⚙️ Roadmap
- [ ] Add sorting/filtering for builds
- [ ] Mobile version optimization

---

## 📜 License
This project is open-source and free to use.  

---

# 🌟 Start flipping smarter with **Click To Flip**!
