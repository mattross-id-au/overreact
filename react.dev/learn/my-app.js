customElements.define('my-app', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>Welcome to my app</h1>
      <my-button></my-button>
    `;
  }
});