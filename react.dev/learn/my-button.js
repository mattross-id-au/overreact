customElements.define('my-button', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'}).innerHTML = `
      <button>I'm a button</button>
    `;
  }
});