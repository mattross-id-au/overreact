customElements.define('my-button', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<button>I'm a button</button>`;
  }
});