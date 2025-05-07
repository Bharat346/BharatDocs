import { useState, useEffect, useRef } from 'react';
import hljs from 'highlight.js';
import { Copy, Check } from 'lucide-react';
import 'highlight.js/styles/github.css'; 

export const CodeBlock = ({ children, className, ...props }) => {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const codeRef = useRef(null);
  const language = className?.replace(/language-/, '') || 'plaintext';

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (codeRef.current) {
      const code = String(children).trim();
      const highlighted = hljs.highlight(language, code).value;
      setHighlightedCode(highlighted);
    }
  }, [children, language]);

  return (
    <div className="relative my-4 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 text-gray-300 text-xs">
        <span className="uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 overflow-x-auto p-2 px-3">
        <code
          ref={codeRef}
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          {...props}
        />
      </pre>
    </div>
  );
};
