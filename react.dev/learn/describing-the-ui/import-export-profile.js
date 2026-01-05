customElements.define('person-profile', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <img
        src="https://i.imgur.com/MK3eW3As.jpg"
        alt="Katherine Johnson"
      />
    `;
  }
});