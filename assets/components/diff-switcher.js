// customElements.define('diff-option', class extends HTMLElement {
//     constructor() {
//         super();
//         this.attachShadow({ mode: "open"});

//         const value = this.getAttribute("")

//         this.shadowRoot.innerHTML = `
//             <label data-selected="selected">
//                 <input type="radio" name="diff" value="diff" checked="checked" aria-checked="true">
//                 <span>${this.textContent}</span>
//             </label>
//         `

//         this.addEventListener('click', () {

//         })
//     }
// });

customElements.define('diff-switcher', class extends HTMLElement {
    #formElement;

    connectedCallback() {
        if(!this.shadowRoot) {
            this.attachShadow({ mode: "open" });
            this.shadowRoot.innerHTML = `
                <style>
                    :host {
                        display: block;
                        grid-column: edge-start / edge-end;
                    }

                    form {
                        background-color: oklch(0 0 0 / 0);
                        padding: 0.7rem var(--content-padding) 0 var(--content-padding);
                        display: grid;
                        grid-template-columns: var(--main-grid-columns);
                    }

                    fieldset {
                        grid-column: text-start / text-end; 
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

                    .options {
                        display: flex;
                        justify-content: center;
                    }

                    label { 
                        display: inline-block; 
                        padding: 0.5rem 1rem;
                        margin: 0 -1px 0 0;
                        background-color: light-dark(
                            oklch(0.98 0.02 202.01 / 1),
                            oklch(0.22 0.03 254.77 / 1) 
                        );
                        border: 1px solid var(--border-color);
                        border-bottom: 0px solid var(--border-color);
                        cursor: pointer;
                        user-select: none;
                        transition: background-color 240ms, box-shadow 120ms, color 120ms;
                        &:first-child { border-top-left-radius:  8px; }
                        &:last-child  { border-top-right-radius: 8px; }
                    }
                    

                    @media (max-width: 1220px) { 
                        label {
                            font-size: 85%;
                        }
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
                        border-top: 2px solid var(--highlight-background-color);
                        background: var(--page-background);
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
                        <!-- <legend>Show</legend> -->
                        <div class="options">
                            <label>
                                <input type="radio" name="diff" value="wc">
                                <span>Web Components</span>
                            </label>

                            <label>
                                <input type="radio" name="diff" value="diff">
                                <span>Edits</span>
                            </label>

                            <label>
                                <input type="radio" name="diff" value="react">
                                <span>React (original)</span>
                            </label>
                        </div>
                    </fieldset>
                </form>
            `

            this.#formElement = this.shadowRoot.querySelector("form");

            this.#formElement.addEventListener('submit', (event)=> {
                event.preventDefault();
            });

            this.#formElement.addEventListener('change', (event)=> {
                this.setDiff(event.target.value);    
            });    
        }

        this.setDiff(localStorage.getItem("diff") || "diff");
    }

    setDiff(value) {
        const selectedInput = this.shadowRoot.querySelector(`input[name="diff"][value="${value}"]`);
        if(selectedInput && !selectedInput.checked) {
            selectedInput.checked = true;
        }

        document.documentElement.setAttribute("data-diff", value);
        localStorage.setItem("diff",value);
        
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
            detail: { value: value },
            bubbles: true,
            composed: true
        }));

    }
})