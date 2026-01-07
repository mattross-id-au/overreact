customElements.define('person-profile', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <img
        src="https://i.imgur.com/QIrZWGIs.jpg"
        alt="Alan L. Hart"
      />
    `;
  }
});