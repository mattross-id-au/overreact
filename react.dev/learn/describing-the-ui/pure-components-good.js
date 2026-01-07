customElements.define('tea-cup', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h2>Tea cup for guest #${this.getAttribute("guest")}</h2>`;
  }
});

customElements.define('tea-set', class extends HTMLElement {
  connectedCallback() {
  this.innerHTML = `
    <tea-cup guest="1"></tea-cup>
    <tea-cup guest="2"></tea-cup>
    <tea-cup guest="3"></tea-cup>
  `
  }
});
