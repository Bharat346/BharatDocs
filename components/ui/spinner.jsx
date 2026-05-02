import BharatLoader from "@/components/ui/loader";

function Spinner({ className, ...props }) {
  return <BharatLoader small text="" className={className} {...props} />;
}

export { Spinner };
