import { sharedStyles } from "./styles.js";

customElements.define('ttt-board', class extends HTMLElement {
  static ObservedAttributes = ["xIsNext"];
  #xIsNext;
  #squares;
  #statusElement;

  constructor() {
    super();
    Object.assign(this, new EventTarget());

    this.attachShadow({ mode:'open' }).adoptedStyleSheets = [sharedStyles];
    this.shadowRoot.innerHTML = `
      <div class="status"></div>
      <div class="board-row">
        <button class="square" data-square-id="0"></button>
        <button class="square" data-square-id="1"></button>
        <button class="square" data-square-id="2"></button>
      </div>
      <div class="board-row">
        <button class="square" data-square-id="3"></button>
        <button class="square" data-square-id="4"></button>
        <button class="square" data-square-id="5"></button>
      </div>
      <div class="board-row">
        <button class="square" data-square-id="6"></button>
        <button class="square" data-square-id="7"></button>
        <button class="square" data-square-id="8"></button>
      </div>
    `;

    this.#statusElement = this.shadowRoot.querySelector(".status");

    for(const squareElement of this.shadowRoot.querySelectorAll('button.square')) {
      squareElement.addEventListener('click', () => {
        this.handleClick(Number(squareElement.getAttribute("data-square-id")));
      })
    }
  }

  handleClick(i) {
    if (calculateWinner(this.#squares) || this.#squares[i]) {
      return;
    }
    const nextSquares = this.#squares.slice();
    if (this.#xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }

    //onPlay(nextSquares);
    this.dispatchEvent(new CustomEvent("play", { detail: nextSquares }));

    const winner = calculateWinner(this.#squares);
    if (winner) {
      this.#statusElement.innerHTML = `Winner: ${winner}`;
      return;
    }
    
  }

  get xIsNext() { return this.#xIsNext; }
  set xIsNext(xIsNext) { 
    this.#xIsNext = xIsNext;
    this.#statusElement.innerHTML = `Next player: ${ xIsNext ? 'X' : 'O'}`;
  }

  get squares() { return this.#squares; }
  set squares(squares) {
    this.#squares = squares; 
    for (const [i, value] of Object.entries(squares)) {
      //this.shadowRoot.querySelector(`[data-square-id="${i}"]`).setAttribute("value", value || "");
      this.shadowRoot.querySelector(`[data-square-id="${i}"]`).textContent = value;
    }
  }
});

customElements.define('ttt-game', class extends HTMLElement {
  #history = [Array(9).fill(null)];
  #currentMove = 0;

  // HTML Elements
  #tttBoardElement;
  #gameInfoElement;

  handlePlay(nextSquares) {
    this.#history = [...this.#history.slice(0, this.#currentMove + 1), nextSquares];
    this.#currentMove = this.#history.length - 1;
    this.updateMoves();
  }

  updateMoves() {
    this.#tttBoardElement.xIsNext = this.#currentMove % 2 === 0;
    this.#tttBoardElement.squares = this.#history[this.#currentMove];
    const moves = this.#history.map((squares, move) => {
      let description;
      if(move > 0) {
        description = `Go to move #${move}`;
      } else {
        description = `Go to game start`;
      }
      return `
        <li>
          <button data-move-id="${move}">${description}</button>
        </li>
      `;
      
    }).join('');
    this.#gameInfoElement.innerHTML = `<ol>${moves}</ol>`;
    for(const gotoButton of this.#gameInfoElement.querySelectorAll("button")) {
      gotoButton.addEventListener('click', () => {
        this.#currentMove = Number(gotoButton.dataset.moveId);
        this.updateMoves();
      })
    }
  }

  constructor() {
    super(); 
    this.attachShadow({ mode:'open' }).adoptedStyleSheets = [sharedStyles];
    this.shadowRoot.innerHTML = `
      <div class="game">
        <div class="game-board">
          <ttt-board></ttt-board>
        </div>
        <div class="game-info">
          <ol></ol>
        </div>
      </div>
    `;

    // Set initial state and add event listeners
    this.#tttBoardElement = this.shadowRoot.querySelector("ttt-board");
    this.#tttBoardElement.xIsNext = this.#currentMove % 2 === 0;
    this.#tttBoardElement.squares = this.#history[this.#currentMove];
    this.#tttBoardElement.addEventListener("play", (event) => {
      this.handlePlay(event.detail);
    });

    this.#gameInfoElement = this.shadowRoot.querySelector(".game-info");
    this.updateMoves();
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
