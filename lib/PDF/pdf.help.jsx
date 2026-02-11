export default function PDFHelpDialog({ onClose }) {
  return (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-[10002]">
      <div className="bg-neutral-900 text-white p-6 rounded-xl w-[320px]">
        <h3 className="font-semibold mb-4">Keyboard Shortcuts</h3>
        <ul className="space-y-2 text-sm">
          <li>↑ / k Previous Page</li>
          <li>↓ / j Next Page</li>
          <li>+ Zoom In</li>
          <li>- Zoom Out</li>
          <li>F Fit to Page</li>
          <li>? Toggle Help</li>
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-blue-500 py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
