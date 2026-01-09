customElements.define('my-button', class extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<button>I'm a button</button>`;
  }
});