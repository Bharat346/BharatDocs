// src/components/editor/ShortcutsDialog.js
import React from 'react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FaKeyboard } from 'react-icons/fa';

export const ShortcutsDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FaKeyboard className="mr-2" />
          Shortcuts
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Formatting</h3>
            <ul className="space-y-1">
              <li><kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">B</kbd> - Bold</li>
              <li><kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">I</kbd> - Italic</li>
              <li><kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">U</kbd> - Underline</li>
              <li><kbd className="kbd">Shift</kbd> + <kbd className="kbd">Alt</kbd> + <kbd className="kbd">S</kbd> - Subscript</li>
              <li><kbd className="kbd">Shift</kbd> + <kbd className="kbd">Alt</kbd> + <kbd className="kbd">P</kbd> - Superscript</li>
              <li><kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">H</kbd> - Horizontal Rule</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Lists</h3>
            <ul className="space-y-1">
              <li><kbd className="kbd">Shift</kbd> + <kbd className="kbd">Alt</kbd> + <kbd className="kbd">U</kbd> - Bullet List</li>
              <li><kbd className="kbd">Shift</kbd> + <kbd className="kbd">Alt</kbd> + <kbd className="kbd">O</kbd> - Numbered List</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">Navigation</h3>
            <ul className="space-y-1">
              <li><kbd className="kbd">Escape</kbd> - Exit current element</li>
              <li><kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">Z</kbd> - Undo</li>
              <li><kbd className="kbd">Ctrl</kbd> + <kbd className="kbd">Y</kbd> - Redo</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};