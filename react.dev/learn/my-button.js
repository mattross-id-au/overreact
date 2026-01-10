customElements.define('my-button', class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode:'open'});
    this.shadowRoot.innerHTML = `
      <button>I'm a button</button>
    `;
  }
});