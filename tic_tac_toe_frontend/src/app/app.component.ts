import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * PUBLIC_INTERFACE
 * TicTacToe Angular Main App Component.
 * - Handles all state and visuals for a 3x3 responsive Tic Tac Toe game.
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

  // PUBLIC_INTERFACE
  ngOnInit(): void {
    this.newGame();
  }

  /**
   * PUBLIC_INTERFACE
   * Start a new game: reset board, state, winner, and player.
   */
  newGame(): void {
    this.board = Array(3).fill(null).map(() => Array(3).fill(''));
    this.currentPlayer = 'X';
    this.inGame = true;
    this.winner = '';
    this.moveCount = 0;
  }

  /**
   * PUBLIC_INTERFACE
   * Reset the board to start over ("soft reset").
   */
  resetGame(): void {
    this.newGame();
  }

  /**
   * PUBLIC_INTERFACE
   * Handle a player clicking on a cell.
   * @param row Row index (0-2)
   * @param col Column index (0-2)
   */
  makeMove(row: number, col: number): void {
    if (!this.inGame || this.board[row][col] !== '' || this.winner) return;
    this.board[row][col] = this.currentPlayer;
    this.moveCount++;

    if (this.checkWinner(row, col)) {
      this.winner = this.currentPlayer;
      this.inGame = false;
      return;
    } else if (this.moveCount === 9) {
      this.winner = 'Draw';
      this.inGame = false;
      return;
    }
    // Swap player
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
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
      return `Player ${this.winner} wins!`;
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
