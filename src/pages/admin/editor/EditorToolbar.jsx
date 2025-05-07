// src/components/editor/EditorToolbar.js
import React from 'react';
import {
  FaBold, FaItalic, FaUnderline, FaStrikethrough,
  FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl,
  FaListOl, FaImage, FaTable, FaCode, FaPalette,
  FaSuperscript, FaSubscript, FaLink, FaSave, FaKeyboard,
  FaParagraph, FaHeading
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export const EditorToolbar = ({
  onStyleApply,
  onInsertImage,
  onInsertTable,
  onInsertCodeBlock,
  onInsertAccordion,
  onInsertHorizontalRule,
  onColorChange,
  onFontChange,
  onFontSizeChange,
  onSaveLocal,
  onSaveToGitHub,
  onShowShortcuts,
  color,
  fontFamily,
  fontSize
}) => {
  return (
    <div className="toolbar flex flex-wrap gap-1 mb-4 p-2 bg-muted rounded-md">
      {/* Text Formatting */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('bold')}>
            <FaBold className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Bold (Ctrl+B)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('italic')}>
            <FaItalic className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Italic (Ctrl+I)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('underline')}>
            <FaUnderline className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Underline (Ctrl+U)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('strikeThrough')}>
            <FaStrikethrough className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Strikethrough</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('superscript')}>
            <FaSuperscript className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Superscript (Alt+Shift+P)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('subscript')}>
            <FaSubscript className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Subscript (Alt+Shift+S)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-1" />

      {/* Alignment */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('justifyLeft')}>
            <FaAlignLeft className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Align Left</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('justifyCenter')}>
            <FaAlignCenter className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Align Center</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('justifyRight')}>
            <FaAlignRight className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Align Right</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-1" />

      {/* Lists */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('insertUnorderedList')}>
            <FaListUl className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Bullet List (Alt+Shift+U)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle size="sm" onPressedChange={() => onStyleApply('insertOrderedList')}>
            <FaListOl className="h-4 w-4" />
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>Numbered List (Alt+Shift+O)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-1" />

      {/* Components */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onInsertImage}>
            <FaImage className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert Image</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onInsertTable}>
            <FaTable className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert Table (Alt+Shift+T)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onInsertCodeBlock}>
            <FaCode className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert Code Block (Alt+Shift+C)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onInsertAccordion}>
            Accordion
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert Accordion (Alt+Shift+A)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={onInsertHorizontalRule}>
            ━
          </Button>
        </TooltipTrigger>
        <TooltipContent>Horizontal Rule (Ctrl+H)</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => {
            const url = prompt("Enter URL:");
            if (url) onStyleApply('createLink', url);
          }}>
            <FaLink className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Insert Link (Ctrl+L)</TooltipContent>
      </Tooltip>

      <Separator orientation="vertical" className="h-8 mx-1" />

      {/* Text Controls */}
      <Popover>
        <PopoverTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm">
                <FaPalette className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Text Color</TooltipContent>
          </Tooltip>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="text-color">Text Color</Label>
            <Input
              type="color"
              id="text-color"
              value={color}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-12 h-8 p-0 border-none"
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="flex items-center gap-2">
        <Select value={fontFamily} onValueChange={onFontChange}>
          <SelectTrigger className="w-[120px] h-8">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Courier New">Courier New</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
            <SelectItem value="monospace">Monospace</SelectItem>
          </SelectContent>
        </Select>

        <Select value={fontSize} onValueChange={onFontSizeChange}>
          <SelectTrigger className="w-[100px] h-8">
            <SelectValue placeholder="Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="p">Paragraph</SelectItem>
            <SelectItem value="h1">Heading 1</SelectItem>
            <SelectItem value="h2">Heading 2</SelectItem>
            <SelectItem value="h3">Heading 3</SelectItem>
            <SelectItem value="h4">Heading 4</SelectItem>
            <SelectItem value="h5">Heading 5</SelectItem>
            <SelectItem value="h6">Heading 6</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator orientation="vertical" className="h-8 mx-1" />
    </div>
  );
};