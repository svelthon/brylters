// Python run for a test's own values, on the engine Bryntime starts, compiled by
// Brython's own compiler: each name the module binds, as Python holds it.
import 'bryntime';
import 'bryvend/compiler';

let runs = 0;

export const python = (source) => {
    const $B = globalThis.__BRYTHON__;

    // The engine names a script by the page's address, which Node has not.
    globalThis.location ??= new URL('file:///');

    const module = $B.runPythonSource(source, { id: `test_module_${++runs}` });

    return (name) => $B.$getattr(module, name);
};
