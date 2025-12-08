/* empty css                                 */
import { e as createComponent, f as createAstro } from '../chunks/astro/server_CujPIBlR.mjs';
import 'piccolore';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return Astro2.redirect("/players/rsvp", 301);
}, "/Users/user/Development/Drose - HomeGrown/src/pages/players/index.astro", void 0);

const $$file = "/Users/user/Development/Drose - HomeGrown/src/pages/players/index.astro";
const $$url = "/players";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
