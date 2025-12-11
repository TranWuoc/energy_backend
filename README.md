🏗️ Energy Efficiency Backend

Backend service for the Building Energy Efficiency / Building Performance project.

This service provides RESTful APIs for managing buildings, energy data, user authentication, and analysis modules.

🚀 Tech Stack
	•	Node.js + Express.js
	
	•	MongoDB + Mongoose
	
	•	Layered Architecture (Controller → Service → Repository)
	
	•	Environment Variables with .env
	
	•	Development tooling: Nodemon, Prettier

📁 Project Structure

src/
│── config/
│     └── db.js
│
│── models/
│     └── Building.js
│     └── User.js
│
│── controllers/
│     └── building.controller.js
│     └── user.controller.js
│
│── services/
│     └── building.service.js
│     └── user.service.js
│
│── routes/
│     └── building.routes.js
│     └── user.routes.js
│
│── utils/
│     └── error.js
│     └── response.js
│
└── server.js

⚙️ Installation

1️⃣ Clone repository

git clone https://github.com/your-username/energy-backend.git

cd energy-backend

2️⃣ Install dependencies

npm install

3️⃣ Create .env file

PORT=5000

MONGO_URI=mongodb://localhost:27017/energy_db

JWT_SECRET=your-secret-key

▶️ Running the Project

Development mode : npm run dev
