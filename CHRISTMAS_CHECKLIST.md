# 🎄 Christmas Day Checklist

## Pre-Game Setup (15 minutes before)

- [ ] Connect laptop to TV via HDMI
- [ ] Make sure laptop and all phones are on **same WiFi network**
- [ ] Open Terminal #1: `cd server && npm start`
- [ ] Open Terminal #2: `cd client && npm run dev`
- [ ] Run: `./get-ip.sh` to get your IP address
- [ ] Write IP address on paper for reference

## Game Setup (5 minutes)

- [ ] On TV browser: Go to `http://localhost:5173`
- [ ] Click "Host a Game" and enter your name
- [ ] **ROOM CODE appears** - write it BIG on whiteboard/paper
- [ ] Give each player the IP address and room code
- [ ] Each player visits `http://YOUR-IP:5173` on their phone
- [ ] Players join with room code, name, and age
- [ ] Wait for everyone to appear in lobby

## Start Playing

- [ ] Click "START GAME" when ready
- [ ] Enjoy 15 rounds of fun challenges!
- [ ] Watch points accumulate
- [ ] Celebrate the final scores and cash prizes!

## Points to Cash Settings

Current conversion rate: **$0.10 per point**

Example earnings for a full game:
- Average score: ~300-500 points = **$30-$50**
- Participation guaranteed: Everyone earns at least 250 points minimum
- Winner typically: 600+ points = **$60+**

To adjust the rate:
1. Edit `client/src/pages/HostScreen.jsx` - Line 250
2. Edit `client/src/pages/PlayerScreen.jsx` - Line 92
3. Restart client: `cd client && npm run dev`

## Troubleshooting

**"Can't connect to server"**
- Both terminals running? Check!
- Using correct IP address? Run `./get-ip.sh` again

**"Room code not found"**
- Is host screen loaded?
- Room code entered correctly? (case doesn't matter)

**"Players can't join"**
- All on same WiFi network?
- Firewall blocking? Try turning off firewall temporarily

**Need to restart?**
- Press Ctrl+C in both terminals
- Start server again
- Start client again
- Create new game room

## After the Game

- [ ] Take screenshot of final scores!
- [ ] Give out the cash/prizes
- [ ] Keep the terminals running if you want to play again
- [ ] Press Ctrl+C in both terminals when completely done

---

**Total Christmas Budget Estimate:**
- 4 players × average $40 each = ~$160
- 6 players × average $40 each = ~$240

Adjust points-to-cash rate to fit your budget!

🎁 **Merry Christmas and have fun!** 🎉
