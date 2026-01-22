// -------------------------------------------------------------------
// 2. Tiny module system using Babel + CommonJS transform
// -------------------------------------------------------------------
const FILES = globalThis.FILES || {};
const ENTRY = globalThis.ENTRY || null;
const ENTRYFILE = globalThis.ENTRYFILE || null;
const moduleCache = {};

function resolvePath(from, spec) {
    // Very naive resolver: handles only "./Foo.jsx" and "../" a bit
    if (spec.startsWith("./") || spec.startsWith("../")) {
        const fromParts = from.split("/");
        fromParts.pop(); // remove current file name
        const specParts = spec.split("/");

        for (const part of specParts) {
            if (part === "." || part === "") continue;
            if (part === "..") fromParts.pop();
            else fromParts.push(part);
        }
        return fromParts.join("/");
    }
    // Bare specifiers could map to something else if you want
    return spec;
}

// Try to find a file in FILES by probing various extensions
function resolveWithExtensions(baseId) {
    // If user actually provided an exact key, use it.
    if (Object.prototype.hasOwnProperty.call(FILES, baseId)) {
        return baseId;
    }

    const candidates = [
        baseId + ".jsx",
        baseId + ".js",
        baseId + "/index.jsx",
        baseId + "/index.js",
    ];

    for (const cand of candidates) {
        if (Object.prototype.hasOwnProperty.call(FILES, cand)) {
            return cand;
        }
    }
    return null;
}

function loadModule(id) {
    if (moduleCache[id]) return moduleCache[id].exports;

    let code = FILES[id];
    if (code == null) {
        if(Object.keys(FILES).length > 0) {
            throw new Error("Module not found: " + id);
        } else {
            code = '';
        }
    }

    code = code
        .replaceAll("import * as React from 'react'","//import * as React from 'react'")
        .replaceAll("import { useState } from 'react'","const useState = React.useState; //import { useState } from 'react'")

    const compiled = Babel.transform(code, {
        presets: ["react"],
        plugins: ["transform-modules-commonjs"],
        sourceType: "module",
    }).code;

    const module = { exports: {} };
    moduleCache[id] = module; // cache *before* executing to support cycles

    function localRequire(specifier) {
        const resolvedId = resolvePath(id, specifier);
        const finalId = resolveWithExtensions(resolvedId);  // e.g. "FancyText.jsx"
        return loadModule(finalId);
    }

    const fn = new Function("require", "exports", "module", compiled);
    fn(localRequire, module.exports, module);

    return module.exports;
}

// -------------------------------------------------------------------
// 3. Run the entry file and mount React
// -------------------------------------------------------------------
const root = ReactDOM.createRoot(document.getElementById("root"));

try {
    const appModule = loadModule(ENTRYFILE);
    const App = appModule.default || appModule.App; // teach both patterns if you want
    if(App) {
        root.render(<App />);
    } else {
        let entryElement = document.createElement(ENTRY);
        document.body.append(entryElement);
    }
} catch (err) {
    console.error(err);
    root.render(
        <pre style={{ color: "red", whiteSpace: "pre-wrap" }}>
            {String(err.stack || err)}
        </pre>
    );
}