# 🚀 Contest-Guru

**Contest-Guru** is a **one-stop platform for competitive programmers**.
We don’t host contests — instead, we **aggregate contest information, profiles, and problem links** into a single, easy-to-use interface.

👉 **Live Demo:** [Contest-Guru](https://shubhamranswal.github.io/Contest-Guru/)

---

## ✨ Features

**Currently implemented:**

* 📅 **Contest Tracker**: View ongoing and upcoming contests from popular platforms via Clist API (Codeforces, LeetCode, AtCoder, etc.).
* 📝 **Quick Problem Access**: Access contest problems directly from contest listings.

**Planned / In Progress:**

* 👤 **Unified Profiles**: Submit your coding platform profile URLs and view a combined profile.
* 💡 **Editorials & Solutions**: Add contest solutions and editorials.
* 🛠️ **Personalized Dashboards & Leaderboards**

---

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, JavaScript
* **Backend:** Firebase (Firestore, Authentication, Hosting) – **planned**
* **Hosting (current):** GitHub Pages (static prototype)

---

## 📂 Project Structure

```text
Contest-Guru/
  ├── index.html
  ├── assets/
  ├──── images/
  ├──── css/
  ├──── js/
  ├── README.md
  └── LICENSE

```

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/shubhamranswal/Contest-Guru.git
cd Contest-Guru
```

Open `index.html` in your browser or use a simple local server:

```bash
npx serve .
```

---

## 🔥 Firebase Setup (Planned)

Contest-Guru will use Firebase for storing profiles, contests, and authentication.

1. **Create Firebase Project**:

   * Go to [Firebase Console](https://console.firebase.google.com/) → Add Project → Enable Firestore and Authentication.
2. **Add Web App**: Copy the Firebase config snippet.
3. **Initialize Firebase in `/js/firebaseConfig.js`**:

```js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "contest-guru.firebaseapp.com",
  projectId: "contest-guru",
  storageBucket: "contest-guru.appspot.com",
  messagingSenderId: "XXXXXXXX",
  appId: "1:XXXXXXXX:web:XXXXXXXX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

---

## 🛣️ Roadmap

* [x] Build clean UI for contest listings.
* [x] Display contests via Clist API (Codeforces, AtCoder, LeetCode, CodeChef etc.)
* [ ] Add profile submission form (store in Firebase)
* [ ] Generate unified user profiles
* [ ] Add problem links for contests
* [ ] Publish editorials/solutions
* [ ] Implement user authentication (Google/GitHub)
* [ ] Host full app on Firebase Hosting

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
