import Anthropic from "@anthropic-ai/sdk";
import { ContentBlockInput, ContentCategory, ExtractionResult } from "./types";

const anthropic = new Anthropic();

const GRANT_RELEVANT_PATHS = [
  "/about", "/about-us", "/team", "/our-team", "/leadership",
  "/mission", "/impact", "/what-we-do", "/our-work",
  "/partners", "/partnerships", "/press", "/news", "/awards",
];

const SKIP_PATHS = [
  "/pricing", "/blog", "/login", "/signup", "/register",
  "/terms", "/privacy", "/careers", "/jobs", "/cart", "/checkout",
];

function stripHtmlTags(html: string): string {
  let text = html;
  // Remove script and style blocks
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");
  text = text.replace(/<footer[\s\S]*?<\/footer>/gi, "");
  // Remove remaining tags
  text = text.replace(/<[^>]+>/g, " ");
  // Collapse whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text.slice(0, 8000);
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "GrantPilot/1.0 (grant-application-assistant)" },
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    return stripHtmlTags(html);
  } catch {
    return null;
  }
}

function extractInternalLinks(html: string, baseUrl: string): string[] {
  const origin = new URL(baseUrl).origin;
  const hrefPattern = /href="([^"]+)"/g;
  const links: Set<string> = new Set();
  let match;
  while ((match = hrefPattern.exec(html)) !== null) {
    try {
      const fullUrl = match[1].startsWith("/") ? origin + match[1] : match[1];
      const parsed = new URL(fullUrl);
      if (parsed.origin !== origin) continue;
      const path = parsed.pathname.toLowerCase();
      if (SKIP_PATHS.some((skip) => path.startsWith(skip))) continue;
      if (GRANT_RELEVANT_PATHS.some((r) => path.includes(r.slice(1)))) {
        links.add(fullUrl);
      }
    } catch { /* invalid URL */ }
  }
  return Array.from(links).slice(0, 10);
}

export async function extractFromWebsite(url: string): Promise<ExtractionResult> {
  // Fetch raw HTML for link extraction
  let rawHtml = "";
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "GrantPilot/1.0" },
    });
    rawHtml = await res.text();
  } catch {
    return { blocks: [], conflicts: [], sourceUrl: url };
  }

  const homepageText = stripHtmlTags(rawHtml);
  const pages: { url: string; content: string }[] = [{ url, content: homepageText }];

  const internalLinks = extractInternalLinks(rawHtml, url);

  const fetches = internalLinks.map(async (link) => {
    const content = await fetchPage(link);
    if (content) pages.push({ url: link, content });
  });
  await Promise.all(fetches);

  const allContent = pages
    .map((p) => `--- Page: ${p.url} ---\n${p.content}`)
    .join("\n\n")
    .slice(0, 30000);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{
      role: "user",
      content: `Extract grant-relevant information from this company's website.

Website: ${url}
Content from ${pages.length} pages:
${allContent}

Extract ONLY information useful for grant applications. Categories:
company_overview, mission, team_bios, past_performance, technical_capabilities,
financials, partnerships, dei_statement, impact_metrics, environmental

Return JSON array:
[{"category":"mission","title":"Mission Statement","content":"extracted text","sourceUrl":"page URL"}]

Rules:
- Only factual, specific information
- Keep all metrics and numbers
- Full team bios with qualifications
- Skip marketing fluff and CTAs
- Combine info from multiple pages into coherent blocks
- Return ONLY valid JSON`,
    }],
  });

  const content = response.content[0];
  if (content.type !== "text") return { blocks: [], conflicts: [], sourceUrl: url };

  try {
    const extracted = JSON.parse(content.text);
    const blocks: ContentBlockInput[] = extracted.map(
      (item: { category: string; title: string; content: string; sourceUrl?: string }) => ({
        category: item.category as ContentCategory,
        title: item.title,
        content: item.content,
        source: "website" as const,
        sourceRef: item.sourceUrl || url,
        confidence: 70,
      })
    );
    return { blocks, conflicts: [], sourceUrl: url };
  } catch {
    return { blocks: [], conflicts: [], sourceUrl: url };
  }
}
