export class TTTSquare extends HTMLElement {      
    static observedAttributes = ["value"];

    connectedCallback() {
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.innerHTML = `
            <link rel="stylesheet" href="./ttt-square.css" />
            <button class="square"></button>
        `
    }

    attributeChangedCallback(attribute) {
        if(attribute == 'value') {
            const value = this.getAttribute(attribute);
            const button = this.shadow.querySelector('button');
            button.textContent = value;
        }
    }
}

customElements.define('ttt-square', TTTSquare);