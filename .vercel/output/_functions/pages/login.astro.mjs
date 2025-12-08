/* empty css                                 */
import { e as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from '../chunks/astro/server_CujPIBlR.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_CCEfJV9Y.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const imgRsvpPagePlayersOnlyFormOpt2 = "https://www.figma.com/api/mcp/asset/5b27b049-97da-418a-9e48-90dccbb0d4e4";
  const imgRsvpPagePlayersOnlyFormOpt3 = "https://www.figma.com/api/mcp/asset/b61944d2-0df1-4e37-95e1-42b45a13e9fa";
  const imgRsvpPagePlayersOnlyFormMobile = "https://www.figma.com/api/mcp/asset/b53e319b-a7bb-4131-b717-1b5005bc5e65";
  const imgRsvpPagePlayersOnlyFormMobile1 = "https://www.figma.com/api/mcp/asset/cec3d09d-efa4-48f2-b208-83b3f6fb2210";
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Admin Login", "data-astro-cid-sgpqyurt": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen bg-black relative overflow-hidden" data-astro-cid-sgpqyurt> <!-- Background Images - Desktop --> <div aria-hidden="true" class="hidden lg:block absolute inset-0 pointer-events-none" data-astro-cid-sgpqyurt> <div class="absolute bg-black inset-0" data-astro-cid-sgpqyurt></div> <img alt="" class="absolute max-w-none object-cover size-full opacity-50"${addAttribute(imgRsvpPagePlayersOnlyFormOpt2, "src")} data-astro-cid-sgpqyurt> <img alt="" class="absolute max-w-none object-cover size-full opacity-50"${addAttribute(imgRsvpPagePlayersOnlyFormOpt3, "src")} data-astro-cid-sgpqyurt> </div> <!-- Background Images - Mobile --> <div aria-hidden="true" class="lg:hidden absolute inset-0 pointer-events-none" data-astro-cid-sgpqyurt> <div class="absolute bg-black inset-0" data-astro-cid-sgpqyurt></div> <img alt="" class="absolute max-w-none object-cover size-full opacity-50"${addAttribute(imgRsvpPagePlayersOnlyFormMobile, "src")} data-astro-cid-sgpqyurt> <img alt="" class="absolute max-w-none object-cover size-full opacity-50"${addAttribute(imgRsvpPagePlayersOnlyFormMobile1, "src")} data-astro-cid-sgpqyurt> </div> <!-- Main Content --> <div class="relative z-10 flex items-center justify-center py-12 px-4 min-h-screen animate-fade-in" data-astro-cid-sgpqyurt> <div class="max-w-md w-full p-8" data-astro-cid-sgpqyurt> <h1 class="font-prohibition text-3xl text-center mb-8 text-[#ce1141] uppercase tracking-wider" data-astro-cid-sgpqyurt>
Admin Login
</h1> <form id="login-form" class="space-y-6" data-astro-cid-sgpqyurt> <div data-astro-cid-sgpqyurt> <label for="username" class="block font-roboto-condensed text-sm font-bold text-white mb-2 uppercase" data-astro-cid-sgpqyurt>
Username
</label> <div class="bg-[#212121] border border-[rgba(255,255,255,0.5)] border-solid flex flex-col items-center overflow-clip px-4 py-3 rounded-[4px]" data-astro-cid-sgpqyurt> <input type="text" id="username" name="username" required class="w-full bg-transparent border-0 outline-0 font-roboto-condensed font-normal leading-normal text-[15px] text-white placeholder:text-[rgba(255,255,255,0.5)] focus:ring-0" placeholder="Username" autocomplete="username" data-astro-cid-sgpqyurt> </div> </div> <div data-astro-cid-sgpqyurt> <label for="password" class="block font-roboto-condensed text-sm font-bold text-white mb-2 uppercase" data-astro-cid-sgpqyurt>
Password
</label> <div class="bg-[#212121] border border-[rgba(255,255,255,0.5)] border-solid flex flex-col items-center overflow-clip px-4 py-3 rounded-[4px]" data-astro-cid-sgpqyurt> <input type="password" id="password" name="password" required class="w-full bg-transparent border-0 outline-0 font-roboto-condensed font-normal leading-normal text-[15px] text-white placeholder:text-[rgba(255,255,255,0.5)] focus:ring-0" placeholder="Password" autocomplete="current-password" data-astro-cid-sgpqyurt> </div> </div> <!-- Submit Button / Inline Confirmation Area --> <div id="login-action" class="pt-4" aria-live="polite" data-astro-cid-sgpqyurt> <button id="login-button" type="submit" class="w-full bg-[#ce1141] hover:bg-[#b01038] text-white px-6 py-3 rounded-[4px] text-lg font-prohibition uppercase tracking-wider transition-colors" data-astro-cid-sgpqyurt>
Login
</button> </div> <!-- Inline error box (hidden by default) --> <div id="login-error" class="hidden mt-4 p-4 bg-red-900 border border-red-600 text-red-100 rounded-[4px] text-center font-roboto-condensed" aria-live="polite" data-astro-cid-sgpqyurt></div> </form> </div> </div> </main> ` })}  ${renderScript($$result, "/Users/user/Development/Drose - HomeGrown/src/pages/login.astro?astro&type=script&index=0&lang.ts")}`;
}, "/Users/user/Development/Drose - HomeGrown/src/pages/login.astro", void 0);

const $$file = "/Users/user/Development/Drose - HomeGrown/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
