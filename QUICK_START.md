# 🎄 Quick Start for Christmas Day!

## Before Everyone Arrives

### 1. Start the Server
Open Terminal #1:
```bash
cd /Users/amirlakha/dev-node/iparty/server
npm start
```

You should see: `🎉 iParty server running on port 3001`

### 2. Start the Client
Open Terminal #2:
```bash
cd /Users/amirlakha/dev-node/iparty/client
npm run dev
```

You should see: `Local: http://localhost:5173/`

### 3. Get Your Computer's IP Address
In Terminal #3:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

Look for something like: `192.168.1.100`

**Write this down!** Players will need it.

---

## When Everyone Arrives

### On the Big TV/Screen:
1. Open browser to: `http://localhost:5173`
2. Click **"Host a Game"**
3. Enter your name
4. **WRITE DOWN THE ROOM CODE** - display it big on screen!

### On Each Player's Phone:
1. Connect to the **same WiFi** as your computer
2. Open browser to: `http://YOUR-IP:5173` (e.g., `http://192.168.1.100:5173`)
3. Click **"Join a Game"**
4. Enter the **ROOM CODE** from the TV
5. Enter their name and age

### Start Playing:
1. Once everyone joined, click **"START GAME"** on the TV
2. Players answer on their phones
3. Watch the points rack up!
4. At the end, everyone sees their **CASH PRIZE**! 💰

---

## Troubleshooting

**Players can't connect?**
- Everyone on same WiFi? ✅
- Used the IP address (not "localhost")? ✅
- Server and client both running? ✅

**Need to change the cash rate?**
- Edit line 250 in: `client/src/pages/HostScreen.jsx`
- Edit line 92 in: `client/src/pages/PlayerScreen.jsx`
- Current rate: $0.10 per point

**Want more/fewer rounds?**
- Default is 15 rounds
- Each round ~3-4 minutes
- Edit `generateRounds(game.players, 15)` in HostScreen.jsx

---

## 🎁 Have an amazing Christmas! 🎉
