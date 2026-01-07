customElements.define('packing-item', class extends HTMLElement {
  connectedCallback() {
    const name = this.getAttribute("name");
    const isPacked = ![null,"false"].includes(this.getAttribute("isPacked"));
    this.innerHTML = `
      <li className="item">
        ${name} ${isPacked ? '✅' : ''}
      </li>
    `;
  }
});

customElements.define('packing-list', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <section>
        <h1>Sally Ride's Packing List</h1>
        <ul>
          <packing-item
            isPacked="true"
            name="Space suit"
          ></packing-item>
          <packing-item
            isPacked="true"
            name="Helmet with a golden leaf"
          ></packing-item>
          <packing-item
            isPacked="false"
            name="Photo of Tam"
          ></packing-item>
        </ul>
      </section>
    `;
  }
});