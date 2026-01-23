customElements.define('my-button', class extends HTMLElement {
  #count = 0;

  handleClick() {
    this.#count = this.#count + 1;
    this.countContainer.innerHTML = this.#count;
  }

  constructor() {
    super();
    
    this.attachShadow({ mode:'open' }).innerHTML = `
      <button>Clicked <span>${this.#count}</span> times</button>
    `;

    // map HTML Elements
    this.buttonElement = this.shadowRoot.querySelector('button');
    this.countContainer = this.shadowRoot.querySelector('button span');

    // Listen for button clicks and run handleClick
    this.buttonElement.addEventListener('click', this.handleClick.bind(this))
  }
});