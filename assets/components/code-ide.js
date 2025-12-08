let html = String.raw;
class CodeIDE extends HTMLElement {
    #activeContext;
    #contextObserver;
    #ideLayoutElement;
    #delPreviewElement;
    #insPreviewElement;
    #connected = false;

    constructor() {
        super();

        this.slottedObservers = new Map();
        this.slottedRunners = new Map();
        this.tabs = new Map();
        this.selectedTab = null;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = html`
            <link rel="stylesheet" href="/global.css" />
            <style>
                .ide-layout {
                    display: grid;
                    grid-template-columns: 50% 50%;
                    /* grid-template-rows: auto 1fr 1fr; */
                    grid-template-rows: auto 30vh 30vh;
                    grid-template-areas:
                        "tabs tabs"
                        "code-del preview-del"
                        "code-ins preview-ins";
                    gap: 0px;
                }

                .tabs { grid-area: tabs; padding: 0 2rem; }
                button[role="tab"] {
                    display: inline-block;
                    cursor: pointer;
                    padding: 0.5rem 1rem; 
                    margin: 0 -1px 0 0;
                    font-family: var(--body-font);
                    font-size: 0.9rem;
                    color: var(--text-color-strong);
                    background: var(--highlight-background);
                    
                    border: 1px solid var(--border-color); 
                    border-bottom: 2px solid transparent;
                }
                button[role="tab"] > * { padding-left: 0.3rem; padding-right: 0.3rem; }
                button[role="tab"]:first-child { border-top-left-radius: 8px; }
                button[role="tab"]:last-child { border-top-right-radius: 8px; }
                button[role="tab"].selected {
                    border-top: 2px solid var(--highlight-background-color);
                }
                button[role="tab"]:not(.selected) {                
                    background-color: light-dark(
                        oklch(0.98 0.02 202.01 / 1),
                        oklch(0.22 0.03 254.77 / 1) 
                    );
                }
                .code-del, .code-ins {
                    background: var(--highlight-background);
                    border-top-left-radius: var(--border-radius); 
                    border-bottom-left-radius: var(--border-radius); 
                }
                .code-del { 
                    grid-area: code-del;
                    display: flex;

                }
                .code-ins { 
                    grid-area: code-ins; display: flex;  
                }
                .code-full { 
                    grid-row-start: code-del;
                    grid-row-end: code-ins;
                    grid-column-start: code-del;
                    grid-column-end: code-ins;
                    display: flex;
                }
                
                code-preview { 
                    flex-grow: 1; 
                    margin: 0; 
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                    border-top-right-radius: var(--border-radius); 
                    border-bottom-right-radius: var(--border-radius);
                    border-left: 1px solid var(--border-color);
                }
                code-preview.preview-del { grid-area: preview-del; }
                code-preview.preview-ins { grid-area: preview-ins; }
                [data-diff=diff] { 
                    /* .code-del { border-left: 2px solid #f28779;} */
                    /* .code-ins { border-left: 2px solid #bae67e; } */
                    .code-del, code-preview.preview-del { border-bottom: 1px solid var(--border-color); margin-bottom: 3px; } 
                    .code-ins, code-preview.preview-ins { border-top: 1px solid var(--border-color); } 
                }
                [data-diff=wc] { 
                    grid-template-rows: auto auto 50vh;
                    .code-del { grid-area: none; display: none; }
                    code-preview.preview-del { grid-area: none; display: none; }
                }
                [data-diff=react] {
                    grid-template-rows: auto 50vh auto;
                    .code-ins { grid-area: none; display: none; }
                    code-preview.preview-ins { grid-area: none; display: none; }
                }
            </style>
            <div class="ide-layout">
                <div class="tabs" role="tablist" aria-label="Select source code file"></div>
                <div class="code-del">
                    <slot name="del"></slot>
                </div>
                <div class="code-ins">
                    <slot name="ins"></slot>
                </div>
                <div class="code-full">
                    <slot name="full"></slot>
                </div>
                <code-preview class="preview-del" wrapper="react"></code-preview>
                <code-preview class="preview-ins" wrapper="react"></code-preview>
            </div>
        `;

        this.#ideLayoutElement = this.shadowRoot.querySelector(".ide-layout");
        this.#delPreviewElement = this.shadowRoot.querySelector("code-preview[class='preview-del']");
        this.#insPreviewElement = this.shadowRoot.querySelector("code-preview[class='preview-ins']");

        for(const slot of this.shadowRoot.querySelectorAll('slot')) {
            slot.addEventListener('slotchange', (slotchangeEvent) => {
                this.#handleSlotChange();
                this.#updateTabs();
            })
        }
    }

    connectedCallback() {
        this.#connected = true;
        this.#contextObserver = this.#contextObserver || new MutationObserver((mutationList, observer) => {
            for(const mutationRecord of mutationList) {
                if(mutationRecord.type === "attributes" && mutationRecord.attributeName == "data-diff") {
                    this.#handleContextChange();
                }
            }
        });
        this.#contextObserver.observe(document.documentElement, { childList: false, attributes: true, subtree: false });
        this.#handleContextChange();
    }

    disconnectedCallback() {
        this.#contextObserver.disconnect();
    }

    #handleContextChange() {
        this.#activeContext = document.documentElement.getAttribute("data-diff");
        this.#ideLayoutElement.setAttribute("data-diff", this.#activeContext);
    }

    #handleSlotChange() {
        for(const slotElement of this.shadowRoot.querySelectorAll('slot')) {
            for(const childElement of slotElement.assignedElements()) {
                if(!this.slottedObservers.has(childElement)) {
                    const observer = new MutationObserver((mutationList) => {
                        const changedAttributes = mutationList.map((mutation) => mutation.attributeName);
                        if(changedAttributes.some(attr => ['label','tab','slot'].includes(attr))) {
                            this.#updateTabs();
                        }
                        
                    });
                    observer.observe(childElement, { childList: false, attributes: true, subtree: false });
                    this.slottedObservers.set(childElement, observer);
                }

                if(!this.slottedRunners.has(childElement)) {
                    const slotName = childElement.getAttribute("slot");
                    const runFunc = this.#run.bind(this, slotName);
                    this.slottedRunners.set(childElement, runFunc);
                    childElement.addEventListener('change',runFunc);
                }   
            }
        }
    }

    #updateTabs() {
        if(this.#connected !== true) return;

        let firstTab = null;

        for(const [key, tabData] of this.tabs) {
            tabData.remove = true;
        }
        
        // Building tab data and button elements
        for(const slotElement of this.shadowRoot.querySelectorAll('slot')) {   
            let previousTab = null;

            for(const panelElement of slotElement.assignedElements()) {
                const tabLabel = panelElement.getAttribute("tab");
                const tabId = panelElement.getAttribute("tabid") || tabLabel;
                const slotName = panelElement.getAttribute("slot");
                const panelEntry = panelElement.getAttribute("entry");

                let tabData = this.tabs.get(tabId) || {};
                this.tabs.set(tabId, tabData);
                tabData.remove = false;
                tabData.name = tabId;

                tabData.panels = tabData.panels || new Map();
                const panelData = tabData.panels.get(panelElement) || {}
                panelData.label = tabLabel;
                panelData.slot = slotName;
                panelData.element = panelElement;
                panelData.tab = tabData;
                panelData.entry = panelEntry;
                tabData.panels.set(panelElement, panelData);

                if(!tabData.buttonElement) {
                    tabData.buttonElement = document.createElement("button");
                    tabData.buttonElement.setAttribute("role","tab");
                    tabData.buttonElement.addEventListener("click", this.selectTab.bind(this, tabData.name));
                }

                
                let labelElementType = panelData.slot == "ins" ? "ins" : panelData.slot == "del" ? "del" : "span";
                let labelElement = tabData.buttonElement.querySelector(labelElementType);
                if(!labelElement) {
                    labelElement = document.createElement(labelElementType);
                    tabData.buttonElement.appendChild(labelElement);
                }
                labelElement.textContent = tabLabel;

                // Updating entry and entryfile on <code-preview>
                if(panelEntry !== null) {
                    if(labelElementType == "del") {
                        this.#delPreviewElement.entry = panelEntry;
                        this.#delPreviewElement.entryfile = tabLabel;
                    }
                    if(labelElementType == "ins") {
                        this.#insPreviewElement.entry = panelEntry;
                        this.#insPreviewElement.entryfile = tabLabel;
                    }
                }
                firstTab ??= tabData;
                tabData.previousTab = previousTab;
                previousTab = tabData;
            }
        }

        // Updating DOM
        const tabsContainerElement = this.shadowRoot.querySelector(".tabs");
        for(const [key, tabData] of this.tabs) {
            if(tabData.remove) {
                tabData.buttonElement.remove();
            }
            if(!tabData.buttonElement.parentElement) {
                if(!tabData.previousTab) {
                    tabsContainerElement.append(tabData.buttonElement);
                } else {
                    tabData.previousTab.buttonElement.after(tabData.buttonElement);
                }
            }
        }

        if(!this.selectedTab && this.#connected == true) {
            setTimeout(()=>{
                this.selectTab(firstTab.name);
            },300);
        }


        this.#run();
    }

    selectTab(tabId) {
        //const tabData = this.tabs.get("tabData");
        //if(!tabData) { throw `No tab with name '${tabId}'`; }

        for(const [tabKey, tabData] of this.tabs) {
            for(const [panelElement, panelData] of tabData.panels) {
                if(tabData.name === tabId) {
                    panelElement.style.display = "flex";
                } else {
                    panelElement.style.display = "none";
                }
            }
            if(tabData.name === tabId) {
                tabData.buttonElement.classList.add("selected");
                this.selectedTab = tabData;
            } else {
                tabData.buttonElement.classList.remove("selected");
            }
        }
        this.selectedTab = tabId;
    }

    #runNow = (slotName) => {
        slotName ??= 'full';
        if(slotName == 'full') {
            this.#runNow('del');
            this.#runNow('ins');
            return;
        }

        const sourceFiles = [];
        let entryContent = '';
        let entryPanel = null
        
        for(const [tabKey, tabData] of this.tabs) {
            for(const [panelElement, panelData] of tabData.panels) {
                if(panelData.slot == slotName || panelData.slot == "full") {
                    sourceFiles.push(panelData);
                    if(panelData.entry !== null) {
                        entryPanel = panelData;
                        entryContent = panelData.entry;
                    }
                }
            }
        }

        const code = sourceFiles.reduce((previous,panelData) => {
            return previous + `
                "${panelData.label}": \`
                    ${
                        panelData.element.value
                            .replaceAll('${','$\\{')
                            .replaceAll('`','\\`')
                    }
                \`,
            `;
        },'globalThis.FILES = {')+'}';

        if(slotName == "del") {
            this.#delPreviewElement.setSrcDoc(code);
        } else if(slotName == "ins") {
            this.#insPreviewElement.setSrcDoc(code);
        }
    }

    #run = this.#debounce(this.#runNow, 500);

    #debounce(fn, delay) {
        let timeoutId;

        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(()=>{
                fn.apply(this, args);
            }, delay)
        };
    }

    



}

customElements.define('code-ide', CodeIDE);