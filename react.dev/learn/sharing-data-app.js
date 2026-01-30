customElements.define('my-app', class extends HTMLElement {
  #count = 0;

  handleClick() {
    this.#count++;
    for(const myButton of this.querySelectorAll("my-button")) {
        myButton.setAttribute("count", this.#count);
    }
  }
    
  connectedCallback() {
    this.innerHTML = `
      <h1>Counters that update together</h1>
      <my-button count="0"></my-button>
      <my-button count="0"></my-button>
    `;
  }
});

customElements.define('my-button', class extends HTMLElement {
    static observedAttributes = ["count"];
    
    constructor() {
        super();
        this.innerHTML = '<button>Clicked <span></span> times</button>';
        this.querySelector("button").addEventListener("click", () => {
            this.closest('my-app').handleClick();
        })
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.querySelector("span").textContent = newValue;
    }
});
