const hljsScript = document.createElement('script');
hljsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js';


const hljsStyle = document.createElement('link');
hljsStyle.rel = 'stylesheet';
hljsStyle.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/atom-one-dark.css';

hljsScript.addEventListener('load', ()=>{
    customElements.define('remote-code-block', class extends HTMLElement {
        connectedCallback() {
            //this.shadow = this.attachShadow({ mode: "open" });

            const url = this.getAttribute("src");
            const lang = this.getAttribute("lang");
            if(url) {
                fetch(url)
                    .then(response=>response.text())
                    .then(text=>{
                        text = hljs.highlight(text,{ language: lang }).value;
                        this.innerHTML = `
                            <pre><code class="hljs">${text}</code></pre>
                        `;
                    });
            }
        }
    });


    hljs.highlightAll();
});

document.head.appendChild(hljsScript);
document.head.appendChild(hljsStyle);
