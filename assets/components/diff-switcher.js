customElements.define('diff-switcher', class extends HTMLElement {
    connectedCallback() {
        if(!this.shadowRoot) {
            this.shadow = this.attachShadow({ mode: "open" });
            this.shadow.innerHTML = `
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
                    input {
                        position: absolute;
                        left: -9999px;
                    }
                    label { 
                        display: inline-block; 
                        padding: 0.3rem 2rem;
                        background-color: var(--page-background-color);
                        border: 1px solid var(--border-color);
                        border-radius: 50px;
                        cursor: pointer;
                    }
                    label:hover {
                        background-color: oklch(from var(--highlight-background-color) l c h / 0.3)
                    }
                    label[data-selected] {
                        color: var(--text-color-strong);    
                        background-color: var(--highlight-background-color);
                        box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.3);
                    }
                </style>
                <form>
                    Show me: 
                    <label data-selected="true">
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
                </form>
            `

            const form = this.shadow.querySelector("form");
            document.documentElement.setAttribute("data-diff", "diff");

            form.addEventListener('submit', (event)=> {
                event.preventDefault();
            });

            form.addEventListener('change', (event)=> {
                document.documentElement.setAttribute("data-diff", event.target.value);

                for(const labelElement of this.shadow.querySelectorAll("label")) {
                    const labelInputVal = labelElement.querySelector("input").value;

                    if(labelInputVal == event.target.value) {
                        labelElement.setAttribute("data-selected", "selected");
                    } else {
                        labelElement.removeAttribute("data-selected");
                    }
                }
            });
        }
        
    }
})