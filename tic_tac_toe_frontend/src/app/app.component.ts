/* global setTimeout */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PUBLIC_INTERFACE
 * TicTacToe Angular Main App Component.
 * - Handles all state and visuals for a 3x3 responsive Tic Tac Toe game.
 * - Adds support for single-player vs. AI (computer) mode.
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: true,
  imports: [CommonModule]
})
export class AppComponent {
  title = 'Tic Tac Toe';

  // Board is a 3x3 array of cells ('' | 'X' | 'O')
  board: string[][] = [];
  // 'X' always starts
  currentPlayer: 'X' | 'O' = 'X';
  // Stores the winner ('X' or 'O'), 'Draw' for a tie, or '' if game is ongoing
  winner: string = '';
  // True if the game is in-progress
  inGame: boolean = false;
  // Last move count (for draw detection)
  moveCount: number = 0;

  // AI mode: true if playing against AI, false if two-player local
  aiEnabled: boolean = true;

  // Who is the human? 'X' or 'O'.
  humanPlayer: 'X' | 'O' = 'X';
  // Who is the AI? 'X' or 'O'.
  aiPlayer: 'X' | 'O' = 'O';

  // Used for AI "thinking" effect
  aiThinking: boolean = false;

  // PUBLIC_INTERFACE
  ngOnInit(): void {
    this.newGame();
  }

  /**
   * PUBLIC_INTERFACE
   * Start a new game: reset board, state, winner, and player.
   * @param mode - optional: 'AI' (default) or 'HUMAN' (two player)
   */
  newGame(mode: 'AI' | 'HUMAN' = this.aiEnabled ? 'AI' : 'HUMAN'): void {
    this.board = Array(3).fill(null).map(() => Array(3).fill(''));
    this.currentPlayer = 'X';
    this.inGame = true;
    this.winner = '';
    this.moveCount = 0;
    this.aiThinking = false;
    if (mode === 'AI') {
      this.aiEnabled = true;
      this.humanPlayer = 'X'; // By default, user starts as X
      this.aiPlayer = 'O';
      // If AI is X (user can later configure O starts), fire AI's initial move
      if (this.humanPlayer !== this.currentPlayer) {
        setTimeout(() => this.runAIMove(), 350);
      }
    } else {
      this.aiEnabled = false;
    }
  }

  /**
   * PUBLIC_INTERFACE
   * Switch between vs. AI and two-player local mode, and resets game.
   */
  toggleAIMode(): void {
    this.aiEnabled = !this.aiEnabled;
    // If switching ON, reassign X=human, O=AI; start new game.
    this.newGame(this.aiEnabled ? 'AI' : 'HUMAN');
  }

  /**
   * PUBLIC_INTERFACE
   * Reset the board to start over ("soft reset").
   */
  resetGame(): void {
    this.newGame(this.aiEnabled ? 'AI' : 'HUMAN');
  }

  /**
   * PUBLIC_INTERFACE
   * Handle a player clicking on a cell.
   * @param row Row index (0-2)
   * @param col Column index (0-2)
   */
  makeMove(row: number, col: number): void {
    if (
      !this.inGame ||
      this.board[row][col] !== '' ||
      this.winner ||
      (this.aiEnabled && this.currentPlayer !== this.humanPlayer) ||
      this.aiThinking
    ) {
      return;
    }
    this._placeMark(row, col, this.currentPlayer);

    // After player's move, handle win/draw, else pass to AI.
    if (this.checkWinner(row, col)) {
      this.winner = this.currentPlayer;
      this.inGame = false;
      return;
    } else if (this.moveCount === 9) {
      this.winner = 'Draw';
      this.inGame = false;
      return;
    }
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    // If vs. AI and it's now AI's turn, trigger AI after short delay for UI
    if (this.aiEnabled && this.currentPlayer === this.aiPlayer) {
      setTimeout(() => this.runAIMove(), 420);
    }
  }

  /**
   * Place a mark on board for given player, increments move counter.
   * @param row Row index
   * @param col Col index
   * @param player 'X' | 'O'
   */
  private _placeMark(row: number, col: number, player: 'X' | 'O'): void {
    this.board[row][col] = player;
    this.moveCount++;
  }

  /**
   * PUBLIC_INTERFACE
   * Run AI turn: AI picks a move and places it, runs win/check and hands back control.
   */
  private runAIMove(): void {
    if (!this.inGame || this.winner || this.currentPlayer !== this.aiPlayer) return;
    this.aiThinking = true;
    // Emulate short thinking delay for user experience
    setTimeout(() => {
      // Choose move for AI
      const [aiRow, aiCol] = this.chooseAIMove();
      if (aiRow === -1 || aiCol === -1) {
        // No moves possible; should not happen
        this.aiThinking = false;
        return;
      }
      this._placeMark(aiRow, aiCol, this.aiPlayer);
      if (this.checkWinner(aiRow, aiCol)) {
        this.winner = this.aiPlayer;
        this.inGame = false;
        this.aiThinking = false;
        return;
      } else if (this.moveCount === 9) {
        this.winner = 'Draw';
        this.inGame = false;
        this.aiThinking = false;
        return;
      }
      // Pass turn back to user
      this.currentPlayer = this.humanPlayer;
      this.aiThinking = false;
    }, 300); // Small visual delay for 'thinking'
  }

  /**
   * PUBLIC_INTERFACE
   * Choose the AI's next move (row, col) using random selection.
   * @returns [rowIndex, colIndex]
   *
   * For enhancement: Use Minimax for stronger play.
   */
  chooseAIMove(): [number, number] {
    // -- Simple random AI: pick a random empty cell --
    const emptyCells: [number, number][] = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          emptyCells.push([i, j]);
        }
      }
    }
    if (!emptyCells.length) return [-1, -1];
    // [Optional] Minimax can be plugged in here for hard mode.
    // -- Basic: random empty cell
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }

  /**
   * PUBLIC_INTERFACE
   * Get display message for the status area (whose turn, winner...).
   */
  get statusMsg(): string {
    if (this.winner === 'Draw') {
      return `It's a draw!`;
    }
    if (this.winner) {
      if (this.aiEnabled && this.winner === this.aiPlayer) {
        return `AI wins!`;
      }
      if (this.aiEnabled && this.winner === this.humanPlayer) {
        return `You win!`;
      }
      return `Player ${this.winner} wins!`;
    }
    if (this.aiEnabled) {
      if (this.currentPlayer === this.humanPlayer) {
        return this.aiThinking ? 'Your turn (please wait...)' : 'Your turn';
      } else {
        return this.aiThinking
          ? 'AI is thinking...'
          : 'AI\'s turn';
      }
    }
    return `Current turn: Player ${this.currentPlayer}`;
  }

  /**
   * PUBLIC_INTERFACE
   * Checks for win after a move at [row, col]
   */
  private checkWinner(row: number, col: number): boolean {
    const b = this.board;
    const p = this.currentPlayer;
    // Row
    if (b[row][0] === p && b[row][1] === p && b[row][2] === p) return true;
    // Col
    if (b[0][col] === p && b[1][col] === p && b[2][col] === p) return true;
    // Main Diagonal
    if (row === col && b[0][0] === p && b[1][1] === p && b[2][2] === p) return true;
    // Anti Diagonal
    if (row + col === 2 && b[0][2] === p && b[1][1] === p && b[2][0] === p) return true;
    return false;
  }
}
