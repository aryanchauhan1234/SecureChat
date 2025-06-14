
<img width="1274" alt="Screenshot 2025-06-14 at 7 22 45 PM" src="https://github.com/user-attachments/assets/329ac4ce-335e-42fc-9414-9b56f339f893" />

SecureChat Realtime Chat App with real time end to end endcritption  ✨

<img width="1275" alt="Screenshot 2025-06-14 at 7 23 03 PM" src="https://github.com/user-attachments/assets/79a62285-cb84-4cc9-9dfc-6c5ce6ea5392" /># ✨ Full 

# 🔐 SecureChat – End-to-End Encrypted Messaging App

SecureChat is a modern full-stack chat application built with security and privacy at its core. Using cutting-edge **end-to-end encryption (E2EE)**, SecureChat ensures that messages can only be read by the intended recipients — not even the server can decrypt them.

---

## 🚀 Features

- 🔐 **End-to-End Encryption (E2EE)** using **RSA + AES Hybrid Encryption**
- 🧑‍🤝‍🧑 Real-time 1:1 messaging
- 🖼️ Send text and image messages
- 🟢 Online/offline presence indicator
- 🔒 Secure key generation and exchange per user
- 🗑️ Ephemeral message keys – no permanent storage of private keys
- 🧠 Smart error handling and toast notifications
- 🌐 Cross-browser and responsive UI

---

## 🧰 Tech Stack

**Frontend:**
- React.js + Tailwind CSS
- Zustand (for global state management)
- CryptoJS (for frontend encryption logic)

**Backend:**
- Node.js + Express
- MongoDB with Mongoose
- Cloudinary (for image storage)
- JSON Web Tokens (JWT) for authentication
- IndexedDB (for local private key storage in browser)

**Security:**
- RSA (asymmetric encryption) for secure key exchange
- AES (symmetric encryption) for efficient message encryption
- Per-user public/private key generation
- End-to-end encryption handled entirely on the client-side

---

## 🔧 Local Development Setup

### Prerequisites

- Node.js and npm
- MongoDB running locally or MongoDB Atlas URI
- Git

### Clone the repository

```bash
git clone https://github.com/your-username/SecureChat.git
cd SecureChat

### Setup .env file

```js
MONGODB_URI=...
PORT=5001
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

NODE_ENV=development
```

### Build the app

```shell
npm run build
```

### Start the app

```shell
npm start
```
