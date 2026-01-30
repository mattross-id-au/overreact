import { sharedStyles } from "./styles.js";

customElements.define('ttt-board', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode:'open' }).adoptedStyleSheets = [sharedStyles];
    this.shadowRoot.innerHTML = `
      <div class="status"></div>
      <div class="board-row">
        <button class="square" data-square="0"></button>
        <button class="square" data-square="1"></button>
        <button class="square" data-square="2"></button>
      </div>
      <div class="board-row">
        <button class="square" data-square="3"></button>
        <button class="square" data-square="4"></button>
        <button class="square" data-square="5"></button>
      </div>
      <div class="board-row">
        <button class="square" data-square="6"></button>
        <button class="square" data-square="7"></button>
        <button class="square" data-square="8"></button>
      </div>
    `;
    this._status = this.shadowRoot.querySelector(".status");
    for(const buttonElement of this.shadowRoot.querySelectorAll('button.square')) {
      buttonElement.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent("play", { detail: Number(buttonElement.dataset.square)}))
      })
    }
  }

  set status(value) {
    this._status.textContent = value;
  }

  set squares(newSquares) {
    newSquares.map((value,i) => {
        this.shadowRoot.querySelector(`[data-square="${i}"]`).textContent = value;
    })
  }
});

customElements.define('ttt-game', class extends HTMLElement {
  constructor() {
    super();
    this._history = [Array(9).fill(null)];
    this._currentMove = 0;

    this.attachShadow({ mode:'open' }).adoptedStyleSheets = [sharedStyles];
    this.shadowRoot.innerHTML = `
      <div class="game">
        <div class="game-board"><ttt-board></ttt-board></div>
        <div class="game-info"><ol class="moves"></ol></div>
      </div>
    `;

    this._boardElement = this.shadowRoot.querySelector("ttt-board");
    this._boardElement.addEventListener("play", (event) => {
      this.handlePlay(event.detail);
    });

    this._movesElement = this.shadowRoot.querySelector(".moves");
    this._movesElement.addEventListener('click', (event) => {
      const button = event.target.closest?.("button[data-move]");
      if(button) {
        this.currentMove = button.dataset.move;
      }
    });
    this.render();
  }

  get xIsNext() {
    return this._currentMove % 2 === 0;
  }

  get squares() {
    return this._history[this._currentMove];
  }

  set currentMove(nextMove) {
    this._currentMove = nextMove;
    this._boardElement.squares = this.squares;
  }

  handlePlay(nextMove) {
    if (calculateWinner(this.squares) || this.squares[nextMove]) {
      return;
    }

    const nextSquares = this.squares.slice();
    nextSquares[nextMove] = this.xIsNext ? 'X' : 'O';
    this._history = [...this._history.slice(0, this._currentMove + 1), nextSquares];
    this._currentMove = this._history.length - 1;
    this._boardElement.squares = nextSquares;
    this.render();
  }

  render() {
    const winner = calculateWinner(this.squares);
    this._boardElement.status = winner ? 
      `Winner: ${winner}` : 
      `Next player: ${ this.xIsNext ? 'X' : 'O'}`;

    this._movesElement.innerHTML = this._history.map((_, i) => `
      <li><button data-move="${i}">
        ${i > 0 ? `Go to move ${i}` : `Go to game start`}
      </button></li>
    `).join('');
  }
});


function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}