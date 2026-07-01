import HeroSection from "@/components/home/HeroSection";
import RecentDocs from "@/components/home/RecentDocs";
import RecentBlogs from "@/components/home/RecentBlogs";
import ScrollGateController from "@/components/home/ScrollGateController";

export const metadata = {
  title: "BharatDocs - Learning Hub",
  description: "A modern learning hub for documentation, notes, and technical articles.",
};

import { getCachedRecentDocs } from "@/lib/db/queries/docs";
import { getCachedPublishedBlogs } from "@/lib/db/queries/blogs";

export default async function HomePage() {
  const recentDocs = await getCachedRecentDocs(6);
  const recentBlogs = await getCachedPublishedBlogs({ limit: 3 });

  return (
    <ScrollGateController>
      <div className="flex flex-col min-h-screen">
        <div className="scroll-gate-section">
          <HeroSection />
        </div>
        
        {/* Decorative separator between sections */}
        <div className="w-full h-px bg-[var(--border)] opacity-30" />
        
        <div className="recent-docs-gate">
          <RecentDocs initialDocs={recentDocs} />
        </div>
        
        <div className="w-full h-px bg-[var(--border)] opacity-30" />
        
        <div className="scroll-gate-section">
          <RecentBlogs initialBlogs={recentBlogs} />
        </div>
      </div>
    </ScrollGateController>
  );
}
