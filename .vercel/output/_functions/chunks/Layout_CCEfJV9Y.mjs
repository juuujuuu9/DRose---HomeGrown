import { e as createComponent, f as createAstro, h as addAttribute, n as renderHead, o as renderSlot, r as renderTemplate } from './astro/server_CujPIBlR.mjs';
import 'piccolore';
import 'clsx';
/* empty css                         */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const {
    title,
    description = "Landing Page Template",
    ogImage = "/og-image.jpg",
    ogTitle = title,
    ogDescription = description
  } = Astro2.props;
  const siteUrl = "https://your-domain.vercel.app";
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`;
  const pageUrl = Astro2.url.href;
  return renderTemplate`<html lang="en" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="description"${addAttribute(description, "content")}><meta name="viewport" content="width=device-width, initial-scale=1.0"><!-- Open Graph / Facebook --><meta property="og:type" content="website"><meta property="og:url"${addAttribute(pageUrl, "content")}><meta property="og:title"${addAttribute(ogTitle, "content")}><meta property="og:description"${addAttribute(ogDescription, "content")}><meta property="og:image"${addAttribute(ogImageUrl, "content")}><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><!-- Twitter --><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title"${addAttribute(ogTitle, "content")}><meta name="twitter:description"${addAttribute(ogDescription, "content")}><meta name="twitter:image"${addAttribute(ogImageUrl, "content")}><link rel="icon" type="image/png" href="/Favicon.png"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@400;700&display=swap" rel="stylesheet"><title>${title}</title>${renderHead()}</head> <body data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/user/Development/Drose - HomeGrown/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
