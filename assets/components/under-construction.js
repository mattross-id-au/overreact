customElements.define('under-construction', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    background: var(--highlight-background);
                    padding: var(--content-padding);
                    margin-bottom: 1px!important;
                    display:block;
                }
                div {
                    display: grid;
                    gap: var(--content-padding);
                    grid-template-columns: 50px fit-content(1000px) 50px;
                    grid-template-rows: 50px;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                }
                ::slotted(p), p { 
                    line-height: 1.4!important; 
                }
            </style>
            <div>
                <img src="/assets/images/under-construction.gif" alt="" />
                <slot>
                    <p>This page is under construction.<br/>I am building in public (<a href="https://github.com/mattross-id-au/overreact" target="_blank">see github repo</a>).</p>
                </slot>
                <img src="/assets/images/under-construction.gif" alt="" />
            </div>
        `;

        //this.innerHTML = this.innerHTML || "<p>This page is under construction.<br/>I am building in public.</p>";
        this.shadowRoot.host.classList.add("full-width");
    }
});