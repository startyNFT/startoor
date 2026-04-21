export const DEMO_URLS: Record<string, string> = {
  "invoice-maker": "/tools/invoice-maker",
  "link-in-bio-maker": "/tools/link-in-bio",
  "client-tracker": "/tools/client-tracker",
  "seo-roi-calculator": "/tools/seo-roi-calculator",
  "hook-library": "/tools/hook-library",
  "portfolio-builder": "/tools/portfolio-builder",
  "content-calendar-kit": "/tools/content-calendar",
  "ad-copy-swipe-file": "/tools/ad-copy-swipe-file",
  "chatbot-ui-kit": "/tools/chatbot-ui",
  "api-playground": "/tools/api-playground",
  "campaign-dashboard": "/tools/campaign-dashboard",
  "landing-page-templates": "/tools/landing-page-templates",
  "nextjs-auth-starter": "/tools/auth-starter-demo",
  "saas-dashboard-starter": "/tools/saas-dashboard-demo",
  "newsletter-starter": "/tools/newsletter-demo",
};

export function hasLiveDemo(slug: string): boolean {
  return slug in DEMO_URLS;
}
