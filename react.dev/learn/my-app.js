customElements.define('my-app', class extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `
      <div>
        <h1>Welcome to my app</h1>
        <my-button></my-button>
      </div>
    `;
  }
});