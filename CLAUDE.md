# Claude Code Instructions for iParty Project

## Quick Start for New Sessions

**When starting a new conversation:**

1. **Read PROJECT.md first** - Get project overview and current status
2. **Read PROGRESS.md second** - See latest session activity and next priorities
3. **Reference IMPLEMENTATION_PLAN.md** - Use this as the technical roadmap (SOURCE OF TRUTH)
4. **Continue from "Next Session Priorities"** in PROGRESS.md

---

## Project Status Summary

**Target:** Christmas Day (Dec 25, 2024)
**Current Date Context:** Dec 23, 2024 (Evening session completed)

### ✅ Completed
- [x] All artwork generated (13 images in client/src/assets/images/)
  - 3 characters: santa-character.png, elf-character.png, reindeer-character.png
  - 5 backgrounds: bg-toy-machine.png, bg-reindeer-stable.png, bg-gift-wrap.png, bg-cookie-kitchen.png, bg-sleigh-launch.png
  - 5 UI elements: game-logo.png, star-icon.png, village-map.png, celebration-burst.png, victory-scene.png
- [x] Complete implementation plan created (IMPLEMENTATION_PLAN.md)
- [x] Basic multiplayer infrastructure working (Socket.io, React, Vite)
- [x] Network connectivity fixed (phones can connect)
- [x] Git repository initialized with all assets committed

### ⏳ Not Started - BEGIN HERE
- [ ] Core Architecture (Week 1 Day 1) - **START WITH THIS**
  - [ ] Create christmasStory.js
  - [ ] Build storyFlowEngine.js
  - [ ] Update server for autonomous flow
  - [ ] Implement auto-advance timers

---

## Document Structure

### PROJECT.md
**Purpose:** High-level project overview, vision, current status, decision log
**When to read:** Start of new session for context
**When to update:** After major milestones or decisions

### IMPLEMENTATION_PLAN.md
**Purpose:** Complete technical roadmap - **SOURCE OF TRUTH FOR IMPLEMENTATION**
**When to read:** When implementing features, designing architecture
**When to update:** Only if requirements change significantly (rare)

### PROGRESS.md
**Purpose:** Session-by-session activity log, checklist, immediate next steps
**When to read:** Every session to see what was done and what's next
**When to update:** During and at end of each session

### CLAUDE.md (this file)
**Purpose:** Instructions for Claude Code on how to navigate the project
**When to read:** Start of every new session

---

## Key Implementation Details

### Story Structure
5-act "Save Christmas Village" adventure:
- Act 1: Toy Machine Workshop (Rounds 1-3)
- Act 2: Reindeer Stable (Rounds 4-6)
- Act 3: Gift Wrapping Station (Rounds 7-9)
- Act 4: Cookie Kitchen (Rounds 10-12)
- Act 5: Sleigh Launch (Rounds 13-15)

### Autonomous Flow (CRITICAL)
- **NO manual host controls** - game runs automatically
- Timer-based progression: 8s story intro → 60s challenge → 5s results → repeat
- Server validates ALL answers automatically
- Age-adaptive difficulty (median player age)

### MVP Mini-Games (Must have 6 for launch)
1. Speed Math
2. Multiple Choice Trivia
3. True/False Quiz
4. Spelling Bee
5. Color Pattern Match
6. Memory Match

### Major Architectural Changes
**DELETE:**
- client/src/pages/HostScreen.jsx (323 lines)
- client/src/utils/roundGenerator.js (replace completely)

**CREATE (~20 new files):**
- Data: christmasStory.js, questionPools.js
- Utils: storyFlowEngine.js, answerValidator.js, difficultyManager.js
- Screens: CoordinatorScreen.jsx, PlayerStoryScreen.jsx, SectionTransition.jsx, VictoryScreen.jsx
- Components: 6 reusable components (BackgroundLayer, CharacterGuide, etc.)
- Mini-Games: 6 game components

**MODIFY:**
- server/index.js - Add autonomous flow + auto-scoring
- client/src/App.jsx - Update routes
- client/tailwind.config.js - Add animations

---

## Implementation Approach

### Week 1: Foundation (8-10 hours)
**Day 1: Core Architecture (4 hrs)** ← **START HERE**
- Create story data structure
- Build autonomous flow engine
- Update server game state model
- Implement auto-advance timers

**Day 2: Automatic Scoring (4 hrs)**
- Create answer validator
- Implement point calculation
- Add answer validation to server
- Test scoring accuracy

**Day 3: Question Pools (2 hrs)**
- Build question database
- Create age-adaptive difficulty
- Populate questions for 6 MVP games

### Week 2: Screens & Components (12 hours)
- Day 4: Reusable Components (4 hrs)
- Day 5: New Screens (4 hrs)
- Day 6: Mini-Game Components (4 hrs)

### Week 3: Polish & Integration (5-7 hours)
- Day 7: More Mini-Games (3 hrs)
- Day 8: Artwork Integration (2 hrs)
- Day 9: Testing & Bug Fixes (2 hrs)

---

## Success Criteria for Christmas Launch

- [ ] 6 mini-games working with auto-scoring
- [ ] Story progression through all 5 sections
- [ ] All 13 images integrated appropriately
- [ ] Autonomous flow (no manual controls)
- [ ] Age-adaptive difficulty working
- [ ] Mobile + TV display optimized
- [ ] No crashes during full playthrough

---

## File Locations Reference

### Documentation
- `/Users/amirlakha/dev-node/iparty/PROJECT.md`
- `/Users/amirlakha/dev-node/iparty/IMPLEMENTATION_PLAN.md`
- `/Users/amirlakha/dev-node/iparty/PROGRESS.md`
- `/Users/amirlakha/dev-node/iparty/CLAUDE.md` (this file)

### Artwork Assets
- `/Users/amirlakha/dev-node/iparty/client/src/assets/images/` (13 PNG files)

### Current Codebase
- Server: `/Users/amirlakha/dev-node/iparty/server/index.js`
- Client: `/Users/amirlakha/dev-node/iparty/client/src/`

### Git Repository
- Initialized: Yes
- All artwork committed: Yes
- Working directory: `/Users/amirlakha/dev-node/iparty/`

---

## Important Reminders

1. **Use TodoWrite tool** to track tasks during implementation
2. **Update PROGRESS.md** at end of each session
3. **Commit frequently** with clear messages
4. **Test on mobile** as you build (phones must work)
5. **Autonomous flow is critical** - no manual host controls
6. **Server validates answers** - all scoring server-side
7. **Age-adaptive difficulty** - scale by median player age
8. **Timeline is tight** - Christmas Day is the target

---

## Technical Stack

- Frontend: React 19.2.0, Vite, Tailwind CSS v3
- Backend: Node.js, Express, Socket.io
- Real-time: WebSocket communication
- Styling: Tailwind CSS with custom animations
- Version Control: Git

### Dev Server Notes
- Server runs on port 3001
- Client runs on Vite dev server (standard port)
- Server listens on 0.0.0.0 for network access
- Socket URL is dynamic: `${window.location.hostname}:3001`

---

## Next Action

**On your next session, immediately:**
1. Read PROJECT.md and PROGRESS.md
2. Create TODO list with Week 1 Day 1 tasks
3. Begin implementing christmasStory.js
4. Reference IMPLEMENTATION_PLAN.md for detailed specifications

**Estimated time to first playable:** 8-10 hours (Week 1 completion)
**Estimated time to MVP launch:** 20-25 hours total

---

Last Updated: Dec 23, 2024 (Evening)
