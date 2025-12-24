/**
 * Story Flow Engine
 * Manages autonomous game progression through story states
 *
 * State Flow:
 * LOBBY → INTRODUCTION → SECTION_INTRO → CHALLENGE_ACTIVE →
 * CHALLENGE_RESULTS → [repeat 3x] → SECTION_COMPLETE →
 * MAP_TRANSITION → [next section] → VICTORY → GAME_COMPLETE
 */

import { christmasStory, getSectionByRound, isFirstRoundInSection, isLastRoundInSection } from '../data/christmasStory';

export const GameState = {
  LOBBY: 'LOBBY',
  INTRODUCTION: 'INTRODUCTION',
  SECTION_INTRO: 'SECTION_INTRO',
  CHALLENGE_ACTIVE: 'CHALLENGE_ACTIVE',
  CHALLENGE_RESULTS: 'CHALLENGE_RESULTS',
  SECTION_COMPLETE: 'SECTION_COMPLETE',
  MAP_TRANSITION: 'MAP_TRANSITION',
  VICTORY: 'VICTORY',
  GAME_COMPLETE: 'GAME_COMPLETE'
};

export class StoryFlowEngine {
  constructor(socket, roomCode) {
    this.socket = socket;
    this.roomCode = roomCode;
    this.currentState = GameState.LOBBY;
    this.currentRound = 0;
    this.currentSection = 0;
    this.completedSections = 0;
    this.autoAdvanceTimer = null;
    this.stateListeners = new Map();
  }

  /**
   * Start the game from lobby
   */
  startGame() {
    this.transitionTo(GameState.INTRODUCTION);
    this.autoAdvance(christmasStory.timing.introduction);
  }

  /**
   * Transition to a new state
   */
  transitionTo(newState, data = {}) {
    const previousState = this.currentState;
    this.currentState = newState;

    console.log(`[Flow Engine] ${previousState} → ${newState}`, data);

    // Emit state change to server
    this.socket.emit('game-state-change', {
      roomCode: this.roomCode,
      state: newState,
      round: this.currentRound,
      section: this.currentSection,
      ...data
    });

    // Notify local listeners
    this.notifyListeners(newState, data);

    // Handle state-specific logic
    this.handleStateEntry(newState, data);
  }

  /**
   * Handle logic when entering a state
   */
  handleStateEntry(state, data) {
    switch (state) {
      case GameState.INTRODUCTION:
        // Show game intro, auto-advance after timer
        this.autoAdvance(christmasStory.timing.introduction);
        break;

      case GameState.SECTION_INTRO:
        // Show section story, auto-advance after timer
        this.autoAdvance(christmasStory.timing.sectionIntro);
        break;

      case GameState.CHALLENGE_ACTIVE:
        // Challenge is active, wait for submissions or timeout
        // Auto-advance handled by server when all submit or timeout
        break;

      case GameState.CHALLENGE_RESULTS:
        // Show results, auto-advance after timer
        this.autoAdvance(christmasStory.timing.resultsDisplay);
        break;

      case GameState.SECTION_COMPLETE:
        // Celebration, auto-advance after timer
        this.completedSections++;
        this.autoAdvance(christmasStory.timing.sectionSuccess);
        break;

      case GameState.MAP_TRANSITION:
        // Show village map, auto-advance after timer
        this.autoAdvance(christmasStory.timing.mapTransition);
        break;

      case GameState.VICTORY:
        // Final victory screen, no auto-advance (manual replay)
        break;

      case GameState.GAME_COMPLETE:
        // Game over, ready to restart
        break;

      default:
        break;
    }
  }

  /**
   * Advance to next round
   */
  nextRound() {
    this.currentRound++;

    // Check if game is complete (15 rounds)
    if (this.currentRound > 15) {
      this.transitionTo(GameState.VICTORY);
      return;
    }

    // Update current section
    this.currentSection = Math.floor((this.currentRound - 1) / 3) + 1;

    // Determine next state based on round position
    if (isFirstRoundInSection(this.currentRound)) {
      // First round of section: show section intro
      this.transitionTo(GameState.SECTION_INTRO, {
        section: getSectionByRound(this.currentRound)
      });
    } else {
      // Mid-section: go straight to challenge
      this.transitionTo(GameState.CHALLENGE_ACTIVE, {
        round: this.currentRound
      });
    }
  }

  /**
   * Handle challenge completion
   */
  onChallengeComplete(results) {
    this.transitionTo(GameState.CHALLENGE_RESULTS, { results });
  }

  /**
   * Proceed after results are shown
   */
  afterResults() {
    if (isLastRoundInSection(this.currentRound)) {
      // Last round of section: show section complete
      this.transitionTo(GameState.SECTION_COMPLETE, {
        section: getSectionByRound(this.currentRound)
      });
    } else {
      // More rounds in section: next challenge
      this.nextRound();
    }
  }

  /**
   * Proceed after section complete
   */
  afterSectionComplete() {
    if (this.currentRound >= 15) {
      // All sections done: victory
      this.transitionTo(GameState.VICTORY);
    } else {
      // More sections: show map transition
      this.transitionTo(GameState.MAP_TRANSITION);
    }
  }

  /**
   * Proceed after map transition
   */
  afterMapTransition() {
    this.nextRound();
  }

  /**
   * Proceed after introduction
   */
  afterIntroduction() {
    this.nextRound(); // Start round 1
  }

  /**
   * Proceed after section intro
   */
  afterSectionIntro() {
    this.transitionTo(GameState.CHALLENGE_ACTIVE, {
      round: this.currentRound
    });
  }

  /**
   * Auto-advance after a delay
   */
  autoAdvance(delay) {
    this.clearAutoAdvance();

    this.autoAdvanceTimer = setTimeout(() => {
      this.handleAutoAdvance();
    }, delay);
  }

  /**
   * Handle auto-advance based on current state
   */
  handleAutoAdvance() {
    switch (this.currentState) {
      case GameState.INTRODUCTION:
        this.afterIntroduction();
        break;

      case GameState.SECTION_INTRO:
        this.afterSectionIntro();
        break;

      case GameState.CHALLENGE_RESULTS:
        this.afterResults();
        break;

      case GameState.SECTION_COMPLETE:
        this.afterSectionComplete();
        break;

      case GameState.MAP_TRANSITION:
        this.afterMapTransition();
        break;

      default:
        console.warn('[Flow Engine] Auto-advance from unexpected state:', this.currentState);
    }
  }

  /**
   * Clear auto-advance timer
   */
  clearAutoAdvance() {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  /**
   * Register a state change listener
   */
  onStateChange(callback) {
    const listenerId = Math.random().toString(36).substr(2, 9);
    this.stateListeners.set(listenerId, callback);
    return listenerId;
  }

  /**
   * Unregister a state change listener
   */
  offStateChange(listenerId) {
    this.stateListeners.delete(listenerId);
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners(state, data) {
    this.stateListeners.forEach(callback => {
      try {
        callback(state, data);
      } catch (error) {
        console.error('[Flow Engine] Listener error:', error);
      }
    });
  }

  /**
   * Get current game info
   */
  getGameInfo() {
    return {
      state: this.currentState,
      round: this.currentRound,
      section: this.currentSection,
      completedSections: this.completedSections,
      totalRounds: 15,
      totalSections: 5,
      progress: Math.round((this.currentRound / 15) * 100),
      starsEarned: this.completedSections * 3
    };
  }

  /**
   * Reset the game
   */
  reset() {
    this.clearAutoAdvance();
    this.currentState = GameState.LOBBY;
    this.currentRound = 0;
    this.currentSection = 0;
    this.completedSections = 0;
  }

  /**
   * Cleanup
   */
  destroy() {
    this.clearAutoAdvance();
    this.stateListeners.clear();
  }
}

/**
 * Server-side flow coordinator
 * Used in server/index.js for coordinating all clients
 */
export class ServerFlowCoordinator {
  constructor(roomCode) {
    this.roomCode = roomCode;
    this.currentState = GameState.LOBBY;
    this.currentRound = 0;
    this.currentSection = 0;
    this.completedSections = 0;
    this.autoAdvanceTimer = null;
    this.playerSubmissions = new Map();
    this.totalPlayers = 0;
  }

  /**
   * Start the game
   */
  startGame(io, totalPlayers) {
    this.totalPlayers = totalPlayers;
    this.transitionTo(io, GameState.INTRODUCTION);
    this.scheduleAutoAdvance(io, christmasStory.timing.introduction);
  }

  /**
   * Transition all clients to new state
   */
  transitionTo(io, newState, data = {}) {
    this.currentState = newState;

    console.log(`[Server Flow] Room ${this.roomCode}: ${newState}`);

    // Broadcast to all clients in room
    io.to(this.roomCode).emit('game-state-update', {
      state: newState,
      round: this.currentRound,
      section: this.currentSection,
      completedSections: this.completedSections,
      ...data
    });

    // Handle server-side state logic
    this.handleStateEntry(io, newState);
  }

  /**
   * Handle state entry on server
   */
  handleStateEntry(io, state) {
    switch (state) {
      case GameState.CHALLENGE_ACTIVE:
        this.playerSubmissions.clear();
        this.scheduleAutoAdvance(io, christmasStory.timing.challengeDuration);
        break;

      case GameState.CHALLENGE_RESULTS:
        this.scheduleAutoAdvance(io, christmasStory.timing.resultsDisplay);
        break;

      case GameState.SECTION_COMPLETE:
        this.completedSections++;
        this.scheduleAutoAdvance(io, christmasStory.timing.sectionSuccess);
        break;

      case GameState.SECTION_INTRO:
        this.scheduleAutoAdvance(io, christmasStory.timing.sectionIntro);
        break;

      case GameState.MAP_TRANSITION:
        this.scheduleAutoAdvance(io, christmasStory.timing.mapTransition);
        break;

      case GameState.INTRODUCTION:
        this.scheduleAutoAdvance(io, christmasStory.timing.introduction);
        break;

      default:
        break;
    }
  }

  /**
   * Record player submission
   */
  recordSubmission(playerId) {
    this.playerSubmissions.set(playerId, true);

    // Check if all players submitted
    if (this.playerSubmissions.size >= this.totalPlayers) {
      return true; // All submitted
    }
    return false;
  }

  /**
   * Schedule auto-advance
   */
  scheduleAutoAdvance(io, delay) {
    this.clearAutoAdvance();

    this.autoAdvanceTimer = setTimeout(() => {
      this.handleAutoAdvance(io);
    }, delay);
  }

  /**
   * Handle auto-advance
   */
  handleAutoAdvance(io) {
    switch (this.currentState) {
      case GameState.INTRODUCTION:
        this.nextRound(io);
        break;

      case GameState.SECTION_INTRO:
        this.transitionTo(io, GameState.CHALLENGE_ACTIVE);
        break;

      case GameState.CHALLENGE_ACTIVE:
        // Timeout - calculate results with current submissions
        this.transitionTo(io, GameState.CHALLENGE_RESULTS);
        break;

      case GameState.CHALLENGE_RESULTS:
        if (isLastRoundInSection(this.currentRound)) {
          this.transitionTo(io, GameState.SECTION_COMPLETE);
        } else {
          this.nextRound(io);
        }
        break;

      case GameState.SECTION_COMPLETE:
        if (this.currentRound >= 15) {
          this.transitionTo(io, GameState.VICTORY);
        } else {
          this.transitionTo(io, GameState.MAP_TRANSITION);
        }
        break;

      case GameState.MAP_TRANSITION:
        this.nextRound(io);
        break;

      default:
        break;
    }
  }

  /**
   * Advance to next round
   */
  nextRound(io) {
    this.currentRound++;

    if (this.currentRound > 15) {
      this.transitionTo(io, GameState.VICTORY);
      return;
    }

    this.currentSection = Math.floor((this.currentRound - 1) / 3) + 1;

    if (isFirstRoundInSection(this.currentRound)) {
      this.transitionTo(io, GameState.SECTION_INTRO);
    } else {
      this.transitionTo(io, GameState.CHALLENGE_ACTIVE);
    }
  }

  /**
   * Clear auto-advance timer
   */
  clearAutoAdvance() {
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.clearAutoAdvance();
  }
}

export default StoryFlowEngine;
