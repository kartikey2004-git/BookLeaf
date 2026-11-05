import type { Metadata } from "next";
import { siteMetadata } from "./_content/landing-content";
import { FaqSection } from "./_components/faq";
import { SiteFooter } from "./_components/footer";
import { SiteHeader } from "./_components/header";
import { PrinciplesSection } from "./_components/principles";
import { ProductTabsSection } from "./_components/product-tabs";
import { ClosingCtaSection } from "./_components/sections-bottom";
import { HeroSection, PlatformSection } from "./_components/sections-top";

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
