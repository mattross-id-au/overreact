customElements.define('my-button', class extends HTMLElement {
  handleClick() {
    alert('You clicked me!');
  }
  
  constructor() {
    super();
    this.attachShadow({ mode:'open' }).innerHTML = `
      <button>Click me</button>
    `;
    const buttonElement = this.shadowRoot.querySelector('button');
    buttonElement.addEventListener('click', this.handleClick.bind(this))
  }
});