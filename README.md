# 🚀 Contest-Guru

**Contest-Guru** is a **one-stop platform for competitive programmers**.  
We don’t host contests — instead, we aggregate contest information, profiles, and problem links into a single, easy-to-use platform.  

👉 **Live Demo:** [Contest-Guru](https://shubhamranswal.github.io/Contest-Guru/)

---

## ✨ Features (Planned & In Progress)

- 📅 **Contest Tracker**: See ongoing and upcoming contests from popular platforms (Codeforces, LeetCode, AtCoder, etc.).
- 👤 **Unified Profiles**: Submit your coding platform profile URLs and view a combined profile on Contest-Guru.
- 📝 **Problem Access**: Quick links to contest problems.
- 💡 **Future Roadmap**:
  - Contest editorials/solutions
  - Personalized dashboards
  - Leaderboard integrations

---

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Firebase (Firestore, Authentication, Hosting)  
- **Hosting (current):** GitHub Pages (for static prototype)  

---

## 📂 Project Structure

```

Contest-Guru/
│
├── index.html        # Entry point
├── assets/           # Images, icons, styles
├── css/              # Stylesheets (planned)
├── js/               # JavaScript logic (planned)
├── README.md         # Project docs
└── LICENSE           # Open source license

````

---

## 🚀 Getting Started

Clone the repository:
```bash
git clone https://github.com/shubhamranswal/Contest-Guru.git
cd Contest-Guru
````

Open `index.html` in your browser.
Or use a simple local server:

```bash
npx serve .
```

---

## 🔥 Firebase Setup Guide

Contest-Guru uses **Firebase** as backend for storing profiles, contests, and authentication.

### 1. Create Firebase Project

* Go to [Firebase Console](https://console.firebase.google.com/)
* Click **Add Project** → Choose a name (e.g. `contest-guru`)
* Enable **Firestore Database**
* Enable **Authentication** (Google/GitHub providers recommended)
* (Optional) Enable **Hosting** if you want to deploy directly on Firebase

---

### 2. Add Web App

* In Firebase console → Project Overview → **Add App** → **Web App**
* Copy the config snippet that looks like this:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "contest-guru.firebaseapp.com",
  projectId: "contest-guru",
  storageBucket: "contest-guru.appspot.com",
  messagingSenderId: "XXXXXXXX",
  appId: "1:XXXXXXXX:web:XXXXXXXX"
};
```

---

### 3. Initialize Firebase in Project

Inside `/js/firebaseConfig.js`:

```js
// Import Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Your Firebase config (replace with your own keys)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "contest-guru.firebaseapp.com",
  projectId: "contest-guru",
  storageBucket: "contest-guru.appspot.com",
  messagingSenderId: "XXXXXXXX",
  appId: "1:XXXXXXXX:web:XXXXXXXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

### 4. Usage Examples

* **Add a profile to Firestore**

```js
import { db } from './firebaseConfig.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

async function addProfile(url) {
  try {
    await addDoc(collection(db, "profiles"), { profileUrl: url, createdAt: Date.now() });
    console.log("Profile saved!");
  } catch (e) {
    console.error("Error adding profile: ", e);
  }
}
```

* **Authenticate user (Google Sign-In)**

```js
import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

async function login() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Logged in as:", result.user.displayName);
  } catch (e) {
    console.error("Login failed:", e);
  }
}
```

---

### 5. Deploying on Firebase Hosting (Optional)

If you want to host on Firebase (instead of GitHub Pages):

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## 🛣️ Roadmap

* [ ] Build clean UI for contest listings
* [ ] Integrate contest APIs (Codeforces, AtCoder, LeetCode, etc.)
* [ ] Add profile submission form (store profiles in Firebase)
* [ ] Generate combined user profiles (from Firebase)
* [ ] Add problem links for each contest
* [ ] Publish solutions/editorials section
* [ ] User authentication via Firebase (Google/GitHub login)
* [ ] Host complete app on Firebase Hosting

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a new branch (`feature/your-feature`)
3. Commit your changes
4. Push your branch and open a Pull Request

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
Feel free to use and contribute!
