class BlockSwitcher extends HTMLElement {
    static observedAttributes = ["element", "attr"];
    options = {
        "element" : "html",
        "attr": "data-diff"
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <slot></slot>
        `;


    }

    connectedCallback() {
        this.checkState();
    }

    checkState() {
        const controlElement = document.querySelector(this.options.element);
        if(!controlElement) return;
        const controlValue = controlElement.getAttribute(this.options.attr);

        const slot = this.shadowRoot.querySelector('slot'); // Get the slot element
        const assignedNodes = slot.assignedNodes();
        for(const panelElement of assignedNodes) {
            if(panelElement.matches && panelElement.matches('block-switcher-panel')) {
                if(panelElement.checkState) {
                    panelElement.checkState();
                }
            }
        }
    }

    updateObserver() {
        this.observer = this.observer || new MutationObserver((mutationList, observer) => {
            let needsCheck = false;
            for(const mutationRecord of mutationList) {
                if(mutationRecord.type === "attributes" && mutationRecord.attributeName == this.options.attr) {
                    needsCheck = true;
                }
            }
            if(needsCheck) {
                this.checkState();
            }
        });

        const observedElementChanged = this.options.element !== this.getAttribute("element");

        if(observedElementChanged) {
            this.observer.disconnect();
            this.options.element = this.getAttribute("element");
        }

        const controlElement = document.querySelector(this.options.element);
        if(!controlElement) return;
        this.observer.observe(controlElement, { childList: false, attributes: true, subtree: false });
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if(oldValue !== newValue) {
            this[property] = newValue;
        }
    }

    get element() {
        return this.options.element;
    }
    set element(newElement) {
        this.updateObserver();
        this.options.element = newElement;
        this.checkState();
    }

    get attr() {
        return this.options.attr;
    }
    set attr(newAttr) {
        this.options.attr = newAttr;
        this.checkState();
    }
}

class BlockSwitcherPanel extends HTMLElement {
    static observedAttributes = ["value"];

    options = {
        value: ""
    }

    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <style>
                slot[inert] {
                    display: none;
                }
            </style>
            <slot></slot>
        `
    }

    connectedCallback() {
        this.checkState();
    }

    checkState() {
        const blockSwitcherElement = this.closest("block-switcher");
        if(!blockSwitcherElement) return;

        const controlElement = document.querySelector(blockSwitcherElement.element);
        if(!controlElement) return;
        const controlValue = controlElement.getAttribute(blockSwitcherElement.attr);

        const panelValue = this.getAttribute("value");
        const panelValues = panelValue.split(/[ ,]+/);
        const slotElement = this.shadowRoot.querySelector("slot");

        if(panelValues.indexOf(controlValue) > -1) {
            this.shadowRoot.querySelector("slot").removeAttribute("inert");
            this.removeAttribute("inert");
        } else {
            this.shadowRoot.querySelector("slot").setAttribute("inert",true);
            this.setAttribute("inert",true);
        }
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if(oldValue !== newValue) {
            this[property] = newValue;
        }
    }

    get value() {
        return this.options.value;
    }
    set value(newValue) {
        this.options.value = newValue;
        this.checkState();
    }
}

customElements.define('block-switcher', BlockSwitcher); 
customElements.define('block-switcher-panel', BlockSwitcherPanel); 