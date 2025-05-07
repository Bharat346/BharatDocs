// src/components/editor/components/Accordion.js
import {
  Accordion as ShadAccordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"

export const Accordion = ({ title, children, defaultOpen = false }) => {
  return (
    <ShadAccordion type="single" collapsible defaultValue={defaultOpen ? "item" : undefined}>
      <AccordionItem value="item" className="border-b-0">
        <AccordionTrigger className="hover:no-underline p-4 bg-gray-100 rounded-md data-[state=open]:rounded-b-none">
          <span className="font-medium">{title}</span>
        </AccordionTrigger>
        <AccordionContent className="p-4 border-l-2 border-gray-200 ml-4 mt-2">
          {children}
        </AccordionContent>
      </AccordionItem>
    </ShadAccordion>
  );
};

export const insertAccordion = (editorRef) => {
  const title = prompt("Enter accordion title:");
  if (!title) return;

  // Create a unique ID for the accordion
  const accordionId = `accordion-${Math.random().toString(36).substring(2, 9)}`;

  // Create the accordion structure
  const wrapper = document.createElement('div');
  wrapper.setAttribute('data-type', 'accordion');
  wrapper.setAttribute('data-accordion-id', accordionId);
  wrapper.setAttribute('contenteditable', 'false');

  const accordionTitle = document.createElement('div');
  accordionTitle.setAttribute('data-accordion-title', '');
  accordionTitle.setAttribute('contenteditable', 'false');
  accordionTitle.className = 'font-medium p-4 bg-gray-100 rounded-md cursor-pointer';
  accordionTitle.textContent = title;

  const accordionContent = document.createElement('div');
  accordionContent.setAttribute('data-accordion-content', '');
  accordionContent.setAttribute('contenteditable', 'true');
  accordionContent.className = 'p-4 border-l-2 border-gray-200 ml-4 mt-2';
  accordionContent.textContent = 'Accordion content goes here...';

  wrapper.appendChild(accordionTitle);
  wrapper.appendChild(accordionContent);

  // Insert into editor
  const selection = window.getSelection();
  if (!selection?.rangeCount) return;

  const range = selection.getRangeAt(0);
  range.deleteContents();
  range.insertNode(wrapper);

  // Move cursor to content
  const newRange = document.createRange();
  newRange.selectNodeContents(accordionContent);
  newRange.collapse(true);
  selection.removeAllRanges();
  selection.addRange(newRange);
};

// Toolbar button component
export const AccordionToolbarButton = ({ editorRef }) => {
  return (
    <button
      type="button"
      onClick={() => insertAccordion(editorRef)}
      className="p-2 rounded hover:bg-gray-100"
      title="Insert Accordion"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="3" y1="9" x2="21" y2="9"></line>
        <line x1="9" y1="21" x2="9" y2="9"></line>
      </svg>
    </button>
  );
};