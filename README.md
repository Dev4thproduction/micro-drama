Here is a professional `README.md` file tailored to your **Vertical Micro-Drama** project. You can place this in the root of your repository or use it as the main documentation.

---

# 🎬 Vertical Micro-Drama Platform

A full-stack streaming platform dedicated to short-form vertical dramas. Built with the **MERN stack** and **Next.js**, this application features a TikTok-style viewing experience, a freemium subscription model, and robust content management.

## 🚀 Key Features

* **📺 Vertical Viewing Experience:** Immersive, full-screen vertical video player designed for mobile-first consumption.
* **🔒 Freemium Access Model:**
* **Free Tier:** Users can watch the first 2 episodes of any series for free.
* **Premium Tier:** Subscription-based access to unlock full series and exclusive content.
* *Smart locking logic enforces security at both the UI and API level.*


* **📂 Content Management System (CMS):**
* Creators/Admins can upload Series and Movies.
* Manage episodes, thumbnails, and metadata.
* Support for "Draft", "Pending", and "Published" workflows.


* **☁️ Cloud Streaming:**
* **Video Storage:** Secure streaming via **AWS S3** with presigned URLs.
* **Media Assets:** Optimized image hosting via **Cloudinary**.


* **👤 User Features:**
* Secure Authentication (JWT).
* Watch History & Progress tracking (resumes where you left off).
* "My List" and Likes.


* **🛠️ Admin Dashboard:** Comprehensive analytics, user management, and content moderation tools.

---

## 🛠️ Tech Stack

### **Frontend**

* **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
* **Language:** TypeScript
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **State/Network:** React Context API, Axios
* **Player:** HTML5 Video with Custom Controls

### **Backend**

* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JSON Web Tokens (JWT) & Bcrypt
* **Storage:** AWS SDK (S3) & Cloudinary SDK

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites

* Node.js (v18 or higher recommended)
* MongoDB (Local or Atlas)
* AWS Account (S3 Bucket)
* Cloudinary Account

### 2. Clone the Repository

```bash
git clone https://github.com/yourusername/vertical-micro-drama.git
cd vertical-micro-drama

```

### 3. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install

```

Create a `.env` file in the `backend/` folder with the following variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_s3_bucket_name

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

```

Start the backend server:

```bash
npm run dev
# Server will start on http://localhost:5000

```

### 4. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install

```

Create a `.env.local` file in the `frontend/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

```

Start the frontend development server:

```bash
npm run dev
# App will run on http://localhost:3000

```

---

## 📂 Project Structure

```bash
vertical-micro-drama/
├── backend/
│   ├── src/
│   │   ├── config/         # DB and Env config
│   │   ├── controllers/    # Logic for Auth, Content, Video, etc.
│   │   ├── middleware/     # Auth checks, Error handling
│   │   ├── models/         # Mongoose Schemas (User, Series, Episode)
│   │   ├── routes/         # API Route definitions
│   │   └── utils/          # Helper functions (S3 signing, responses)
│   └── server.js           # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router pages
│   │   ├── components/     # Reusable UI components
│   │   │   ├── player/     # Video Player logic
│   │   │   ├── cms/        # Admin forms and modals
│   │   │   └── ...
│   │   ├── context/        # AuthProvider and Global State
│   │   └── lib/            # API client setup
│   └── public/             # Static assets
└── ...

```

---

## 🔌 API Documentation (Brief)

| Method | Endpoint | Description |
| --- | --- | --- |
| **Auth** |  |  |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive JWT |
| **Content** |  |  |
| `GET` | `/api/content/home` | Get featured & trending series |
| `GET` | `/api/content/series/:id` | Get series details & episodes |
| `GET` | `/api/video/stream/:id` | Get presigned S3 playback URL |
| **Subscription** |  |  |
| `POST` | `/api/subscription/subscribe` | Activate subscription (Mock/Stripe) |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](https://www.google.com/search?q=LICENSE) file for details.