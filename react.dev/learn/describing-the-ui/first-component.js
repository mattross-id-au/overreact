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

customElements.define('profile-gallery', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section>
        <h1>Amazing scientists</h1>
        <person-profile></person-profile>
        <person-profile></person-profile>
        <person-profile></person-profile>
      </section>
    `;
  }
});