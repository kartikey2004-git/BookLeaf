import type { Metadata } from "next";
import { siteMetadata } from "./_content/landing-content";
import {
  ClosingCtaSection,
  FaqSection,
  HeroSection,
  PlatformSection,
  PrinciplesSection,
  ProductTabsSection,
  SiteFooter,
  SiteHeader,
} from "./_components";

export const metadata: Metadata = {
  title: siteMetadata.pageTitle,
  description: siteMetadata.seoDescription,
  keywords: [...siteMetadata.keywords],
};

export default function MarketingPage() {
  return (
    <div className="lp">
      <SiteHeader />

      <main>
        <HeroSection />
        <PlatformSection />
        <ProductTabsSection />
        <PrinciplesSection />
        <FaqSection />
        <ClosingCtaSection />
      </main>

      <SiteFooter />
    </div>
  );
}
