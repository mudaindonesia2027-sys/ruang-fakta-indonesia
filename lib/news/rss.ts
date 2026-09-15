export type NewsFeedItem = {
  title: string;
  link: string;
  description: string | null;
  publishedAt: Date | null;
  guid: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(item: string, name: string) {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function dateValue(value: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function fetchRssFeed(feedUrl: string, limit = 10): Promise<NewsFeedItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "RuangFakta/1.0 RSS aggregator" },
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`RSS ${response.status}`);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].map(match => match[1]);
    return items.slice(0, limit).map(item => {
      const title = tag(item, "title");
      const link = tag(item, "link");
      const guid = tag(item, "guid") || link || title;
      return {
        title,
        link,
        description: tag(item, "description") || null,
        publishedAt: dateValue(tag(item, "pubDate")),
        guid,
      };
    }).filter(item => item.title && /^https?:\/\//i.test(item.link));
  } finally {
    clearTimeout(timeout);
  }
}

export const DEFAULT_NEWS_FEEDS = [
  { name: "ANTARA Terkini", url: "https://www.antaranews.com/rss/terkini.xml" },
  { name: "ANTARA Politik", url: "https://www.antaranews.com/rss/politik.xml" },
  { name: "ANTARA Hukum", url: "https://www.antaranews.com/rss/hukum.xml" },
  { name: "ANTARA Ekonomi", url: "https://www.antaranews.com/rss/ekonomi.xml" },
  { name: "ANTARA Humaniora", url: "https://www.antaranews.com/rss/humaniora.xml" },
  { name: "ANTARA Warta Bumi", url: "https://www.antaranews.com/rss/warta-bumi.xml" },
];
