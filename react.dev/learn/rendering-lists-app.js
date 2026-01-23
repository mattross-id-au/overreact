const products = [
  { title: 'Cabbage', isFruit: false, id: 1 },
  { title: 'Garlic', isFruit: false, id: 2 },
  { title: 'Apple', isFruit: true, id: 3 },
];

customElements.define('shopping-list', class extends HTMLElement {
  connectedCallback() {
    const listItems = products.map(product => `
      <li 
        data-id="${product.id}"
        style="
          color: ${product.isFruit ? 'magenta' : 'darkgreen'};
        "
      >
        ${product.title}
      </li>
    `).join('');

    this.innerHTML = `
      <ul>${listItems}</ul>
    `;
  }
});