# 🎄 iParty - Save Christmas Village!

An autonomous, story-driven Christmas adventure party game where kids work together to save Christmas by completing challenges across Santa's workshop.

**Target Players:** Ages 7-17
**Game Length:** 60-75 minutes
**Devices:** TV/projector for main screen + phones/tablets as controllers

---

## 🎮 Game Overview

### The Story

OH NO! Santa's magical workshop has broken down! The toy machines are jammed, the reindeer are lost, gift wrapping has stopped, cookies are unbaked, and the sleigh won't launch!

Players must work together to fix all 5 workshop sections by completing challenges. Each section needs ⭐⭐⭐ (3 stars) to be repaired. Fail to get 3 stars? Retry until you succeed! Only when ALL workshops are fixed can Christmas be saved!

### How It Works

**Main Screen (TV):** Shows the story, questions, and results - everyone watches together
**Player Devices:** Simple controllers for answering questions - minimal UI

This creates a shared experience like Jackbox games - all eyes on the TV!

### Game Structure

```
5 Workshop Sections × 3 Challenges Each = 15 Total Rounds

🎁 Section 1: Toy Machine Workshop (Rounds 1-3)
🦌 Section 2: Reindeer Stable (Rounds 4-6)
🎀 Section 3: Gift Wrapping Station (Rounds 7-9)
🍪 Section 4: Cookie Kitchen (Rounds 10-12)
🛷 Section 5: Sleigh Launch Pad (Rounds 13-15)
```

**To Win:** Earn ⭐⭐⭐ on all 5 sections = 15 total stars = Christmas saved!

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- Computer for running the server
- WiFi network
- TV/large screen for main display
- Phones/tablets for each player

### Setup (5 minutes)

**1. Start the Server**

Open Terminal #1:
```bash
cd server
npm start
```

You should see: `🎉 iParty server running on port 3001`

**2. Start the Client**

Open Terminal #2:
```bash
cd client
npm run dev
```

You should see: `Local: http://localhost:5173/`

**3. Get Your Computer's IP Address**

Terminal #3:
```bash
# Mac/Linux:
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows:
ipconfig
```

Look for: `192.168.x.x` or `10.0.x.x`
**Write this down!** Players need it to connect.

---

## 🎯 How to Play

### On the Main Screen (TV):

1. Open browser to: `http://localhost:5173`
2. Click **"Coordinate a Game"**
3. Enter coordinator name
4. **Display the ROOM CODE** big on screen!

### On Each Player's Device:

1. Connect to **same WiFi** as the server computer
2. Open browser to: `http://YOUR-IP:5173`
   (e.g., `http://192.168.1.100:5173`)
3. Click **"Join a Game"**
4. Enter the **room code** from TV
5. Enter name and age

### Start the Adventure:

1. Once everyone joined, click **"START GAME"** on TV
2. Game runs **fully autonomous** - no host control needed!
3. Players answer on their devices
4. Everyone watches the main screen together
5. Complete all 5 sections to save Christmas!

---

## ⭐ Star System (Team Performance)

### How Stars Work

Each section has 3 challenges. Stars earned based on team performance:

```
Total correct answers ÷ Total possible × 100 = Percentage

80%+ → ⭐⭐⭐ PASS (move to next section)
60-79% → ⭐⭐ RETRY (replay this section)
<60% → ⭐ RETRY (replay this section)
```

**Example (2 players, 3 challenges):**
- 6 total possible correct answers
- Need 5-6 correct (83%+) to pass with 3 stars
- 4 correct (67%) = Only 2 stars = Retry section

**This is cooperative!** Work together to get 3 stars on every section.

### Individual Points (For Fun Competition)

While earning stars together, players compete for highest individual score:

```
Correct answer: 100 base points + speed bonus (0-100)
Wrong answer: 0 points
```

**Speed bonus example:**
- Answer in 5 seconds = +92 bonus = 192 total points
- Answer in 30 seconds = +50 bonus = 150 total points
- Answer in 55 seconds = +8 bonus = 108 total points

Fastest correct answer gets most points!

---

## 🎮 Mini-Games

**Currently Implemented:**
1. Speed Math - Quick arithmetic

**Coming Soon:**
2. Multiple Choice Trivia
3. True/False Questions
4. Spelling Bee
5. Color Pattern Match
6. Memory Match

See `MINI_GAMES.md` for full game designs.

---

## 🎨 Visual Design

The game features 13 custom-generated images:

**Backgrounds:** 5 workshop scenes
**Characters:** Santa, Elf, Reindeer
**UI Elements:** Logo, stars, map, celebrations

All artwork located in: `client/src/assets/images/`

---

## 📱 Troubleshooting

### Players Can't Connect

**Check:**
- ✅ Everyone on same WiFi network?
- ✅ Used IP address, not "localhost"?
- ✅ Both server and client running?
- ✅ Firewall not blocking ports 3001 or 5173?

### Game Not Loading

- Check both terminals - server AND client must be running
- Look for errors in browser console (F12)
- Try refreshing the page

### Socket Connection Failed

- Verify server shows "Client connected" logs
- Check `client/src/context/SocketContext.jsx` socket URL
- Try restarting both server and client

---

## 🛠 Technical Details

**Frontend:** React 19.2, Vite, Tailwind CSS
**Backend:** Node.js, Express, Socket.io
**Real-time:** WebSocket communication
**State Management:** Server-authoritative game state

### Project Structure

```
iparty/
├── client/              # React frontend
│   ├── src/
│   │   ├── pages/       # Main screens
│   │   ├── components/  # Reusable UI
│   │   ├── context/     # Socket context
│   │   ├── data/        # Story & questions
│   │   ├── utils/       # Game logic
│   │   └── assets/      # Images
│   └── package.json
├── server/              # Node.js backend
│   ├── index.js         # Main server
│   ├── utils/           # Game utilities
│   └── package.json
├── IMPLEMENTATION_PLAN.md  # Technical roadmap
├── MINI_GAMES.md        # Game designs
└── CLAUDE.md            # AI assistant guide
```

---

## 📝 Development Notes

### Current Status (Dec 24, 2024)

**Working:**
- ✅ Multiplayer infrastructure
- ✅ Autonomous game flow
- ✅ Basic challenge generation
- ✅ Socket communication

**In Progress:**
- 🔄 Screen architecture redesign (TV vs controllers)
- 🔄 Star rating system implementation
- 🔄 Section retry mechanism

**Planned:**
- ⏳ Additional mini-games (5 more)
- ⏳ Artwork integration
- ⏳ Cloud deployment

See `IMPLEMENTATION_PLAN.md` for detailed technical roadmap.

---

## 🎄 Christmas Day Tips

1. **Test ahead:** Run through one full game before family arrives
2. **Room code:** Write it LARGE on the TV screen
3. **IP address:** Have it ready on a sticky note
4. **WiFi:** Make sure everyone knows the network name/password
5. **Timing:** Set aside 75-90 minutes for full playthrough
6. **Backup:** Keep the server computer plugged in!

---

## 🎁 Have an Amazing Christmas!

Merry Christmas! May your family save Christmas Village together! 🎉🎄

---

**Built with ❤️ for Christmas 2024**
React • Node.js • Express • Socket.io • Tailwind CSS
