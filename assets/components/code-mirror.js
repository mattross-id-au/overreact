(async () => {
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/xml/xml.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/htmlmixed/htmlmixed.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/javascript/javascript.min.js');
    await scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/jsx/jsx.min.js');
    
    customElements.define('code-mirror', CodeMirrorElement); 
    globalThis.dispatchEvent(new Event("ready"));

})();

class CodeMirrorElement extends HTMLElement {
    static observedAttributes = ["mode", "readonly","linenumbers","linewrapping","label"];

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

        this.shadowRoot.innerHTML = `
            <style>
                
                :host { display: block; }
                
                .editor .CodeMirror { 
                    --editor-background-color: oklch(from var(--page-background-color) calc(l * 1.2) calc(c * 1.2) h / 1);    
                    --highlight-line-color: oklch(from var(--editor-background-color) calc(l * 1.2) calc(c * 1.2) h / 1);
                    

                    padding: 10px 10px 10px 5px; 
                    border-radius: var(--border-radius);
                    &.cm-s-ayu-mirage, &.cm-s-ayu-mirage .CodeMirror-gutters  {
                        background: var(--editor-background-color)
                    }
                    line-height: 1.8;
                    font-size: 14px;
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
                    text-transform: uppercase;
                    font-weight: 800;

                }
                .label-empty { display: none; }
            </style>
            <style class="dynamic"></style>
            <style class="highlights">
                .CodeMirror-code div:nth-child(6) {
                    background-color: var(--highlight-line-color);
                }
            </style>
            <div class="label label-empty"></div>
            <div class="editor"></div>
        `;

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
                const styleElement = this.shadowRoot.querySelector("style.dynamic");
                const lines = code.split("\n").length;
                let height = (lines * 26) + 10;

                if(height > 400) { 
                    height = 400;
                }
                //console.log(lines);
                styleElement.textContent = `
                    .editor .CodeMirror { height: ${height}px }
                `

                const useOptions = { 
                    ...this.options,
                    value: code
                }
                this.CodeMirror = CodeMirror(useElement, useOptions);
                this.CodeMirror.on('change',(_, changeObj) => {
                    const changeEvent = new CodeMirrorChangeEvent(this.CodeMirror.doc.getValue(), changeObj);
                    this.dispatchEvent(changeEvent);
                });

                                        // new CustomEvent("change", { 
                        //     detail: {
                        //         value: this.CodeMirror.doc.getValue(),
                        //         change: changeObj
                        //     }
                        // })

                this.dispatchEvent(new Event("ready"));

            })

        })
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
        labelElement.textContent = this.options.label;
        if(newLabel) {
            labelElement.classList.remove("label-empty");
            labelElement.classList.add("label-contents");
        } else {
            labelElement.classList.add("label-empty");
            labelElement.classList.remove("label-contents");
        }

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


