customElements.define('my-app', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>Counters that update separately</h1>
      <my-button></my-button>
      <my-button></my-button>
    `;
  }
});

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