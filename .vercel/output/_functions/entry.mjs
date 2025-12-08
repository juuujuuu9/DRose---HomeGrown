import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_Cwd3nt31.mjs';
import { manifest } from './manifest_DvTQheq3.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin.astro.mjs');
const _page2 = () => import('./pages/api/admin/entries/export.astro.mjs');
const _page3 = () => import('./pages/api/admin/entries/export-non-players.astro.mjs');
const _page4 = () => import('./pages/api/admin/entries/_id_.astro.mjs');
const _page5 = () => import('./pages/api/admin/entries.astro.mjs');
const _page6 = () => import('./pages/api/admin/non-player-entries.astro.mjs');
const _page7 = () => import('./pages/api/debug-auth.astro.mjs');
const _page8 = () => import('./pages/api/login.astro.mjs');
const _page9 = () => import('./pages/api/logout.astro.mjs');
const _page10 = () => import('./pages/api/non-player-signup.astro.mjs');
const _page11 = () => import('./pages/api/signup.astro.mjs');
const _page12 = () => import('./pages/login.astro.mjs');
const _page13 = () => import('./pages/non-players/rsvp.astro.mjs');
const _page14 = () => import('./pages/non-players/success.astro.mjs');
const _page15 = () => import('./pages/non-players.astro.mjs');
const _page16 = () => import('./pages/players/rsvp.astro.mjs');
const _page17 = () => import('./pages/players/success.astro.mjs');
const _page18 = () => import('./pages/players.astro.mjs');
const _page19 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin.astro", _page1],
    ["src/pages/api/admin/entries/export.ts", _page2],
    ["src/pages/api/admin/entries/export-non-players.ts", _page3],
    ["src/pages/api/admin/entries/[id].ts", _page4],
    ["src/pages/api/admin/entries.ts", _page5],
    ["src/pages/api/admin/non-player-entries.ts", _page6],
    ["src/pages/api/debug-auth.ts", _page7],
    ["src/pages/api/login.ts", _page8],
    ["src/pages/api/logout.ts", _page9],
    ["src/pages/api/non-player-signup.ts", _page10],
    ["src/pages/api/signup.ts", _page11],
    ["src/pages/login.astro", _page12],
    ["src/pages/non-players/rsvp.astro", _page13],
    ["src/pages/non-players/success.astro", _page14],
    ["src/pages/non-players.astro", _page15],
    ["src/pages/players/rsvp.astro", _page16],
    ["src/pages/players/success.astro", _page17],
    ["src/pages/players/index.astro", _page18],
    ["src/pages/index.astro", _page19]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "9d750dc0-ce4c-400d-a36d-71ff9bda3086",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
