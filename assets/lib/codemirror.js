
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.css" />
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/theme/monokai.min.css" />
// <div id="editor"></div>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.js"></script>
// <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/javascript/javascript.min.js"></script>

// <script>
//   const editor = CodeMirror(document.getElementById('editor'), {
//     value: `function hello(){ return 42 }`,
//     mode: 'javascript',
//     theme: 'monokai',
//     lineNumbers: true
//   });
// </script>

const CodeMirror = await new Promise(async (resolve, reject) => {
    const cmp = scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.js');
    const jsp = scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/javascript/javascript.min.js');
    const htmlp = scriptPromise('https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/mode/html/html.min.js');

    const cms = stylePromise("https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/codemirror.min.css");
    const monokais = stylePromise("https://cdnjs.cloudflare.com/ajax/libs/codemirror/6.65.7/theme/monokai.min.css");

    await Promise.all([cmp,jsp,htmlp]).then(() => {
        
        resolve(globalThis.CodeMirror);
    });
});

function scriptPromise(url) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = url;
        s.addEventListener('load', ()=>{
            resolve();
        });
        document.body.appendChild(s);
    })
}

function stylePromise(url) {
    return new Promise((resolve, reject) => {
        const s = document.createElement('style');
        s.rel = "stylesheet";
        s.href = url;
        s.addEventListener('load', ()=>{
            resolve();
        });
        document.body.appendChild(s);
    })
}

//==export { CodeMirror }