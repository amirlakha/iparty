# 🎉 iParty - Family Party Game

A fun, interactive party game for families! Built for Christmas 2024 where kids play fun challenges and earn points that convert to cash prizes!

## 🎮 Features

- **Multi-device gameplay**: Big screen for host + individual phones for players
- **10+ Challenge Types**: Trivia, Would You Rather, Creative Prompts, and more
- **Flexible Modes**: 1v1 battles, team challenges, and all-play rounds
- **Points to Cash**: Automatic conversion of game points to Christmas money
- **Ages 7-17**: Challenges designed for wide age range
- **Real-time Updates**: Socket.io powered live gameplay

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- A laptop/computer for the server
- Mobile phones for players
- A big screen/TV for displaying the host view

### Installation

1. **Start the Server** (in one terminal):
```bash
cd server
npm start
```

The server will run on `http://localhost:3001`

2. **Start the Client** (in another terminal):
```bash
cd client
npm run dev
```

The client will run on `http://localhost:5173`

### How to Play

1. **Host Setup** (on the big screen TV):
   - Open a browser and go to `http://localhost:5173`
   - Click "Host a Game"
   - Enter your name
   - You'll get a **ROOM CODE** - display this on the big screen!

2. **Players Join** (on their phones):
   - Each player opens their phone browser
   - Go to `http://YOUR-LAPTOP-IP:5173` (see below for finding your IP)
   - Click "Join a Game"
   - Enter the room code from the TV
   - Enter their name and age

3. **Start Playing**:
   - Once everyone has joined, the host clicks "START GAME"
   - Players answer challenges on their phones
   - Points are awarded after each round
   - Game ends with final scores and cash conversion!

### Finding Your Laptop's IP Address

**On Mac:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```bash
ipconfig
```

Look for your local IP (usually starts with `192.168.x.x` or `10.0.x.x`)

Then players visit: `http://YOUR-IP:5173` (e.g., `http://192.168.1.100:5173`)

## 💰 Points to Cash Conversion

- Default rate: **$0.10 per point**
- To change the rate, edit these files:
  - `client/src/pages/HostScreen.jsx` - Line 250 (POINTS_TO_CASH)
  - `client/src/pages/PlayerScreen.jsx` - Line 92 (POINTS_TO_CASH)

## 🎯 Game Structure

- **15 rounds** by default (configurable in `client/src/utils/roundGenerator.js`)
- **Mix of game modes**:
  - 1v1 battles (2 players compete)
  - Team challenges (teams work together)
  - All-play (everyone competes)

## 🎨 Challenge Types

1. **Quick Trivia** - Multiple choice questions
2. **Would You Rather** - Fun preference questions
3. **Creative Challenges** - Imaginative prompts
4. **Number Challenges** - Quick math
5. **Rhyme Time** - Find rhyming words
6. **This or That** - Pick favorites
7. **Quick Think** - Fast associations
8. **Emoji Story** - Interpret emoji sequences
9. **Finish the Sentence** - Complete prompts

## 📱 Troubleshooting

### Players can't connect from phones
- Make sure all devices are on the **same WiFi network**
- Check your firewall isn't blocking ports 3001 or 5173
- Try using your laptop's IP address instead of "localhost"

### Game not loading
- Make sure both server AND client are running
- Check the browser console for errors (F12)

### Socket connection failed
- Verify the server is running on port 3001
- Check `client/src/context/SocketContext.jsx` - change `localhost:3001` to your laptop's IP if needed

## 🛠 Customization

### Change Number of Rounds
Edit `client/src/pages/HostScreen.jsx`, find the `startGame()` function:
```javascript
const rounds = generateRounds(game.players, 15); // Change 15 to desired number
```

### Add More Challenges
Edit `client/src/utils/roundGenerator.js` and add to the `challenges` array

### Change Colors/Theme
Edit `client/tailwind.config.js` to customize colors

## 🎄 Christmas Game Tips

- Set aside 60-90 minutes for a full game
- Have the room code ready before calling everyone together
- Test with 2 players first to make sure everything works
- Consider adjusting the points-to-cash rate based on your budget
- Take screenshots of the final scoreboard!

## 📝 Notes

- The game uses in-memory storage, so restarting the server clears all games
- Room codes are randomly generated 6-character codes
- All players must wait in the lobby until the host starts
- Points are awarded for participation (10pts), completion (15pts), and winning (25pts)

## 🎁 Have Fun!

Merry Christmas! Enjoy the game with your family! 🎉

---

Built with ❤️ using React, Node.js, Express, and Socket.io
