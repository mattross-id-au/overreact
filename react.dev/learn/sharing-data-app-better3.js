// App state separate from UI tree presentat Elements
const count = Object.assign(new EventTarget(), {
    count: 0,
    increment() {
        this.count++;
        this.dispatchEvent(new CustomEvent("increment", {detail: this.count}));
    }
}) 

customElements.define('my-app', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>Counters that update together</h1>
      <my-button></my-button>
      <my-button></my-button>
    `;
  }
});

// Buttons set and listen for state changes, separate from UI Elements
customElements.define('my-button', class extends HTMLElement { 
    constructor() {
        super();
        this.innerHTML = '<button>Clicked <span>0</span> times</button>';

        // Send increments on click
        this.querySelector("button").addEventListener("click", () => {
            count.increment();
        })

        // Listen for increments
        count.addEventListener("increment", (event) => { 
            this.querySelector("span").textContent = event.detail;
        })
    }
});