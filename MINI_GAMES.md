# iParty Mini-Games Design

**Last Updated:** Dec 23, 2024

---

## 🎮 Game Categories

### Category A: Interactive Competitive Games
High engagement, real gameplay between players

### Category B: Knowledge Challenges
Speed + accuracy, age-adaptive difficulty

### Category C: Creative Challenges
Drawing, guessing, creativity-based

---

## 🎯 CATEGORY A: Interactive Competitive Games

### 1. **Connect 4** ⭐ Must-Have
**Players:** 2 players or 2 teams
**Duration:** 3-4 minutes
**How it works:**
- Classic Connect 4 board displayed on TV
- Players/teams take turns dropping pieces
- First to get 4 in a row wins
- Mobile shows whose turn + their color
- Tap column on phone to drop piece

**Scoring:**
- Winner: 50 points
- Loser: 20 points (participation)
- Other players watching: 10 points

**Technical:**
- Grid state management (7×6 board)
- Turn-based logic
- Win condition detection (horizontal, vertical, diagonal)
- **Complexity:** Medium

**Story Integration:**
- "Fix the Toy Machine by completing the gear pattern!"
- Board = gear mechanism
- Connects = gears aligning

---

### 2. **Memory Cards** ⭐ Must-Have
**Players:** All compete simultaneously
**Duration:** 2-3 minutes
**How it works:**
- 12 cards (6 pairs) face-down on screen
- All players have the same grid on their phones
- Tap two cards to flip them
- Find matching pairs
- Most pairs found = winner

**Scoring:**
- First place (most pairs): 50 points
- Second place: 40 points
- Third place: 30 points
- Everyone else: 20 points

**Technical:**
- Card grid with flip animations
- Match detection
- Real-time sync of flipped cards
- Timer
- **Complexity:** Medium

**Story Integration:**
- "Help match the toy parts to fix the machine!"
- Cards show toy components, Christmas items

---

### 3. **Drawing Game** (Pictionary-style) ⭐ High Engagement
**Players:** 1 drawer, others guess
**Duration:** 2 minutes per round
**How it works:**
- One player selected as drawer (random or rotation)
- Drawer gets secret word on phone (e.g., "Snowman")
- Drawer uses phone to draw (canvas)
- Drawing appears in real-time on TV
- Other players type guesses on their phones
- First correct guess wins

**Scoring:**
- Drawer: 30 points (if someone guesses correctly)
- First correct guesser: 50 points
- Second correct: 40 points
- Third correct: 30 points
- Other correct guesses: 20 points
- Wrong guesses: 5 points

**Technical:**
- Canvas drawing on mobile
- Real-time drawing sync to TV
- Text input for guessing
- Answer matching (fuzzy matching)
- **Complexity:** High (but super engaging!)

**Story Integration:**
- "Draw the blueprint to repair the machine!"
- Christmas-themed words

---

### 4. **Charades** ⭐ Party Classic
**Players:** 1 actor, others guess
**Duration:** 2 minutes per round
**How it works:**
- One player selected as actor
- Actor gets secret word/phrase on phone
- Actor performs (no sounds, just actions)
- Other players watch on TV (if camera enabled) OR just watch in person
- Players type guesses on phones
- First correct wins

**Scoring:**
- Actor: 30 points (if someone guesses)
- First correct: 50 points
- Second: 40 points
- Third: 30 points
- Others: 20 points

**Technical:**
- Timer with countdown
- Text input for guessing
- Answer matching
- Optional: Camera integration (advanced)
- **Complexity:** Medium-Low (without camera)

**Story Integration:**
- "Act out how to fix the machine!"
- Christmas and toy-themed words

**Note:** Camera integration is optional - kids can just act in the room while others watch both TV screen and the actor.

---

## 🎯 CATEGORY B: Knowledge Challenges

### 5. **Speed Math** ⭐ Must-Have
**Players:** All compete
**Duration:** 1-2 minutes
**How it works:**
- Math problem appears (age-adaptive)
- Multiple choice or type answer
- First correct = most points
- Speed matters

**Age Adaptation:**
- Ages 7-9: `5 + 3 = ?`
- Ages 10-12: `12 × 8 = ?`
- Ages 13-17: `(15 × 4) - (60 ÷ 5) = ?`

**Scoring:**
- First correct: 50 points
- Second: 40 points
- Third: 30 points
- Other correct: 20 points
- Wrong: 5 points

**Technical:**
- Age-based question pool
- Speed tracking
- Answer validation
- **Complexity:** Low

---

### 6. **Spelling Challenge** ⭐ Must-Have
**Players:** All compete
**Duration:** 1-2 minutes
**How it works:**
- Word displayed with letters scrambled OR
- Audio plays word to spell OR
- Definition given, spell the word

**Age Adaptation:**
- Ages 7-9: "SNETR" → "STERN" (5 letters)
- Ages 10-12: "NEBIDRER" → "REINDEER" (8 letters)
- Ages 13-17: "CEREMBDE" → "DECEMBER" (8+ letters)

**Scoring:** Same as Speed Math

**Technical:**
- Word database by difficulty
- Text input validation
- Optional: Text-to-speech for audio
- **Complexity:** Low-Medium

---

### 7. **Word Definitions** ⭐ Vocabulary Builder
**Players:** All compete
**Duration:** 1-2 minutes
**How it works:**
- Definition appears
- Multiple choice: Which word matches?
- OR: Word appears, which definition?

**Example:**
```
Definition: "A vehicle Santa uses to deliver presents"
A) Truck  B) Sleigh  C) Airplane  D) Boat
```

**Age Adaptation:**
- Younger: Simple common words
- Older: Advanced vocabulary

**Scoring:** Same as Speed Math

**Technical:**
- Definition database
- Multiple choice logic
- **Complexity:** Low

---

### 8. **Trivia Challenge** ⭐ Classic
**Players:** All compete
**Duration:** 1-2 minutes
**How it works:**
- Question with multiple choice answers
- Christmas, general knowledge, or themed
- Speed + correctness

**Categories:**
- Christmas trivia
- General knowledge
- Science & nature
- Pop culture (age-appropriate)

**Age Adaptation:**
- Vary question difficulty
- Older kids get harder questions

**Scoring:** Same as Speed Math

**Technical:**
- Question database with difficulty tags
- Multiple choice
- **Complexity:** Low

---

## 🎨 CATEGORY C: Creative Challenges

### 9. **Pattern Match** ⭐ Visual/Memory
**Players:** All compete
**Duration:** 1-2 minutes
**How it works:**
- Pattern shown for 5 seconds (colors, shapes, sequence)
- Pattern disappears
- Players select matching pattern from options

**Example:**
```
Show: 🔴 🔵 🟢 🟡 🔴
Hide
Options:
A) 🔴 🔵 🟢 🟡 🔴 ✓
B) 🔵 🔴 🟢 🟡 🔴
C) 🔴 🔵 🔵 🟡 🔴
```

**Scoring:** Same as Speed Math

**Technical:**
- Pattern generation
- Timer for display
- Multiple choice
- **Complexity:** Low

---

## 📊 Implementation Priority

### Phase 1: MVP (Must-Have for Christmas)
Build these first - simpler, high engagement:
1. ✅ **Speed Math** - Easy, works for all ages
2. ✅ **Trivia Challenge** - Easy, engaging
3. ✅ **Memory Cards** - Medium complexity, fun
4. ✅ **Spelling Challenge** - Easy, educational
5. ✅ **Connect 4** - Medium, competitive

**Total:** 5 mini-games
**Time:** ~6-8 hours to build all 5

### Phase 2: Enhanced (If Time Permits)
Add these if we have time:
6. **Word Definitions** - Easy addition
7. **Pattern Match** - Easy, visual

**Time:** +2-3 hours

### Phase 3: Advanced (Post-Christmas)
High complexity, save for later:
8. **Drawing Game** - Requires canvas sync
9. **Charades** - Requires camera integration

**Time:** +4-5 hours each

---

## 🎮 Game Flow in Story

### Workshop Section Example: "Fix the Toy Machine"

**Story Intro (30 sec):**
```
Santa: "Oh no! The Toy Machine is broken!
We need to collect 3 Magic Stars to fix it!"
```

**Challenge 1: Connect 4**
```
"Complete the gear pattern to align the machine!"
[Players play Connect 4]
Winner gets 50 pts, everyone gets ⭐
```

**Challenge 2: Speed Math**
```
"Calculate how many toys we need to make!"
[Math questions, age-adaptive]
Fast + correct = more points + ⭐
```

**Challenge 3: Memory Cards**
```
"Match the toy parts to reassemble them!"
[Memory card game]
Most matches = winner + ⭐
```

**Success Animation:**
```
✨ Machine starts working! ✨
[Celebration, points awarded]
[Progress to next workshop section]
```

---

## 🎯 Age Adaptation System

### Automatic Difficulty Scaling

**Input:** Player age from registration
**Output:** Adjusted question difficulty

```javascript
function getDifficulty(age) {
  if (age >= 7 && age <= 9) return 'easy';
  if (age >= 10 && age <= 12) return 'medium';
  if (age >= 13 && age <= 17) return 'hard';
  return 'medium'; // default
}
```

**Question Selection:**
- Pull from difficulty-tagged question pool
- Ensure fair competition within age groups
- OR: Different questions for different ages simultaneously

**Example Implementation:**
```
Math Question Pool:
{
  easy: ["2 + 3 = ?", "5 - 1 = ?", ...],
  medium: ["12 × 8 = ?", "45 ÷ 5 = ?", ...],
  hard: ["(15 × 4) - (60 ÷ 5) = ?", ...]
}

On challenge start:
- Alex (age 8) gets: "2 + 3 = ?"
- Sam (age 14) gets: "(15 × 4) - (60 ÷ 5) = ?"
- Both compete fairly within their level
```

---

## 🎨 Visual Design for Mini-Games

### Connect 4
- Colorful game board (red vs blue pieces)
- Animated piece drops
- Glow effect on winning 4-in-a-row
- Confetti on win

### Memory Cards
- Christmas-themed card backs (snowflakes, presents)
- Smooth flip animation
- Matches stay face-up with glow
- Celebration on match

### Drawing Game
- Simple drawing canvas (black on white)
- Color picker (optional)
- Undo button
- Clear button
- Drawing appears live on TV

### Charades
- Big timer countdown on TV
- Word/phrase display on actor's phone only
- Guess input on other phones
- Live guess feed on TV (like chat)

---

## 🏆 Scoring Balance

**Goal:** Everyone has fun, everyone earns points, but skill matters

### Point Distribution per Game:
- **Participation:** 5-20 points (just playing)
- **Good Performance:** 30-40 points
- **Winning:** 50+ points

### Expected Totals (15 challenges):
- **Struggling Player:** ~400 points = $40
- **Average Player:** ~500 points = $50
- **Top Performer:** ~700 points = $70

**Everyone wins money, but skill is rewarded!**

---

## 📱 Mobile UI for Each Game Type

### Connect 4
```
┌─────────────────┐
│  YOUR TURN!     │
│  (Red Player)   │
├─────────────────┤
│  Tap a column:  │
│  [1][2][3][4]   │
│  [5][6][7]      │
└─────────────────┘
```

### Memory Cards
```
┌─────────────────┐
│ Find the pairs! │
│ [?][?][?][?]    │
│ [?][?][?][?]    │
│ [?][?][?][?]    │
│ Timer: 45s      │
└─────────────────┘
```

### Drawing
```
┌─────────────────┐
│ Draw: SNOWMAN   │
│ ┌─────────────┐ │
│ │   [canvas]  │ │
│ │             │ │
│ └─────────────┘ │
│ [Undo] [Clear]  │
└─────────────────┘
```

### Others (Math, Trivia, etc.)
```
┌─────────────────┐
│  Question here  │
├─────────────────┤
│ [  Answer A  ]  │
│ [  Answer B  ]  │
│ [  Answer C  ]  │
│ [  Answer D  ]  │
└─────────────────┘
```

---

## ✅ Next Steps

1. **Review & Approve** these mini-games
2. **Prioritize** which ones to build first
3. **Generate artwork** for game boards, cards, etc.
4. **Start building** Phase 1 games

**Recommendation:**
Focus on Phase 1 (5 games) for Christmas, add others later if time permits.

---

**Ready to proceed with these mini-games?**
