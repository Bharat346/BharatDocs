import { useState } from "react";
import { useDark } from "@/hooks/darkmode";

export default function HideBtn({ children }) {
  const [show, setShow] = useState(false);
  const { isDark } = useDark();

  return (
    <div className="my-4">
      <button
        onClick={() => setShow(!show)}
        className={`px-4 py-2 mb-2 rounded transition duration-200 ${
          isDark
            ? "bg-blue-700 text-white hover:bg-blue-800"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {show ? "Hide Answer" : "Show Answer"}
      </button>

      {show && (
        <div
          className={`p-4 border rounded ${
            isDark
              ? "bg-gray-800 text-gray-100 border-gray-700"
              : "bg-gray-100 text-gray-800 border-gray-300"
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
