customElements.define('diff-switcher', class extends HTMLElement {
    connectedCallback() {
        if(!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        background-color: oklch(from var(--page-background-color) l c h / 0.7);
                        backdrop-filter: blur(5px);
                        border-bottom: 1px solid var(--border-color);
                    }

                    form {
                        background-color: oklch(0 0 0 / 0);
                        padding: 0.7rem var(--content-padding) 
                    }

                    input[type="radio"] {
                        position: absolute;
                        width: 1px;
                        height: 1px;
                        padding: 0;
                        margin: -1px;
                        overflow: hidden;
                        clip: rect(0 0 0 0);
                        clip-path: inset(50%);
                        border: 0;
                        white-space: nowrap;
                    }

                    label { 
                        display: inline-block; 
                        padding: 0.3rem 2rem;
                        margin-right: 0.5rem;
                        background-color: var(--page-background-color);
                        border: 1px solid var(--border-color);
                        border-radius: 50px;
                        cursor: pointer;
                        user-select: none;
                        transition: background-color 240ms, box-shadow 120ms, color 120ms;
                    }

                    label:focus-within {
                        outline: 2px solid var(--focus-color, Highlight);
                        outline-offset: 2px;
                    }

                    label:hover {
                        background-color: oklch(from var(--highlight-background-color) l c h / 0.3)
                    }

                    label[data-selected] {
                        color: var(--text-color-strong);    
                        background-color: var(--highlight-background-color);
                        box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.3);
                    }

                    fieldset {
                        border: 0;
                        padding: 0;
                        margin: 0;
                    }

                    legend {
                        display: inline-block;
                        margin-right: 0.5rem;
                        margin-bottom: 0.5rem;
                        font-weight: 600;
                    }
                </style>

                <form>
                    <fieldset role="radiogroup" aria-label="Diff view">
                    <legend>Show me: </legend>
                    <label data-selected="selected">
                        <input type="radio" name="diff" value="diff" checked="checked" >
                        <span>Differences</span>
                    </label>
                    <label>
                        <input type="radio" name="diff" value="wc">
                        <span>Web Components</span>
                    </label>
                    <label>
                        <input type="radio" name="diff" value="react">
                        <span>React</span>
                    </label>
                    </fieldset>
                </form>
            `

            const form = this.shadowRoot.querySelector("form");

            // set initial attribute from the checked input
            const initial = this.shadowRoot.querySelector('input[name="diff"]:checked');
            if (initial) {
                document.documentElement.setAttribute("data-diff", initial.value);
            }

            form.addEventListener('submit', (event)=> {
                event.preventDefault();
            });

            form.addEventListener('change', (event)=> {
                document.documentElement.setAttribute("data-diff", event.target.value);

                for(const labelElement of this.shadowRoot.querySelectorAll("label")) {
                    const input = labelElement.querySelector("input");

                    if(input.checked) {
                        labelElement.setAttribute("data-selected", "selected");
                        input.setAttribute('aria-checked', 'true');
                    } else {
                        labelElement.removeAttribute("data-selected");
                        input.setAttribute('aria-checked', 'false');
                    }
                }

                // emit a composed event so outer listeners can react
                this.dispatchEvent(new CustomEvent('diff-change', {
                    detail: { value },
                    bubbles: true,
                    composed: true
                }));
            });
        }
        
    }
})