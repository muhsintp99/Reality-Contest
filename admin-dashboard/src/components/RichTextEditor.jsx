import React, { useRef } from 'react';
import {
  Bold, Italic, List, ListOrdered, Heading, Sparkles, CheckSquare,
  AlertCircle, RotateCcw, FileText
} from 'lucide-react';

export const RichTextEditor = ({
  label = 'Contest Rules & Guidelines',
  value = '',
  onChange,
  placeholder = 'Enter rules, negative marking guidelines, policies...',
  rows = 4
}) => {
  const textareaRef = useRef(null);

  const insertFormatting = (prefix, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${prefix}${selectedText || 'Text'}${suffix}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);

    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4));
    }, 0);
  };

  const insertPrefixAtLineStart = (prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const lastNewline = beforeCursor.lastIndexOf('\n');

    let newValue;
    if (lastNewline === -1) {
      newValue = prefix + value;
    } else {
      newValue = value.substring(0, lastNewline + 1) + prefix + value.substring(lastNewline + 1);
    }

    onChange(newValue);
    setTimeout(() => textarea.focus(), 0);
  };

  const applyTemplate = () => {
    const template = `1. Complete all quiz stages within the countdown timer limit.\n2. Verify proof of submission files before submitting.\n3. Anti-cheat rule: Exit or tab switching results in disqualification.\n4. Decisions made by contest management are final.`;
    onChange(template);
  };

  const clearFormatting = () => {
    onChange('');
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {label}
          </label>
          <button
            type="button"
            onClick={applyTemplate}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-amber-400" /> Insert Template
          </button>
        </div>
      )}

      {/* Editor Container */}
      <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/80 backdrop-blur-md shadow-lg transition-all focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-950/80 border-b border-slate-800 text-slate-300">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              title="Bold"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              title="Italic"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('### ')}
              title="Heading"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('• ')}
              title="Bullet List"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('1. ')}
              title="Numbered List"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('✓ ')}
              title="Check Rule"
              className="p-1.5 hover:bg-slate-800 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('⚠️ ')}
              title="Warning Note"
              className="p-1.5 hover:bg-slate-800 text-amber-400 rounded-lg transition-colors cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={clearFormatting}
            title="Clear Text"
            className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg transition-colors text-[10px] flex items-center gap-1 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" /> Clear
          </button>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full p-3.5 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none resize-y font-mono leading-relaxed"
        />

        {/* Bottom Status bar */}
        <div className="flex justify-between items-center px-3.5 py-1.5 bg-slate-950/60 text-[10px] text-slate-400 border-t border-slate-800/80">
          <span className="flex items-center gap-1.5">
            <FileText className="w-3 h-3 text-emerald-400" /> Supports Markdown / Plaintext
          </span>
          <span className="font-mono">{value.length} Characters</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
