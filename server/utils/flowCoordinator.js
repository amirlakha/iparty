/**
 * Server Flow Coordinator
 * Manages autonomous game flow on the server
 */

const { GameState, timing, isFirstRoundInSection, isLastRoundInSection } = require('./storyData');

class FlowCoordinator {
  constructor(roomCode, onStateChange = null) {
    this.roomCode = roomCode;
    this.currentState = GameState.LOBBY;
    this.currentRound = 0;
    this.currentSection = 0;
    this.completedSections = 0;
    this.autoAdvanceTimer = null;
    this.playerSubmissions = new Map();
    this.totalPlayers = 0;
    this.onStateChange = onStateChange; // Callback for state changes
  }

  /**
   * Start the game
   */
  startGame(io, totalPlayers) {
    this.totalPlayers = totalPlayers;
    this.transitionTo(io, GameState.INTRODUCTION);
    this.scheduleAutoAdvance(io, timing.introduction);
  }

  /**
   * Transition all clients to new state
   */
  transitionTo(io, newState, data = {}) {
    const previousState = this.currentState;
    this.currentState = newState;

    console.log(`[Flow] Room ${this.roomCode}: ${previousState} → ${newState}`);

    // Broadcast to all clients in room
    io.to(this.roomCode).emit('game-state-update', {
      state: newState,
      round: this.currentRound,
      section: this.currentSection,
      completedSections: this.completedSections,
      totalRounds: 15,
      totalSections: 5,
      ...data
    });

    // Call state change callback if provided
    if (this.onStateChange) {
      this.onStateChange(this.roomCode, newState, io);
    }

    // Handle server-side state logic
    this.handleStateEntry(io, newState);
  }

  /**
   * Handle state entry on server
   */
  handleStateEntry(io, state) {
    switch (state) {
      case GameState.INTRODUCTION:
        this.scheduleAutoAdvance(io, timing.introduction);
        break;

      case GameState.SECTION_INTRO:
        this.scheduleAutoAdvance(io, timing.sectionIntro);
        break;

      case GameState.CHALLENGE_ACTIVE:
        this.playerSubmissions.clear();
        this.scheduleAutoAdvance(io, timing.challengeDuration);
        break;

      case GameState.CHALLENGE_RESULTS:
        this.scheduleAutoAdvance(io, timing.resultsDisplay);
        break;

      case GameState.SECTION_COMPLETE:
        this.completedSections++;
        this.scheduleAutoAdvance(io, timing.sectionSuccess);
        break;

      case GameState.MAP_TRANSITION:
        this.scheduleAutoAdvance(io, timing.mapTransition);
        break;

      case GameState.VICTORY:
        // No auto-advance from victory
        break;

      default:
        break;
    }
  }

  /**
   * Record player submission
   * @returns {boolean} - True if all players have submitted
   */
  recordSubmission(playerId, submissionData) {
    this.playerSubmissions.set(playerId, submissionData);

    // Check if all players submitted
    if (this.playerSubmissions.size >= this.totalPlayers && this.totalPlayers > 0) {
      return true; // All submitted
    }
    return false;
  }

  /**
   * Get all submissions for current round
   */
  getSubmissions() {
    return Array.from(this.playerSubmissions.values());
  }

  /**
   * Clear submissions for new round
   */
  clearSubmissions() {
    this.playerSubmissions.clear();
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
   * Trigger early advance (when all players submit)
   */
  triggerEarlyAdvance(io) {
    this.clearAutoAdvance();
    // Small delay before advancing to show last submission
    setTimeout(() => {
      this.handleAutoAdvance(io);
    }, 1000);
  }

  /**
   * Handle auto-advance based on current state
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
        // Timeout - move to results (scoring happens before this)
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
        console.warn(`[Flow] Unexpected auto-advance from state: ${this.currentState}`);
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
      this.transitionTo(io, GameState.SECTION_INTRO, {
        sectionId: this.currentSection
      });
    } else {
      this.transitionTo(io, GameState.CHALLENGE_ACTIVE);
    }
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
    this.playerSubmissions.clear();
  }
}

module.exports = FlowCoordinator;
