# iParty - Christmas Adventure Game

**Status:** Planning & Redesign Phase
**Target Date:** Christmas Day (Dec 25, 2024)
**Last Updated:** Dec 23, 2024

---

## 🎯 Project Vision

An **engaging, story-driven party game** for kids aged 7-17 where they embark on a Christmas adventure, completing challenges to save Christmas. The game runs **autonomously** (no adult host needed), features **real artwork** and a **cohesive storyline**, with **automatic objective scoring**.

---

## 📋 Current Status

### ✅ Completed
- [x] Basic multiplayer infrastructure (Socket.io)
- [x] Player lobby and registration
- [x] Mobile + TV screen dual-interface
- [x] Network connectivity working
- [x] Basic scoring system
- [x] Points-to-cash conversion system
- [x] Game redesign and planning
- [x] Character artwork (Santa, Elf, Reindeer)
- [x] Background artwork (5 workshop scenes)
- [x] UI elements and icons (logo, star, map, celebration, victory)

### 🚧 In Progress
- [ ] Core game loop implementation (CURRENT)

### ❌ Needs Work
- [ ] Story-driven narrative framework
- [ ] Automatic objective scoring (no host needed)
- [ ] Engaging UI/UX with animations
- [ ] Cloud deployment (remove IP address complexity)
- [ ] Challenge types with clear winners
- [ ] Progress visualization

---

## 🎮 Game Design

### Story Concept: "Save Christmas Village"

**Premise:**
Santa's magical workshop has broken! The toy-making machines, reindeer stable, gift wrapper, and sleigh all need repairs. Kids must complete challenges to collect "Magic Stars" that power each machine. Complete all repairs to save Christmas!

**Story Arc:**
1. **Introduction** - Santa explains the problem
2. **The Journey** - 5 workshop sections to repair
3. **Challenges** - Complete mini-games to earn stars
4. **Climax** - Final challenge to launch the sleigh
5. **Resolution** - Christmas is saved! Rewards distributed

**Visual Theme:**
- Magical winter wonderland
- Bright, colorful, kid-friendly
- Christmas village aesthetic
- Cozy workshop interior scenes

---

## 🗺️ Game Flow

### Phase 1: Welcome & Setup (2 min)
```
1. Landing screen with game title & artwork
2. Enter room code or host new game
3. Players join with name & age
4. Waiting lobby with character selection?
5. Story introduction (animated)
6. "Let's Save Christmas!" button
```

### Phase 2: The Adventure (60-75 min)

**Map Progress:**
```
[Start] → Machine 1 → Machine 2 → Machine 3 → Machine 4 → Machine 5 → [Launch Sleigh!]
```

**Each Section (10-12 min):**
```
1. Story Scene (30 sec) - "The Toy Machine is broken!"
2. Challenge Round 1 (2-3 min)
3. Challenge Round 2 (2-3 min)
4. Challenge Round 3 (2-3 min)
5. Success Animation - Machine fixed! Stars awarded
6. Scoreboard update
7. Transition to next section
```

**Total:** 5 sections × 3 challenges = 15 challenge rounds

### Phase 3: Grand Finale (5 min)
```
1. All machines repaired!
2. Final bonus challenge
3. Launch the sleigh animation
4. Victory celebration
5. Final scores + cash conversion
6. "Merry Christmas!" screen
```

---

## 🎯 Mini-Games (Detailed in MINI_GAMES.md)

**See MINI_GAMES.md for complete specifications**

### Phase 1 - MVP (Build for Christmas):
1. **Connect 4** - 2-player competitive board game
2. **Memory Cards** - Find matching pairs
3. **Speed Math** - Age-adaptive math challenges
4. **Spelling Challenge** - Word spelling with difficulty levels
5. **Trivia Challenge** - Christmas & general knowledge

### Phase 2 - Enhanced (If time):
6. **Word Definitions** - Vocabulary matching
7. **Pattern Match** - Visual memory game

### Phase 3 - Advanced (Post-Christmas):
8. **Drawing Game** - Pictionary-style with canvas
9. **Charades** - Act it out with timer

**All games feature:**
- Objective automatic scoring
- Age-adaptive difficulty (7-9, 10-12, 13-17)
- Speed bonuses
- Clear winners
- Everyone earns participation points

---

## 🎨 Visual Assets Needed

### AI Image Generation List

**Theme:** Bright, colorful, kid-friendly Christmas illustration style (similar to children's book illustrations)

#### Main Characters (3-5 images)
1. **Santa** - Friendly, welcoming pose
2. **Elf Helper** - Cheerful guide character
3. **Reindeer** - Cute, magical-looking
4. **Snowman Assistant** - Optional extra character

#### Workshop Scenes (5 backgrounds)
1. **Toy Machine Room** - Gears, conveyor belts, toys
2. **Reindeer Stable** - Cozy barn with magical glow
3. **Gift Wrapping Station** - Colorful paper, ribbons, bows
4. **Cookie Kitchen** - Ovens, ingredients, festive treats
5. **Sleigh Launch Pad** - Snow-covered rooftop, stars

#### UI Elements
1. **Progress Map** - Top-down village view with 5 stations
2. **Magic Star** - Collectible currency icon
3. **Challenge Icons** - Small icons for each challenge type
4. **Success Burst** - Celebration animation graphic
5. **Loading Screens** - 2-3 transition graphics

#### Misc Assets
1. **Game Logo** - "iParty: Save Christmas Village"
2. **Victory Scene** - Sleigh flying over village
3. **Character Avatars** - Simple avatar options for players

**Total Images Needed:** ~20-25 images

**Style Guide:**
- Warm, inviting colors (reds, greens, golds, blues)
- Soft edges, rounded shapes
- High contrast for readability
- Magical sparkles and glows
- Child-friendly (ages 7-17)

---

## 💻 Technical Architecture

### Current Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express + Socket.io
- **Real-time:** WebSocket communication
- **Styling:** Tailwind CSS v3

### Cloud Deployment Options

**Option A: Vercel + Railway (Recommended)**
- Frontend: Vercel (free tier)
- Backend: Railway (free $5 credit)
- Total cost: Free for testing, ~$5-10/month if continued
- Setup time: 30 min

**Option B: Heroku**
- All-in-one deployment
- Free tier available (with limitations)
- Setup time: 20 min

**Option C: DigitalOcean App Platform**
- $5/month minimum
- Simple deployment
- Good performance

**Recommendation:** Start with Vercel + Railway for free testing

### Deployment Checklist
- [ ] Environment variables setup
- [ ] WebSocket configuration for cloud
- [ ] CORS configuration
- [ ] Production build optimization
- [ ] Custom domain (optional)

---

## 🎯 UI/UX Design

### Design Principles
1. **Big and Readable** - Large text, high contrast
2. **Touch-Friendly** - Large buttons for phone screens
3. **Minimal Scrolling** - Everything fits on screen
4. **Clear Feedback** - Visual/audio confirmation of actions
5. **Progress Visibility** - Always show where you are in the game

### Screen Layouts

#### Mobile (Player View)
```
┌─────────────────────┐
│   [Story Scene]     │ ← Full screen image/animation
│                     │
├─────────────────────┤
│  Challenge Question │ ← Large text
├─────────────────────┤
│   [Answer Button]   │ ← Touch targets
│   [Answer Button]   │
│   [Answer Button]   │
│   [Answer Button]   │
├─────────────────────┤
│  Timer: 30s | 120pts│ ← Status bar
└─────────────────────┘
```

#### TV/Host View (Big Screen)
```
┌───────────────────────────────────────┐
│  [Progress Map]    Round 5/15    ⭐ 45│
├───────────────────────────────────────┤
│                                       │
│         [Main Story/Challenge]        │
│           Visual Content              │
│                                       │
├───────────────────────────────────────┤
│ Player Stats:                         │
│ Alex: 120pts | Sam: 95pts | ...      │
└───────────────────────────────────────┘
```

---

## 📊 Scoring System (Revised)

### Point Values
- **First Correct:** 50 points
- **Second Correct:** 40 points
- **Third Correct:** 30 points
- **Correct (slower):** 20 points
- **Wrong Answer:** 5 points (participation)
- **No Answer:** 0 points

### Speed Multipliers
- **<5 seconds:** 2x points
- **5-10 seconds:** 1.5x points
- **10-20 seconds:** 1x points
- **>20 seconds:** 0.8x points

### Special Bonuses
- **Perfect Round:** All 3 questions in a section correct = 25 bonus
- **Speed Demon:** First to answer 5 times = 50 bonus
- **Comeback King:** Biggest point gain in one round = 30 bonus

### Points-to-Cash
- **Default Rate:** $0.10 per point
- **Expected Total per Player:** 400-600 points = $40-$60
- **Configurable** in settings

---

## 🚀 Implementation Plan

### Phase 1: Planning & Design (NOW)
- [x] Define game concept
- [ ] Finalize story arc
- [ ] Design all screens (wireframes)
- [ ] List all assets needed
- [ ] Review and approve plan

### Phase 2: Asset Creation (3-4 hours)
- [x] Generate character images (Santa, Elf, Reindeer)
- [x] Generate background images (5 workshop scenes)
- [x] Generate UI elements (logo, star icon, village map, celebration burst, victory scene)
- [ ] Create/find sound effects (optional)
- [ ] Optimize images for web
- [ ] Test assets in browser

### Phase 3: Core Game Loop (4-5 hours)
- [ ] Rebuild challenge system
- [ ] Implement auto-scoring
- [ ] Add timer/speed mechanics
- [ ] Story progression system
- [ ] Victory conditions

### Phase 4: UI/UX (3-4 hours)
- [ ] Integrate artwork
- [ ] Animated transitions
- [ ] Progress map visualization
- [ ] Mobile-optimized layouts
- [ ] Sound effects integration

### Phase 5: Cloud Deployment (1-2 hours)
- [ ] Setup Vercel account
- [ ] Setup Railway account
- [ ] Configure environment
- [ ] Deploy and test
- [ ] Share live URL

### Phase 6: Testing & Polish (2-3 hours)
- [ ] Full playthrough test
- [ ] Mobile device testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Final adjustments

**Total Estimated Time:** 15-20 hours
**Realistic Timeline:** Tonight + Tomorrow (Dec 24)

---

## 🎨 AI Image Generation Prompts

### Prompt Template
```
Style: Bright, colorful children's book illustration, Christmas theme,
warm colors, soft edges, magical glow, high contrast, suitable for ages 7-17

[Specific scene description]

Technical: Digital illustration, 1920x1080px, PNG with transparency
```

### Batch 1: Characters (Generate these first)
1. "Santa Claus standing in workshop, friendly smile, welcoming gesture"
2. "Cute Christmas elf in green outfit, cheerful expression, holding wrench"
3. "Magical reindeer with glowing antlers, friendly face"

### Batch 2: Backgrounds (Generate after characters approved)
4. "Toy workshop with broken machines, gears, conveyor belts"
5. "Cozy reindeer stable interior, hay, magical lights"
6. "Gift wrapping station, colorful paper and ribbons everywhere"
7. "Christmas cookie kitchen, ovens, ingredients, festive"
8. "Rooftop sleigh launch pad, snow, starry night sky"

### Batch 3: UI Elements
9. "Top-down Christmas village map with 5 connected buildings"
10. "Glowing golden star icon, magical sparkles"
11. "Celebration burst effect, fireworks, confetti"

---

## 📝 Decision Log

### Dec 23, 2024 - Initial Design
- **Decision:** Move from random questions to story-driven adventure
- **Reason:** More engaging for kids, cohesive experience
- **Impact:** Complete game redesign needed

- **Decision:** Remove host role, make fully autonomous
- **Reason:** Kids will play without adult supervision
- **Impact:** Must have objective scoring only

- **Decision:** Use AI-generated artwork
- **Reason:** Time constraint, customizable, professional look
- **Impact:** Need to generate ~20-25 images

- **Decision:** Cloud hosting (Vercel + Railway)
- **Reason:** Eliminate IP address complexity
- **Impact:** Simpler setup on Christmas day

### Dec 23, 2024 - Background Style Discovery
- **Decision:** Use gradient backgrounds with subtle silhouettes (15-30% opacity) instead of detailed scenes
- **Reason:** Detailed backgrounds too busy for UI; plain gradients lack theming
- **Impact:** Found perfect balance - atmospheric theming without overwhelming game interface
- **Result:** All 5 backgrounds completed in consistent style

### Dec 23, 2024 - Complete Asset Generation
- **Achievement:** All 13 game assets generated and saved
- **Characters (3):** santa-character.png, elf-character.png, reindeer-character.png
- **Backgrounds (5):** bg-toy-machine.png, bg-reindeer-stable.png, bg-gift-wrap.png, bg-cookie-kitchen.png, bg-sleigh-launch.png
- **UI Elements (5):** game-logo.png, star-icon.png, village-map.png, celebration-burst.png, victory-scene.png
- **Tool:** ChatGPT Plus (DALL-E 3)
- **Style:** Consistent children's book illustration style, ages 7-17
- **Ready:** All artwork complete, ready to integrate into game

---

## 🔄 Session Continuity

### When Starting a New Session:
1. Read this PROJECT.md file first
2. Check "Current Status" section
3. Review recent "Decision Log" entries
4. Continue from current phase in Implementation Plan
5. Update progress as you work

### Before Ending a Session:
1. Update "Current Status" checkboxes
2. Add any new decisions to "Decision Log"
3. Note any blockers or questions
4. Update "Last Updated" date

---

## 🎁 Christmas Day Deployment Plan

### Morning Setup (30 min)
1. Open browser to live URL
2. Create game room
3. Test with one phone
4. Display room code on TV

### Game Runtime
- No server management needed
- Game runs automatically
- Kids play independently
- Adults can watch on TV

### Troubleshooting
- Live URL always works (no IP issues)
- Refresh page if disconnected
- Room codes work from anywhere

---

## 💡 Future Enhancements (Post-Christmas)

- Multiple story themes (Birthday, Halloween, etc.)
- Player customizable avatars
- Voice narration for story
- More challenge types
- Achievements and badges
- Replay value with randomized elements
- Multiplayer teams
- Parent dashboard for monitoring

---

**Next Steps:** Generate AI artwork and build core game loop
