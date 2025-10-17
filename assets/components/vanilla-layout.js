customElements.define('vanilla-layout', class extends HTMLElement {
    connectedCallback() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="/global.css" />
            <style>
                .vl {
                    display: grid;
                    grid-template-columns: 300px auto;
                }
                .left {
                    border-right: 1px solid var(--border-color);
                }

                header {
                    border-bottom: 1px solid var(--border-color);
                    padding-left: var(--content-padding);
                    padding-right: var(--content-padding);
                }

                p {
                    font-size: 200%;
                    font-weight: 900;
                    letter-spacing: 1.9;
                    text-transform: uppercase;
                }

                .nav-section-title {
                    text-transform: uppercase;
                    font-size: 75%;
                    font-weight: 800;
                    color: var(--text-section-heading);
                    padding-left: var(--content-padding);
                    padding-right: var(--content-padding);
                    margin-top: var(--content-padding);
                    margin-bottom: var(--content-padding);

                }

                a {
                    display: block;
                    font-size: 90%;
                    color: var(--text-color-strong);
                    text-decoration: none;
                    padding-left: var(--content-padding);
                    padding-right: var(--content-padding);
                    margin-top: var(--content-padding);
                    margin-bottom: var(--content-padding);
                }


            </style>
            <header>
                <p>For the love of Vanilla</p>
            </header>
            <div class="vl">
                <div class="left">
                    <slot name="left-nav">
                        <div class="nav-section-title">GET STARTED</div>
                        <a href="/react.dev/learn/">Quick Start</a>
                        <a href="/react.dev/learn/">Tutorial: Tic-Tac-Toe</a>
                        <a href="/react.dev/learn/">Thinking in React</a>
                    </slot>
                </div>
                <div class="main">
                    <slot name="main"></slot>
                </div>
            </div>
        `
    }
})