class CodePreview extends HTMLElement {
    static observedAttributes = ["srcdoc","id", "wrapper", "entry","entryfile"];
    #entry = '';
    #entryfile = '';

    static srcWrappers = new Map([
        ["none", function(content) { return content }],
        ["plain", function(content) { 
            return `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    ${ this.appendHeaders() }
                    ${ this.appendConsoleShim() }
                </head>
                <body>${content}</body>
                </html>
            `
        }],
        ["react2", function(content) {
            if(content.indexOf("export default ") == -1) {
                return `
                    <html><head>${ this.appendHeaders() }</head><body>No export found</body></html>
                `
            }
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    ${ this.appendHeaders() }
                    <!-- script src="https://unpkg.com/react@18/umd/react.development.js"></script -->
                    <!-- script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script -->
                    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
                    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
                    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

                </head>
                <body>
                    <div id="root"></div>
                    <script type="text/babel">
                        ${content.replace("export default ", "let App = ")}
                        const container = document.getElementById('root');
                        const root = ReactDOM.createRoot(container);
                        root.render(<App />);
                    </script>
                </body>
                </html>
            `
        }],
        ["react", function(content) {
            if(!content) return `<!DOCTYPE html><html><head>${ this.appendHeaders() }</head></html>`;
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    ${ this.appendHeaders() }
                    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
                    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
                    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                </head>
                <body>
                    <div id="root"></div>
                    ${ this.#entry ? `<script>globalThis.ENTRY = "${this.#entry}"</script>` : '<!-- NOENTRY -->'}
                    ${ this.#entryfile ? `<script>globalThis.ENTRYFILE = "${this.#entryfile}"</script>` : '<!-- NOENTRYFILE -->'}
                    <script>
                        ${content};
                    </script>
                    <script type="text/babel" src="/assets/components/code-preview-frame.jsx"></script>
                </body>
                </html>
            `
        }]
    ]);

    #connected = false;
    #id = generateRandomString(10);
    #activeWrapperName = "plain";
    #activeWrapper = CodePreview.srcWrappers.get(this.#activeWrapperName);
    #rawContentStr = '';



    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: flex; }
                iframe { flex: 1; }
            </style>
            <iframe frameborder="0" allowtransparency="true" style="color-scheme: normal"></iframe>
        `
        this.iframe = this.shadowRoot.querySelector("iframe");
    }

    

    attributeChangedCallback(property, oldValue, newValue) {
        if(property=="srcdoc") {
            this.setSrcDoc(newValue);
        }
        if(property=="wrapper") {
            this.activeWrapper = newValue;
        }
        if(property=="id") {
            this.#id = newValue;
            //this.setSrcDoc(newValue);
        }
        if(property=="entry") {
            this.#entry = newValue;
        }
        if(property=="entryfile") {
            this.#entryfile = newValue;
            //this.setSrcDoc();
        }
        
    }

    connectedCallback() {
        this.#connected = true;
        this.setSrcDoc();
    }

    setSrcWrapper(name, func) {
        CodePreview.srcWrappers.set(name, func);
    }

    setSrcDoc(content) {
        if(this.#connected) {
            this.#rawContentStr = content || this.getAttribute("srcdoc") || this.getInnerContent();
            const renderedContent = this.#activeWrapper.call(this, this.#rawContentStr);
            this.iframe.srcdoc = renderedContent;
        }
    }

    getInnerContent() {
        let result = '';
        for(const childElement of this.childNodes) {
            if(childElement.nodeName == "#text") {
                result += childElement.textContent;
            } else if(childElement.nodeName == "TEMPLATE") {
                result += childElement.innerHTML;
            } else {
                result += childElement.outerHTML;
            }
        }
        return result;
    }

    appendHeaders() {
        return (`
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta name="color-scheme" content="dark light">
            <style>body, html { background-color: transparent; color: light-dark(black,white); }</style>
        `)
    }

    appendConsoleShim() { 
        return (`
            <script>
                (() => {
                    const post = (type, payload) => parent.postMessage({ __from: '${this.#id}', type, payload }, '*');
                    const wrap = (fn, type) => (...args) => { try { post(type, args.map(a => { try { return JSON.stringify(a); } catch { return String(a); } })); } catch {} fn.apply(console, args); };
                    console.log = wrap(console.log, 'log');
                    console.info = wrap(console.info, 'info');
                    console.warn = wrap(console.warn, 'warn');
                    console.error = wrap(console.error, 'error');
                    window.addEventListener('error', e => post('error', [String(e.message || e.error || 'Error')]));
                    window.addEventListener('unhandledrejection', e => post('error', [String(e.reason || 'Unhandled promise rejection')]));
                })();   
            <`+`/script>
        `); 
    }



    set activeWrapper(wrapperName) {
        const newWrapper = CodePreview.srcWrappers.get(wrapperName);
        if(newWrapper) {
            this.#activeWrapperName = wrapperName;
            this.#activeWrapper = CodePreview.srcWrappers.get(this.#activeWrapperName);
            this.setSrcDoc();
        } else {
            console.warn("Can't set wrapper", wrapperName, " (not found)");
        }
    }

    set entry(entry) { this.setAttribute("entry", entry); }
    get entry() { return this.#entry; }

    set entryfile(entryfile) { this.setAttribute("entryfile", entryfile); }
    get entryfile() { return this.#entryfile; }


}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

customElements.define('code-preview', CodePreview);