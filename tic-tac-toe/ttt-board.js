class TTTBoard extends HTMLElement {

    connectedCallback() {
        this.nextPlayer = 'X';
        this.winner = null;

        this.addEventListener('click', (event)=> {
            const squareElement = event.target.closest('[slot]');
            if(squareElement) {
                const isFree = squareElement.getAttribute("value") == "" || squareElement.getAttribute("value") == null;
                const isGameOver = this.winner !== null;
                if(isFree && !isGameOver) {
                    this.selectSquare(squareElement);
                    const winner = this.calculateWinner();
                    if(winner) {
                        this.shadow.getElementById("game").setAttribute("winner", winner);
                        this.shadow.querySelector("#winner span").textContent = winner;
                        this.winner = winner;
                    }
                }
            }
        })

        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.innerHTML = `
            <link rel="stylesheet" href="./ttt-board.css" />
            <div id="game" data-next-player="X" winner="">
                <div id="status">
                    <div id="next-player">Next player: <span>${this.nextPlayer}</span></div>
                    <div id="winner">Winner: <span></span></div>
                </div>
                <div class="board">
                    <div><slot name="1-1"></slot></div>
                    <div><slot name="1-2"></slot></div>
                    <div><slot name="1-3"></slot></div>
                    <div><slot name="2-1"></slot></div>
                    <div><slot name="2-2"></slot></div>
                    <div><slot name="2-3"></slot></div>
                    <div><slot name="3-1"></slot></div>
                    <div><slot name="3-2"></slot></div>
                    <div><slot name="3-3"></slot></div>
                </div>
            </div>
        `;
    }

    selectSquare(squareElement) {
        squareElement.setAttribute("value", this.nextPlayer);
        this.nextPlayer = this.nextPlayer === 'X' ? 'O' : 'X';
        this.shadow.querySelector('#next-player span').textContent = this.nextPlayer;
    }

    calculateWinner() {
        const squares = new Map();
        for(const squareElement of this.querySelectorAll("[slot]")) {
            squares.set(squareElement.getAttribute("slot"), squareElement.getAttribute("value"))
        }

        const lines = [
            ['1-1','1-2','1-3'],
            ['2-1','2-2','2-3'],
            ['3-1','3-2','3-3'],
            ['1-1','2-1','3-1'],
            ['1-2','2-2','3-2'],
            ['1-3','2-3','3-3'],
            ['1-1','2-2','3-3'],
            ['1-3','2-2','3-1']
        ];
        for(let i = 0; i < lines.length; i++) {
            const [a,b,c] = lines[i];
            if(squares.get(a) == squares.get(b) && squares.get(a) == squares.get(c)) {
                return squares.get(a);
            }
        }
        return null;
    }
}

customElements.define('ttt-board', TTTBoard);