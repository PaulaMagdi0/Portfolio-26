import { SITE_URL } from '@/core/seo/config/site.config';
import { RECIPIENT_EMAIL } from '@/features/home/config/socials.config';

// Honest /auth.md: this is a public, static portfolio with no protected APIs and
// no agent registration. Rather than fabricate an OAuth register_uri / agent_auth
// block (RFC the site doesn't implement), this document truthfully tells agents
// there is nothing to authenticate against, and points them at the real,
// working agent surfaces (llms.txt, Markdown negotiation, WebMCP, sitemap).
export const dynamic = 'force-static';

export function GET(): Response {
  const body = `# Agent & Authentication Information — ${SITE_URL.replace(/^https?:\/\//, '')}

This is a public, static personal portfolio for Paula Magdy (full-stack software
engineer, Cairo, Egypt). It exposes **no protected APIs**, requires **no
authentication**, and has **no agent registration flow**. All content is public
and freely readable — there is nothing to obtain a token for.

## For AI agents

- Machine-readable summary: ${SITE_URL}/llms.txt
- Full page content as Markdown: request any page (e.g. ${SITE_URL}/en) with the
  header \`Accept: text/markdown\`.
- In-browser tools (WebMCP): when loaded in a browser that implements
  \`navigator.modelContext\`, this site registers the tools \`get_portfolio\`,
  \`view_projects\`, \`download_resume\`, \`contact_me\`, and \`navigate_to_section\`.
- Sitemap: ${SITE_URL}/sitemap.xml
- Content-usage preferences: ${SITE_URL}/robots.txt
  (Content-Signal: search=yes, ai-input=yes, ai-train=no)
- Security contact: ${SITE_URL}/.well-known/security.txt

## Authentication

None required. There are no OAuth/OIDC endpoints, token endpoints, protected
resources, or credentialed APIs on this domain. If a protected API is ever added,
this file and the corresponding \`/.well-known/\` metadata will be published then.

## Contact

Email: ${RECIPIENT_EMAIL}
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
