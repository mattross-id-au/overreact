class ResizablePanelGroup extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                p { background-color: green; }
                resizable-panel-group, :host {
                    --resizable-border-color: transparent;
                    --resizable-border-width: 0px;
                    --resizable-handle-color: var(--border-color);
                    
                    --resizable-handle-visible-size: 1px; /*var(--resizable-border-width);*/
                    --resizable-handle-grabbable-size: 10px;

                    flex: 1;
                    display: flex;
                    /* flex-direction: column; */
                    border: var(--resizable-border-width) solid var(--resizable-border-color);


                    &[direction=vertical], :host(&[direction=vertical]) {
                        flex-direction: column;

                        resizable-panel, ::slotted(resizable-panel) {
                            overflow-y: auto;
                        }

                        > resizable-handle, > ::slotted(resizable-handle) {
                            min-height: var(--resizable-handle-grabbable-size); 
                            cursor: ns-resize;
                            --handle-orient: vertical;
                            --handle-border-top: var(--resizable-handle-visible-size) solid var(--resizable-handle-color);
                            --handle-border-left: 0;
                            --handle-inset: 4px 25px 4px 25px;
                            margin-top: -4px;
                            margin-bottom: -4px;
                        }
                    }


                    &[direction=horizontal], :host(&[direction=horizontal]) {
                        flex-direction: row;

                        resizable-panel, ::slotted(resizable-panel) {
                            overflow-x: auto;
                        }

                        > resizable-handle, > ::slotted(resizable-handle) {
                            min-width: var(--resizable-handle-grabbable-size);
                            cursor: ew-resize;
                            --handle-orient: horizontal;
                            --handle-border-top: 0; 
                            --handle-border-left: var(--resizable-handle-visible-size) solid var(--resizable-handle-color);
                            --handle-inset: 25px 4px 25px 4px;
                            margin-left: -4px;
                            margin-right: -4px;
                        }
                    }
                }
            </style>
            <slot></slot>
        `
    }
}

class ResizablePanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                resizable-panel, :host {
                    flex: 1;
                    box-sizing: border-box;
                }

                /* Nesting a panel-group inside a panel */
                :host:has(::slotted(resizable-panel-group)) {
                    display: flex;
                }

                :host:has-slotted(resizable-panel-group) {
                    display: flex;
                }
            </style>
            <slot></slot>
        `
    }
}

class ResizableHandle extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                resizable-handle, :host {
                    position: relative;
                    &::after {
                        content: " ";
                        position: absolute;
                        border-left: var(--handle-border-left);
                        border-top: var(--handle-border-top);
                        border-left-color: transparent;
                        border-top-color: transparent;
                        inset: var(--handle-inset);
                    }
                }
                :host(:hover) {
                    &::after {
                        border-left: var(--handle-border-left);
                        border-top: var(--handle-border-top);
                    }
                }
            </style>    
        `;
    }

    connectedCallback() {
        const handleElement = this;
        let windowElement = handleElement.closest("resizable-panel-group");
        let previousPanelElement = handleElement.previousElementSibling;
        let nextPanelElement = handleElement.nextElementSibling;
        let allPanels = handleElement.parentElement.querySelectorAll("resizable-panel");
        let direction = windowElement.getAttribute("direction") == "vertical" ? "vertical" : "horizontal";
        let minPanelSize = 50;
        let usableStart = null;
        let usableEnd = null;
        let usableSpace = null;

        function resizeMouseMoveHandler(event) {
            const windowRect = windowElement.getBoundingClientRect();
            const handleRect = handleElement.getBoundingClientRect();
            const previousRect = previousPanelElement.getBoundingClientRect();
            const nextRect = nextPanelElement.getBoundingClientRect();

            if(direction == "horizontal") {
                //var handleLocation = handleRect.x + (handleRect.width/2);
                var mousePosition = event.clientX;
                //var handleSpace = handleRect.width;
                var handleSpace = 1;
                var cssSpace = "width";
            } else if(direction == "vertical") {
                //var handleLocation = handleRect.y + (handleRect.height/2);
                var mousePosition = event.clientY;
                //var handleSpace = handleRect.height;
                var handleSpace = 1;
                var cssSpace = "height";
            }

            let newPreviousElementSpace = mousePosition - usableStart - (handleSpace/2);
            let newNextElementSpace = usableSpace - newPreviousElementSpace - handleSpace;
            if(newPreviousElementSpace < minPanelSize) {
                const diff = minPanelSize - newPreviousElementSpace;
                newPreviousElementSpace = minPanelSize;
                newNextElementSpace -= diff;
            }
            if(newNextElementSpace < minPanelSize) {
                const diff = minPanelSize - newNextElementSpace;
                newNextElementSpace = minPanelSize;
                newPreviousElementSpace -= diff;
            }
            //newPreviousElementSpace = (newPreviousElementSpace > 50) ? newPreviousElementSpace : 50;
                    
            if(newPreviousElementSpace + handleSpace + newNextElementSpace > usableSpace) {
                console.log('space warning', newPreviousElementSpace + handleSpace + newNextElementSpace, usableSpace);
            }

            previousPanelElement.style.flex = 'none';
            previousPanelElement.style[cssSpace] = newPreviousElementSpace + 'px';
            nextPanelElement.style.flex = 'none';
            nextPanelElement.style[cssSpace] = newNextElementSpace + 'px';
        }

        handleElement.addEventListener('mousedown', (event) => {
            // Getting all the DOM elements on MouseDown so we're not pulling from DOM for every pixel shift
            windowElement = handleElement.closest("resizable-panel-group");
            previousPanelElement = handleElement.previousElementSibling;
            nextPanelElement = handleElement.nextElementSibling;
            allPanels = handleElement.parentElement.querySelectorAll("resizable-panel");

            // Calculating that things that don't change per pixel shift before starting the listener
            direction = windowElement.getAttribute("direction") == "vertical" ? "vertical" : "horizontal";
            minPanelSize = windowElement.getAttribute("min-panel") !== null ? parseInt(windowElement.getAttribute("min-panel")) : 50;

            const previousRect = previousPanelElement.getBoundingClientRect();
            const nextRect = nextPanelElement.getBoundingClientRect();
            if(direction == "horizontal") {
                usableStart = previousRect.left;
                usableEnd = nextRect.right;
            } else if(direction == "vertical") {
                usableStart = previousRect.top;
                usableEnd = nextRect.bottom;
            }
            usableSpace = usableEnd - usableStart;

            // Start watching for movement changes
            windowElement.style.userSelect = 'none';
            windowElement.addEventListener('mousemove', resizeMouseMoveHandler);
        })

        windowElement.addEventListener('mouseup', (event) => {
            windowElement.style.userSelect = 'auto';
            windowElement.removeEventListener('mousemove', resizeMouseMoveHandler);
        });
    }
}

customElements.define('resizable-panel-group', ResizablePanelGroup); 
customElements.define('resizable-panel', ResizablePanel);
customElements.define('resizable-handle', ResizableHandle);