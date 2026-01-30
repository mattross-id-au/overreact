class Counter extends EventTarget {
    #count = 0;

    increment() {
        this.#count++;
        this.dispatchEvent(new CustomEvent("increment", {detail: this.#count}));
    }
}

const count = new Counter();

// i.addEventListener("increment", (event) => { 
//     console.log("Increment happened", event.detail) 
// })
// i.increment();



function makeStore(obj) {
    return new Proxy(obj || new EventTarget(), {
        set: (target, prop, value, receiver) => {
            target.dispatchEvent(new CustomEvent(prop, {detail: value}))
            return Reflect.set(target, prop, value, receiver);
        },
        get: (target, prop, receiver) => {
            if(prop === "onChange") {
                return target.addEventListener.bind(target);
            }
            if (typeof target[prop] === 'function') {
                return target[prop].bind(target); // Bind the function to the original object
            }
            return Reflect.get(target, prop, receiver);
        }
    })
}
// const store = new Proxy(new EventTarget(), {
//     set: (target, prop, value, receiver) => {
//         target.dispatchEvent(new CustomEvent(prop, {detail: value}))
//         return Reflect.set(target, prop, value, receiver);
//     },
//     get: (target, prop, receiver) => {
//         if (typeof target[prop] === 'function') {
//             return target[prop].bind(target); // Bind the function to the original object
//         }
//         return Reflect.get(target, prop, receiver);
//     }
// });
const store = makeStore();
store.addEventListener("name", event => { console.log("Name's new value is", event.detail) })

customElements.define('my-app', class extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <h1>Counters that update together</h1>
      <my-button></my-button>
      <my-button></my-button>
    `;
  }
});

customElements.define('my-button', class extends HTMLElement {
    static observedAttributes = ["count"];
    
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

    attributeChangedCallback(name, oldValue, newValue) {
        this.querySelector("span").textContent = newValue;
    }
});