import { getCachedAllDocs } from "@/lib/db/queries/docs";
import DocSidebarWrapper from "@/components/docs/DocSidebarWrapper";

export default async function DocsLayout({ children }) {
  const allDocs = await getCachedAllDocs();

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)] max-w-[1400px] mx-auto w-full relative">
      <DocSidebarWrapper allDocs={allDocs} />
      <div className="flex-1 w-full min-w-0">
        {children}
      </div>
    </div>
  );
}
