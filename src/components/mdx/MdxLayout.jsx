import { useCustomMDXComponents } from './MdxProvider';
import { MDXProvider } from '@mdx-js/react';

export default function MDXLayout({ children }) {
  const components = useCustomMDXComponents();
  
  return (
    <div className="blog-template-container max-w-4xl mx-auto px-4">
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
    </div>
  );
}