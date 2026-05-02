import BharatLoader from "@/components/ui/loader";

export default function Loader() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
      <BharatLoader text="Bharat Docs" />
    </div>
  );
}
