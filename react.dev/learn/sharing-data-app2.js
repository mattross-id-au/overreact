customElements.define('my-app', class extends HTMLElement {
  #count = 0;

  handleClick() {
    this.#count++;
    this._buttons.forEach(button => button.setAttribute("count", this.#count));
  }
    
  connectedCallback() {
    this.innerHTML = `
      <h1>Counters that update together</h1>
      <my-button count="0"></my-button>
      <my-button count="0"></my-button>
    `;

    this._buttons = this.querySelectorAll('my-button');
    this._buttons.forEach(button => button.addEventListener('click', this.handleClick.bind(this)));
  }
});

customElements.define('my-button', class extends HTMLElement {
    static observedAttributes = ["count"];

    constructor() {
        super();
        this.innerHTML = '<button>Clicked <span></span> times</button>';
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.querySelector("span").textContent = newValue;
    }
});
