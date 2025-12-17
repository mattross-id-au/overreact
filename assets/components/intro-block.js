customElements.define('intro-block', class extends HTMLElement {
    static observedAttributes = ["href","text"];
    #a;

    constructor() {
        super();
        this.innerHTML = `
            <p>This is a remake of the official <a href="https://react.dev/learn" target="_blank" rel="noopener">React Quick Start tutorial</a>, edited to use <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements" target="_blank" rel="noopener">Web Components</a> instead of React.</p>
        `;
        // <p>Today, you can do a lot with standard in-browser HTML, CSS and JavaScript. No build tools, transpilers or complex hosting required. The code you write is the code that ships.</p>
        this.#a = this.querySelector("a");
    }
    attributeChangedCallback(property, oldValue, newValue) {
        if(property == "href") {
            this.#a.href = newValue;
        }
        if(property == "text") {
            this.#a.textContent = newValue;
        }
    }
});