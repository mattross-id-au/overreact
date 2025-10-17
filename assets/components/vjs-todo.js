export class VjsTodo extends HTMLElement {
    static observedAttributes = ["selected"];
    selected = false;
    
    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this.shadow.innerHTML = `
            <label>
                <input type="checkbox" /> <slot></slot>
            </label>
        `;
        console.log('vjs-todo constructor done');
        console.dir(this);

        this.shadow.querySelector('input[type=checkbox]').addEventListener('change', (event) => {
            
            //if(this.getAttribute("selected") !== )

        })
        
    }

    attributeChangedCallback(data) {
        console.log('vjs-todo attributeChangedCallback', data);
    }
}

customElements.define('vjs-todo', VjsTodo)