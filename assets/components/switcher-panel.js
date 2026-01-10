class SwitcherPanel extends HTMLElement {
    static observedAttributes = ["element", "attr", "value"];

    #observer = null;
    #controlElement = null;
    #attr = "data-diff";
    #value = "";
    #slotElement;

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; }
                slot[inert] {
                    display: none;
                }
            </style>
            <slot></slot>
        `;

        this.#slotElement = this.shadowRoot.querySelector("slot");
    }

    connectedCallback() {
        if(!this.#controlElement) {
            this.element = "html";
        }
    }

    checkState() {
        if(this.#controlElement) {
            const controlValue = this.#controlElement.getAttribute(this.#attr);
            const panelValues = this.#value.split(/[ ,]+/);

            if(panelValues.indexOf(controlValue) > -1) {
                this.shadowRoot.querySelector("slot").removeAttribute("inert");
                this.removeAttribute("inert");
            } else {
                this.shadowRoot.querySelector("slot").setAttribute("inert",true);
                this.setAttribute("inert",true);
            }
        }
    }

    updateObserver() {
        this.observer = this.observer || new MutationObserver((mutationList, observer) => {
            let needsCheck = false;
            for(const mutationRecord of mutationList) {
                if(mutationRecord.type === "attributes" && mutationRecord.attributeName == this.#attr) {
                    needsCheck = true;
                }
            }
            if(needsCheck) {
                this.checkState();
            }
        });

        this.observer.observe(this.#controlElement, { childList: false, attributes: true, subtree: false });
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if(property == "element") { this.element = newValue; }
        if(property == "attr") { this.attr = newValue; }
        if(property == "value") { this.value = newValue; }
    }

    get element() {
        return this.#controlElement;
    }

    set element(elementSelector) {
        let element = null;
        if(elementSelector instanceof HTMLElement) {
            element = elementSelector
        } else if (typeof elementSelector == "string") {
            element = document.querySelector(elementSelector);
        }

        if(!element) {
            if(this.#observer) {
                this.#observer.disconnect();
            }
            return;
        }

        if(element !== this.#controlElement) {
            if(this.#observer) {
                this.#observer.disconnect();
            }
            this.#controlElement = element;
            this.updateObserver();
            this.checkState();
        }
    }

    get attr() {
        return this.#attr;
    }
    set attr(newAttr) {
        this.#attr = newAttr;
        this.checkState();
    }

    get value() {
        return this.#value;
    }

    set value(newValue) {
        this.#value = newValue;
        this.checkState();
    }
}

customElements.define('switcher-panel', SwitcherPanel); 