const theme = {
    backgroundColor: 'black',
    color: 'pink'
}

customElements.define('pretty-pink', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<p>Pretty in pink</p>`;

    // Select <p> and Apply theme
    const paraElement = this.querySelector("p");
    Object.assign(paraElement.style, theme);
  }
});