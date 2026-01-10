let html = String.raw;
(async () => {
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/xml/xml.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/htmlmixed/htmlmixed.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/javascript/javascript.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/jsx/jsx.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/css/css.min.js');

    customElements.define('code-mirror', CodeMirrorElement); 
    globalThis.dispatchEvent(new Event("ready"));

})();

class CodeMirrorElement extends HTMLElement {
    static observedAttributes = ["mode", "readonly","linenumbers","linewrapping","label","highlights"];

    #activeContext;
    #contextObserver;
    #codeMirrorLayoutElement;
    #highlightsStr = '';
    #highlightsStyleElement;
    

    options = {
        value: '',
        mode: 'htmlmixed',
        theme: 'ayu-mirage',
        lineNumbers: true,
        readOnly: false,
        label: ""
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        // this.shadowRoot.innerHTML = `
        //     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.css" />
        //     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/theme/monokai.min.css" />
        //     <div class="editor"></div>
        // `

        this.shadowRoot.innerHTML = html`
            <style>
                
                :host { display: flex; flex-direction: column; }
                .layout { display: flex; flex-direction: column; flex: 1; min-height: 0; }
                .editor { display: flex; flex: 1 1 auto; overflow: auto; min-height: 0; }
                .editor .CodeMirror { 
                    overflow: hidden;
                    height: auto;
                    min-height: 0;
                    /* height: 200px; */
                    width: 100%;
                    /*--editor-background-color: oklch(from var(--page-background-color) calc(l * 1.2) calc(c * 1.2) h / 1);    */
                    --editor-background-color: var(--highlight-background);
                    --highlight-line-color: oklch(from var(--editor-background-color) calc(l * 1.2) calc(c * 1.2) h / 1);
                    --highlight-line-color: oklch(0.77636 0.17048 110.928 / 0.1);
                    --highlight-line-color: light-dark(rgba(0, 0, 0, 0.063), rgba(255, 255, 255, 0.063));
                    

                    padding: 10px 0;
                    border-radius: var(--border-radius);
                    &.cm-s-ayu-mirage, &.cm-s-ayu-mirage .CodeMirror-gutters  {
                        background: var(--editor-background-color)
                    }
                    line-height: 1.8;
                    font-size: 13px;
                    pre.CodeMirror-line {
                        padding-left: 16px;
                    
                    }
                }

                .label-contents + .editor .CodeMirror {
                    border-radius: 0 0 var(--border-radius) var(--border-radius);
                }
                
                .label {
                    background-color: oklch(from var(--page-background-color) calc(l * 1.2) calc(c * 1.2) h / 1); 
                    border-radius: var(--border-radius) var(--border-radius) 0 0;
                    border-bottom: 1px solid var(--border-color);
                    padding: 0.5rem 1.2rem;
                    font-size: 75%;
                    /*text-transform: uppercase;*/
                    font-weight: 700;

                }
                .label-empty { display: none; }
                :host([slot="del"]) [data-diff=diff] .label span,
                :host(.del) [data-diff=diff] .label span {
                    color: oklch(from var(--text-color) l c h / 0.7); 
                    text-decoration: line-through;
                    text-decoration-color: #800000;
                }
                :host([slot="ins"]) [data-diff=diff] .label span,
                :host(.ins) [data-diff=diff] .label span {
                    padding: 0.2rem 0.3rem;
                    text-decoration: none; 
                    background-color: oklch(77.636% 0.17048 110.928 / 0.1); 
                    corner-shape: squircle;
                    border-radius: 50% / 1.1rem 0.5rem 0.9rem 0.7rem;
                    box-decoration-break: clone;
                }

                .editor .CodeMirror-scrollbar-filler { background-color: transparent;}
                
                @supports (scrollbar-color: auto) {
                    * {
                        scrollbar-width: thin;
                        scrollbar-color: #ffffff50 transparent;
                    }
                }

                /* Otherwise, use ::-webkit-scrollbar-* pseudo-elements */
                @supports selector(::-webkit-scrollbar) {
                    *::-webkit-scrollbar {
                        background: #ffffff50;
                    }
                    *::-webkit-scrollbar-thumb {
                        background: transparent;
                    }
                }

            </style>
            <style class="highlights"></style>
            <div class="layout">
                <div class="label label-empty"><span></span></div>
                <div class="editor"></div>
            </div>
        `;

        this.#codeMirrorLayoutElement = this.shadowRoot.querySelector(".layout");
        this.#highlightsStyleElement = this.shadowRoot.querySelector("style.highlights");

        this.styles = Promise.all([
            stylePromise("https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.css", this.shadowRoot),
            stylePromise("https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/theme/ayu-mirage.min.css", this.shadowRoot)
        ])
    }

    connectedCallback() {
        //console.log('connectedCallback', this);
        const url = this.getAttribute("src");

        new Promise((resolve,reject) => {
            if(url) {
                fetch(url)
                    .then(response=>response.text())
                    .then(text=>{ resolve(text) });
            } else {
                resolve(this.innerHTML)
            }
        }).then(code=>{
            this.styles.then(()=>{
                const useElement = this.shadowRoot.querySelector(".editor");
                
                const lines = code.split("\n").length;
                // let height = (lines * 26) + 10;

                // if(height > 400) { 
                //     height = 400;
                // }
                // //console.log(lines);
                // styleElement.textContent = `
                //     .editor .CodeMirror { height: ${height}px }
                // `

                const useOptions = { 
                    ...this.options,
                    value: code
                }

                this.CodeMirror = CodeMirror(useElement, useOptions);
                this.CodeMirror.on('change',(_, changeObj) => {
                    const changeEvent = new CodeMirrorChangeEvent(this.CodeMirror.doc.getValue(), changeObj);
                    this.dispatchEvent(changeEvent);
                });

                // Watch for context changes
                this.#contextObserver = this.#contextObserver || new MutationObserver((mutationList, observer) => {
                    for(const mutationRecord of mutationList) {
                        if(mutationRecord.type === "attributes" && mutationRecord.attributeName == "data-diff") {
                            this.#handleContextChange();
                        }
                    }
                });
                this.#contextObserver.observe(document.documentElement, { childList: false, attributes: true, subtree: false });
                this.#handleContextChange();

                this.dispatchEvent(new Event("ready"));

            })

        })
    }

    #handleContextChange() {
        this.#activeContext = document.documentElement.getAttribute("data-diff");
        this.#codeMirrorLayoutElement.setAttribute("data-diff", this.#activeContext);
    }

    attributeChangedCallback(property, oldValue, newValue) {
        //console.log('attributeChangedCallback', {property, oldValue, newValue}, this);
        if(oldValue !== newValue) {
            this[property] = newValue;
        }
    }

    get mode() { 
        if(this.CodeMirror)  return this.CodeMirror.getOption('mode');
        return this.options.mode;
    }
    set mode(newMode) {
        if(newMode == 'html') {
            newMode = 'htmlmixed'
        }
        if(this.CodeMirror) this.CodeMirror.setOption('mode',newMode);
        this.options.mode = newMode;
    }

    get readonly() {
        if(this.CodeMirror)  return this.CodeMirror.getOption('readOnly');
        return this.options.readOnly;
    }
    set readonly(newReadOnly) {
        if(this.getAttribute("readonly") === null) newReadOnly = this.options.readOnly;
        if(newReadOnly === "") newReadOnly = true;
        if(newReadOnly === "false") newReadOnly = false;
        newReadOnly = !!newReadOnly;
        if(this.CodeMirror) this.CodeMirror.setOption('readOnly',newReadOnly);
        this.options.readOnly = newReadOnly;
    }

    get linenumbers() {
        if(this.CodeMirror)  return this.CodeMirror.getOption('lineNumbers');
        return this.options.lineNumbers;
    }
    set linenumbers(newLineNumbers) {
        if(this.getAttribute("linenumbers") === null) newLineNumbers = this.options.lineNumbers;
        if(newLineNumbers === "") newLineNumbers = true;
        if(newLineNumbers === "false") newLineNumbers = false;
        newLineNumbers = !!newLineNumbers;
        if(this.CodeMirror) this.CodeMirror.setOption('lineNumbers',newLineNumbers);
        this.options.lineNumbers = newLineNumbers;
    }

    get linewrapping() {
        if(this.CodeMirror)  return this.CodeMirror.getOption('lineWrapping');
        return this.options.lineWrapping;
    }
    set linewrapping(newLineWrapping) {
        if(this.getAttribute("linewrapping") === null) newLineWrapping = this.options.lineNumbers;
        if(newLineWrapping === "") newLineWrapping = true;
        if(newLineWrapping === "false") newLineWrapping = false;
        newLineWrapping = !!newLineWrapping;
        if(this.CodeMirror) this.CodeMirror.setOption('lineWrapping',newLineWrapping);
        this.options.lineWrapping = newLineWrapping;
    }

    get label() {
        return this.options.label;
    }
    set label(newLabel) {
        this.options.label = newLabel;
        const labelElement = this.shadowRoot.querySelector(".label");
        const labelSpanElement = this.shadowRoot.querySelector(".label span");
        labelSpanElement.textContent = this.options.label;
        if(newLabel) {
            labelElement.classList.remove("label-empty");
            labelElement.classList.add("label-contents");
        } else {
            labelElement.classList.add("label-empty");
            labelElement.classList.remove("label-contents");
        }

    }
    get value() {
        return this.CodeMirror.doc.getValue();
    }

    get highlights() {
        return this.#highlightsStr;
    }
    set highlights(str) {
        this.#highlightsStr = str;
        let result = '';
        const blocks = str.split(",");
        for(const block of blocks) {
            let [start, end] = block.split("-");
            if(start && !end) { end = start }
            for(let i = parseInt(start); i <= parseInt(end); i++) {
                result += `
                    .CodeMirror-code div:nth-child(${i}), .CodeMirror-code pre.CodeMirror-line:nth-child(${i}) {
                        background-color: var(--highlight-line-color);
                    }
                `
            }
        }
        this.#highlightsStyleElement.textContent = result;

    }

    addEventListener(event, func) {
        console.log('codeMirror - addEventListener', event, func);
        super.addEventListener(event, func);
    }
}

function scriptPromise(url, parent) {
    parent = parent || document.head;
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.addEventListener('load', ()=>{
            resolve();
        });
        parent.appendChild(s);
    })
}

function stylePromise(url, parent) {
    parent = parent || document.head;
    return new Promise((resolve, reject) => {
        const s = document.createElement('link');
        s.rel = "stylesheet";
        s.href = url;
        s.addEventListener('load', ()=>{
            resolve();
        });
        parent.appendChild(s);
    })
}

class CodeMirrorChangeEvent extends Event {
    constructor(value, change) {
        super("change");
        this.value = value;
        this.change = change;
    }
}


