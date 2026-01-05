import "./person-profile.js";

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