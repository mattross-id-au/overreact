customElements.define('vanilla-layout', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/global.css" />
            <style>:host { display:none } /* prevents FOUC */ </style>
            <link rel="stylesheet" href="/assets/components/vanilla-layout.css" />
            

            <div class="layout-grid">

                <label for="menu-toggle">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20" viewBox="0 0 72 72">
                        <style> path { fill: light-dark(black,white) } </style>
                        <path d="M56 48c2.209 0 4 1.791 4 4 0 2.209-1.791 4-4 4-1.202 0-38.798 0-40 0-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4C17.202 48 54.798 48 56 48zM56 32c2.209 0 4 1.791 4 4 0 2.209-1.791 4-4 4-1.202 0-38.798 0-40 0-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4C17.202 32 54.798 32 56 32zM56 16c2.209 0 4 1.791 4 4 0 2.209-1.791 4-4 4-1.202 0-38.798 0-40 0-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4C17.202 16 54.798 16 56 16z"></path>
                    </svg>
                    Menu
                </label>

                <input type="checkbox" id="menu-toggle" name="menu-toggle" checked="false" />
                <div class="left">

                    

                    <div class="sticky">
                        <header>
                            <p>Overreact</p>
                        </header>

                        <slot name="left-nav">

                            
                            <div class="nav-section-title">GET STARTED</div>
                            
                            
                            
                            <div class="link-group">
                                <div class="link-group-parent">
                                    <nav-chevron></nav-chevron>
                                    <a href="/react.dev/learn/">Quick Start</a>
                                </div>
                                <div class="link-group-children">
                                    <a href="/react.dev/learn/tutorial-tic-tac-toe/">Tutorial: Tic-Tac-Toe</a>
                                    <a href="/react.dev/learn/thinking-in-react/">Thinking in React</a>
                                </div>
                            </div>


                            <div class="link-group">
                                <div class="link-group-parent">
                                    <nav-chevron></nav-chevron>
                                    <a href="/react.dev/learn/installation/">Installation</a>
                                </div>
                            </div>

                            <div style="height: 1px; overflow:hidden; border-bottom: 1px solid var(--border-color)">&nbsp;</div>
                            <div class="nav-section-title">Learn React</div>

                            <div class="link-group">
                                <div class="link-group-parent">
                                    <nav-chevron></nav-chevron>
                                    <a href="/react.dev/learn/describing-the-ui/">Describing the UI</a>
                                </div>
                                <div class="link-group-children">
                                    <a href="/react.dev/learn/your-first-component/">Your First Component</a>
                                    <a href="/react.dev/importing-and-exporting-components/">Importing and Exporting Components</a>
                                </div>
                            </div>
                        </slot>
                    </div>
                </div>
                <div class="main">
                    <slot name="main"></slot>
                </div>
            </div>
        `;

        const path = new URL(document.location.href).pathname;
        for(const linkElement of this.shadowRoot.querySelectorAll("a[href]")) {
            const thisPath = new URL(linkElement.href).pathname;
            if(thisPath === path) {
                linkElement.setAttribute("active","true");
                linkElement.closest(".link-group").setAttribute("active","true");
            }
        }

        document.body.addEventListener('click', (event) => {
            if(event.target !== this) {
                this.shadowRoot.getElementById('menu-toggle').checked = true;
            }
        })

    }
});



customElements.define('nav-chevron', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <div class="chevron">
                <svg width="100%" height="100%" viewBox="0 0 100 100" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
                    <g transform="matrix(-1.25665,1.25665,-1.13409,-1.13409,151.524,53.9897)">
                        <path d="M19.245,32.734C19.245,28.217 22.554,24.55 26.63,24.55L51.248,24.55C55.324,24.55 58.633,28.217 58.633,32.734C58.633,37.25 55.324,40.917 51.248,40.917L41.401,40.917C37.325,40.917 34.015,44.584 34.015,49.101L34.015,60.012C34.015,64.529 30.706,68.195 26.63,68.195C22.554,68.195 19.245,64.529 19.245,60.012L19.245,32.734Z" style="fill:rgb(255,255,255);"></path>
                    </g>
                </svg>
            </div>
        `;
    }
})