import { makeObservable } from "../lib/observable.js";

const initialMode = localStorage.getItem("mode") || "diff";
export const store = makeObservable({ mode: initialMode });
window.store = store;

const html = String.raw;


customElements.define('diff-switcher', class extends HTMLElement {
    #formElement;
    #currentSelectionElement;
    #switcherOpenElement;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).innerHTML = html`
            <style>
                :host {
                    display: block;
                    grid-column: edge-start / edge-end;
                    border-bottom: 1px solid var(--border-color);
                    
                }

                #currentselection { anchor-name: --currentselection }
                #currentselection, .dropdown {
                    display: none;
                    /* overflow: hidden; */
                }

                form {
                    background-color: oklch(0 0 0 / 0);
                    padding: 0.7rem var(--content-padding) 0 var(--content-padding);
                    display: grid;
                    
                }

                fieldset {
                    border: 0;
                    padding: 0;
                    margin: 0;
                }

                input[type="radio"], input[type="checkbox"] {
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
                    margin-bottom: -1px;
                    background-color: light-dark(
                        oklch(0.98 0.02 202.01 / 1),
                        oklch(0.22 0.03 254.77 / 1) 
                    );
                    border: 1px solid var(--border-color);
                    border-bottom: 0px solid var(--border-color);
                    border-right: 0px solid var(--border-color);
                    cursor: pointer;
                    user-select: none;
                    transition: background-color 240ms, box-shadow 120ms, color 120ms;
                    &:first-child { border-top-left-radius:  8px; }
                    &:last-child  { border-top-right-radius: 8px; border-right: 1px solid var(--border-color); }
                }
               

                label:hover {
                    background-color: oklch(from var(--highlight-background-color) l c h / 0.3)
                }

                label[data-selected], #currentselection {
                    color: var(--text-color-strong);  
                    border-top: 2px solid var(--highlight-background-color);
                    background: var(--page-background);
                }

                label:focus-within {
                    outline: 2px solid var(--highlight-background-color);
                    outline-offset: 2px;
                }



                /* @media (max-width: 1220px) { */
                @media (max-width: 750px) {
                    #currentselection, .dropdown {
                        display: block;
                        anchor-name: --currentselection
                    }
                    .dropdown {
                        display: grid;
                        grid-template-columns: 127px auto 280px;
                        
                    }
                    #currentselection {
                        grid-column: 3/-1;
                        margin: 0.7rem 25px -1px 25px;
                        display: grid;
                        grid-template-columns: auto 15px;
                        &:after {
                            content: url("/assets/images/chevron-white.svg");
                            display: block;
                            right: 0;
                            width: 15px;
                            height: 15px;
                            transform: rotate(90deg);
                        }
                    }
                    #switcheropen:not(:checked) + form {
                        display: none;
                        
                    }
                    form { 
                        margin:0; padding: 0; 

                        .options {
                            position: absolute;
                            position-anchor: --currentselection;
                            top: anchor(bottom);
                            left: anchor(left);
                            right: anchor(right);
                            display: block;

                            border-bottom-left-radius: 8px;
                            border-bottom-right-radius: 8px;
                            box-shadow: rgba(0, 0, 0, 0.24) 0px 3px 8px;
                            
                            label {
                                display: block;
                                border: 1px solid var(--border-color);
                                border-bottom-width: 0px;
                                border-radius: 0;
                                margin: 0;
                                &:last-child { 
                                    border-bottom-width: 1px; 
                                    border-bottom-left-radius: 8px;
                                    border-bottom-right-radius: 8px;
                                }
                                &[data-selected] {
                                    background: light-dark(oklch(0.98 0.02 202.01 / 1), oklch(0.22 0.03 254.77 / 1));
                                }
                            }
                    }

                    label {
                        
                    }
                }
            </style>
            <div class="dropdown">
                <label id="currentselection" for="switcheropen">Blah</label>
            </div>
            <input type="checkbox" name="switcheropen" id="switcheropen" />
            <form>
                <fieldset role="radiogroup" aria-label="Diff view">
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
        `;

        this.#currentSelectionElement = this.shadowRoot.getElementById("currentselection");
        this.#switcherOpenElement = this.shadowRoot.getElementById("switcheropen");
        this.#formElement = this.shadowRoot.querySelector("form");
        this.#formElement.addEventListener('submit', (event)=> {
            event.preventDefault();
        });

        store.addEventListener("mode", value => {
            console.log('received change from store', this, value, store);
            this.setMode(value)
        });
        this.#formElement.addEventListener('change', (event)=> {
            console.log('formElement eventListener change', this, event);
            this.setMode(event.target.value);    
        }); 

        this.setMode(initialMode);
        
    }
    
    setMode(value) {
        console.log('setDiff', this, value);
        if(store.mode !== value) {
            store.mode = value;
        }

        const selectedInput = this.shadowRoot.querySelector(`input[name="diff"][value="${value}"]`);
        if(selectedInput && !selectedInput.checked) {
            selectedInput.checked = true;
            
        }
        this.#currentSelectionElement.innerHTML = selectedInput.closest("label").querySelector("span").textContent;

        document.documentElement.setAttribute("data-diff", value);
        localStorage.setItem("mode",value);
        

        for(const labelElement of this.shadowRoot.querySelectorAll("form label")) {
            const input = labelElement.querySelector("input");

            if(input.checked) {
                labelElement.setAttribute("data-selected", "selected");
                input.setAttribute('aria-checked', 'true');
            } else {
                labelElement.removeAttribute("data-selected");
                input.setAttribute('aria-checked', 'false');
            }
        }

        this.#switcherOpenElement.checked = false;

        // emit a composed event so outer listeners can react
        this.dispatchEvent(new CustomEvent('diff-change', {
            detail: { value: value },
            bubbles: true,
            composed: true
        }));
    }
});