# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iParty is an autonomous, story-driven Christmas party game. Players join on phones while a TV displays the main game. The game runs without a host—all progression is timer-based and server-controlled. Questions are age-adaptive with three tiers: young (≤9), middle (10-12), teen (≥13).

**Core concept:** "Save Christmas Village" - 5 workshop sections × 5 challenges each = 25 rounds total.

## Development Commands

```bash
# Start server (Terminal 1)
cd server && npm start
# Server runs on port 3001, listens on 0.0.0.0 for network access

# Start client (Terminal 2)
cd client && npm run dev
# Vite dev server with --host for network access

# Lint client code
cd client && npm run lint

# Build for production
cd client && npm run build

# Force specific game type during development
GAME_TYPE=spelling node server/index.js
# Options: speed-math, true-false, trivia, spelling, connect4
```

## Architecture

### Client-Server Communication
- **Socket.io** for real-time WebSocket communication
- Server URL configured in `client/src/context/SocketContext.jsx` - uses `VITE_API_URL` env var or dynamic hostname
- Server is authoritative: validates all answers, manages game state, controls timing

### Game Flow (Autonomous)
The `FlowCoordinator` class (`server/utils/flowCoordinator.js`) manages automatic state transitions:
```
LOBBY → INTRODUCTION (12s) → SECTION_INTRO (8s) → CHALLENGE_ACTIVE (60s)
→ CHALLENGE_RESULTS (5s) → [repeat 5x] → SECTION_COMPLETE (5s)
→ MAP_TRANSITION (3s) → [repeat 5 sections] → VICTORY
```

### Screen Roles
- **CoordinatorScreen** (`/coordinator`): TV display showing story, questions, results
- **PlayerStoryScreen** (`/play`): Phone input controller only - answers and status
- **Home** (`/`): Entry point with join/coordinate options
- **ScreenPreview** (`/preview`): Design reference prototypes

### Key Server Files
```
server/
├── index.js              # Express + Socket.io server, game state, event handlers
├── utils/
│   ├── flowCoordinator.js    # Autonomous state machine, timer management
│   ├── challengeGenerator.js # Multi-type challenge generation
│   ├── questionGenerator.js  # Age-adaptive question creation (≤9, 10-12, ≥13)
│   ├── answerValidator.js    # Scoring, star calculation, placements
│   ├── connect4Logic.js      # Connect 4 board logic, win detection
│   └── storyData.js          # Game constants, state enum, timing
└── data/
    └── questionPools.js      # Question banks for trivia, true/false, spelling
```

### Key Client Files
```
client/src/
├── context/SocketContext.jsx  # Socket.io provider and hook
├── pages/
│   ├── CoordinatorScreen.jsx  # TV display (all game states)
│   ├── PlayerStoryScreen.jsx  # Phone controller
│   └── Home.jsx               # Landing page
├── components/
│   ├── CircularTimer.jsx      # Countdown ring for challenges
│   └── ProgressBar.jsx        # Story/transition progress
└── data/
    └── christmasStory.js      # Section narratives, timing constants
```

## Game Types

5 mini-games cycle through each section:
1. **Speed Math** - Age-tiered arithmetic
2. **True/False** - Statement verification
3. **Trivia** - Multiple choice (A/B/C/D)
4. **Spelling Bee** - Audio-based with Web Speech API
5. **Connect 4** - Team-based board game

## Scoring System

- **Stars (team):** 1 star per question if ANY player answers correctly. Need 5/5 stars to pass section.
- **Points (individual):** Placement-based (1st=30, 2nd=20, 3rd+=10). Section bonus +30 for success.
- **Retry:** If <5 stars, section replays and all section points are removed.

## Socket Events

Key events between client and server:
- `create-game`, `join-game` - Room management
- `start-game` - Coordinator initiates game
- `game-state-update` - Server broadcasts state changes
- `challenge`, `player-challenge` - Challenge data distribution
- `submit-answer`, `answer-submitted` - Player submissions
- `challenge-results`, `section-complete` - Results broadcasting
- `connect4-move`, `connect4-board-update` - Connect 4 gameplay
- `spelling-phase-change` - Spelling bee synchronization

## Testing

Multi-window browser testing:
1. Open coordinator at `http://localhost:5173/` → "Coordinate a Game"
2. Open player windows (incognito/different profiles) at same URL → "Join a Game"
3. Enter room code from coordinator screen
4. Game runs autonomously once started

## Project Documentation

- `PROGRESS.md` - Session log with latest changes and next priorities
- `IMPLEMENTATION_PLAN.md` - Full technical roadmap (source of truth)
- `PROJECT.md` - High-level overview and decision log
- `MINI_GAMES.md` - Detailed game specifications
