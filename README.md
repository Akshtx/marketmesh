MarketMesh — Full demo (backend + stylish frontend)
=================================================

What's included
- backend/: Node + Express + Mongoose API
- frontend/: Static SPA (HTML/CSS/JS) with Login, Register, Product listing, and simple cart

Quick start (backend)
1. cd backend
2. copy .env.example -> .env and set MONGO_URI and JWT_SECRET
3. npm install
4. npm run seed
5. npm start

Quick start (frontend)
1. cd frontend
2. open index.html in your browser (or run a static server like `npx http-server` or `python -m http.server 4200`)
3. The frontend expects the backend at http://localhost:5000

Seeded admin
- email: admin@local
- password: admin123

