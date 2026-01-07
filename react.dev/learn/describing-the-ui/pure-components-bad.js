let guest = 0;

customElements.define('tea-cup', class extends HTMLElement {
  connectedCallback() {
    // Bad: changing a preexisting variable!
    guest = guest + 1;
    this.innerHTML = `<h2>Tea cup for guest #${guest}</h2>`;
  }
});

customElements.define('tea-set', class extends HTMLElement {
  connectedCallback() {
  this.innerHTML = `
    <tea-cup></tea-cup>
    <tea-cup></tea-cup>
    <tea-cup></tea-cup>
  `
  }
});
