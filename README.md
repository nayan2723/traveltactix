# 🌍 WanderQuest

**Travel. Play. Discover. Level Up Your Journey.**

WanderQuest is a next-gen travel platform that blends **gamification**, **real-time travel intelligence**, **cultural immersion**, and **offbeat discovery** into one seamless experience.

---

## 🚀 Features

### 🎯 Dynamic Gamified Missions

* Missions unlock based on **your location**
* Earn XP for completing tasks
* Track mission progress and completion
* Start/Stop missions with real-time state updates

### 🎭 Cultural Immersion

* Local phrases, etiquette, customs
* Region-based cultural cards
* Micro-tasks for extra XP

### 🏞️ Offbeat Destination Discovery

* Hidden gems not in typical guides
* Vibe filters (Adventure, Chill, Foodie, etc.)
* Map integration

### 👥 Real-Time Crowd Monitoring

* Live heatmap of crowd density
* Color-coded (Green/Yellow/Red)
* Suggests alternate quieter locations

### 🛍️ Rewards Shop

* Redeem XP for items/perks
* Reward cards with animations
* Balance updates immediately

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* TailwindCSS
* Framer Motion
* Lucide Icons
* React Google Maps API
* React Hot Toast

### Data / Backend

* Firestore (optional)
* LocalStorage fallback
* Google Places API
* Geolocation API

---

## 📁 Project Structure

```
/src
 ├── components
 ├── pages
 ├── data
 ├── utils
 └── styles
```

---

## ⚙️ Installation

```
git clone <repo-url>
npm install
npm install framer-motion lucide-react react-hot-toast
```

Add your `.env` file:

```
VITE_GOOGLE_MAPS_API_KEY=your_key
```

Start the app:

```
npm run dev
```

---

## 🧠 Logic Flow

### Missions

1. Get location
2. Filter missions by distance
3. Start mission → XP updates

### Crowd Map

1. Load map
2. Fetch/Simulate crowd data
3. Show heatmap
4. Suggest alternatives

### Shop

1. Fetch XP
2. Display rewards
3. Deduct XP on redeem

---

## 🎨 UI Style (Osmo-inspired)

* Minimalist layout
* Clean typography
* Soft shadows and gradients
* Smooth transitions

---

## 🐛 Troubleshooting

* **Missions not loading:** Check location permissions
* **Map not showing:** Validate API key
* **XP not updating:** Check localStorage or Firestore sync

---

## 🛣️ Roadmap

* AR missions
* Social groups
* Shop inventory system
* Local events feed

---

## 📜 License

MIT License
