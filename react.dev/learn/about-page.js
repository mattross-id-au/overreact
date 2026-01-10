customElements.define('about-page', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>About</h1>
      <p>Hello there.<br>How do you do?</p>
    `;
  }
});