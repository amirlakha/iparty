# Connect 4 Game Specification

## Game Mechanics

### Team Assignment
- Players automatically divided into 2 teams: **Team Red** vs **Team Blue**
- Teams balanced as evenly as possible
- Odd players: One team gets +1 player

**Example:**
- 4 players: 2 Red, 2 Blue
- 5 players: 3 Red, 2 Blue (or vice versa)

### Turn Order
Players alternate turns **individually** between teams:

**Example with 4 players:**
```
Team Red: Joe, Simon
Team Blue: Amy, Kat

Turn 1: Amy (Blue) → places blue counter
Turn 2: Joe (Red) → places red counter
Turn 3: Kat (Blue) → places blue counter
Turn 4: Simon (Red) → places red counter
Turn 5: Amy (Blue) → back to first Blue player
Turn 6: Joe (Red) → back to first Red player
... continues
```

**Turn cycling:**
- Blue team cycles: Amy → Kat → Amy → Kat → ...
- Red team cycles: Joe → Simon → Joe → Simon → ...
- Teams alternate: Blue, Red, Blue, Red, Blue, Red...

### Game Board
- Classic Connect 4: **7 columns × 6 rows**
- Pieces drop to lowest available position in chosen column
- Cannot place in full column

### Win Conditions

**Victory:**
- First team to connect **4 in a row** (horizontal, vertical, or diagonal)
- Game ends immediately

**Draw:**
- Board completely full with no 4-in-a-row
- All 42 spaces filled (7×6)

### Scoring

| Outcome | Points per Player |
|---------|------------------|
| **Win** | 30 points each (all team members) |
| **Loss** | 0 points |
| **Draw** | 10 points each (all players) |

### Star System (for section progression)
- **Win or Draw:** Section earns 1 ⭐ (challenge completed)
- Game counts as completed regardless of outcome

### Time Limit
- **30 seconds per turn**
- If player doesn't choose: Random valid column selected automatically
- Prevents game from stalling

### UI Display

**TV Screen (Coordinator):**
- Full Connect 4 board (7×6 grid)
- Team rosters with player names
- Current turn indicator: "Amy's turn (Blue Team)"
- Turn timer countdown
- Last move highlight

**Phone Screen (Player):**
- **Your turn:** Column selector (buttons 1-7)
- **Not your turn:** "Wait for your turn" + current player name
- Your team assignment (Red/Blue)
- Current board state (smaller view)
- Turn timer

### Example Game Flow

```
1. Game starts → Teams assigned
2. Amy (Blue) taps Column 4 → Blue piece drops to bottom
3. Joe (Red) taps Column 4 → Red piece drops on top of blue
4. Kat (Blue) taps Column 3 → Blue piece drops
5. Simon (Red) taps Column 5 → Red piece drops
... continues ...
15. Amy (Blue) taps Column 7 → Creates 4 in a row diagonally
16. BLUE TEAM WINS! Amy + Kat each get 30 points
17. Joe + Simon get 0 points
```

---

Last Updated: Dec 25, 2024
