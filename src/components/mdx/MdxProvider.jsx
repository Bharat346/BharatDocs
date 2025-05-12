import { useMDXComponents } from '@mdx-js/react';
import HideBtn from '@/utils/Blogs_utils/HideBtn';
import {CodeBlock} from '../ui/CodeBlock';
import { TBComponent } from '../ui/MDXTable';
import React from 'react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@radix-ui/react-accordion';
// import { ChevronDownIcon } from '@radix-ui/react-icons';

// In BlogContent.jsx
const TextComponent = ({ children, className, ...props }) => {
  // Check if children contain any block-level elements
  const hasBlockElements = React.Children.toArray(children).some(child => {
    return React.isValidElement(child) && 
           ['div', 'pre', 'table', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(child.type);
  });

  // If block elements are present, render as div instead of p
  if (hasBlockElements) {
    return (
      <div className={`my-4 leading-relaxed ${className}`} {...props}>
        {children}
      </div>
    );
  }

  // Otherwise render as normal paragraph
  return (
    <p className={`my-4 leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

const Heading = ({ children, level, className, ...props }) => {
  const HeadingTag = `h${level}`;
  const levelClassNames = [
    "text-4xl font-bold my-6 text-gray-900 dark:text-white",
    "text-3xl font-bold my-5 text-gray-800 dark:text-gray-100",
    "text-2xl font-semibold my-4 text-gray-700 dark:text-gray-200",
    "text-xl font-semibold my-3 text-gray-600 dark:text-gray-300",
    "text-lg font-medium my-2 text-gray-600 dark:text-gray-300",
    "text-base font-medium my-2 text-gray-500 dark:text-gray-400"
  ];

  return (
    <HeadingTag className={`${levelClassNames[level - 1]} ${className}`} {...props}>
      {children}
    </HeadingTag>
  );
};

const customComponents = {
  HideBtn,
  hidebtn: HideBtn,
  code: (props) => {
    // If it's a code block (not inline code), render it directly
    if (props.className) {
      return <CodeBlock {...props} />;
    }
    // For inline code, wrap in code tag
    return <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded" {...props} />;
  },

  // Ensure pre tags don't get wrapped in paragraphs
  pre: (props) => <div className="my-4">{props.children}</div>,

  Accordion: ({ title = "click", children }) => (
    // <div className="border rounded-lg overflow-hidden my-4">
    //   <div className="p-4 bg-gray-100 dark:bg-gray-800 font-medium">{title}</div>
    //   <div className="prose custom-prose p-4">{children}</div>
    // </div>
     <Accordion type="single" collapsible className="w-full max-w-md">
     <AccordionItem value="item-1">
       <AccordionTrigger className="flex items-center justify-between w-full py-4 font-medium transition-all hover:underline [&[data-state=open]>svg:rotate-180">
         <span>{title}</span>
         {/* <ChevronDownIcon className="h-4 w-4 transition-transform duration-200" /> */}
       </AccordionTrigger>
       <AccordionContent className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
         {children}
       </AccordionContent>
     </AccordionItem>
   </Accordion>
  ),

  h1: (props) => <Heading {...props} level={1} />,
  h2: (props) => <Heading {...props} level={2} />,
  h3: (props) => <Heading {...props} level={3} />,
  h4: (props) => <Heading {...props} level={4} />,
  h5: (props) => <Heading {...props} level={5} />,
  h6: (props) => <Heading {...props} level={6} />,

  p: (props) => <TextComponent {...props} className="text-gray-700 dark:text-gray-300" />,
  a: (props) => (
    <a
      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors underline"
      {...props}
    />
  ),
  ul: (props) => <ul className="list-disc pl-6 my-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />,
  ol: (props) => <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />,
  li: (props) => <li className="my-1" {...props} />,
  
  blockquote: (props) => (
    <blockquote className="border-l-4 border-blue-500 pl-3 italic my-6 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-1 rounded-r" {...props} />
  ),
  
  hr: (props) => <hr className="my-8 border-gray-200 dark:border-gray-700" {...props} />,

  img: (props) => (
    <div className="my-6 flex justify-center">
      <img className="rounded-lg shadow-md max-w-full w-[95%] h-auto" style={{ maxWidth: '500px' }} {...props} />
    </div>
  ),

  TBComponent,
  strong: ({children}) => <strong>{children}</strong>,

};

export function useCustomMDXComponents() {
  return useMDXComponents(customComponents);
}

export function MDXComponentsProvider({ children }) {
  const components = useCustomMDXComponents();
  return children({ components });
}
