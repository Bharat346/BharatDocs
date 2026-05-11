import BharatLoader from "@/components/ui/loader";

export default function PDFUniversalLoader({ pipeline = 1, ...props }) {
  return <BharatLoader fullScreen={true} pipeline={pipeline} {...props} />;
}
