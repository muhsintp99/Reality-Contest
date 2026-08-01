import React, { useRef } from 'react';
import {
  Bold, Italic, List, ListOrdered, Heading, Sparkles, CheckSquare,
  AlertCircle, RotateCcw, FileText
} from 'lucide-react';

export const RichTextEditor = ({
  label = 'Contest Rules & Guidelines',
  value = '',
  onChange,
  placeholder = 'Enter contest rules, negative marking guidelines, disqualification policies...',
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
    const afterCursor = value.substring(start);
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
    const template = `1. Complete all quiz stages within the countdown timer limit.\n2. Negative marking -2 points applied for each wrong attempt.\n3. Minimum 75% qualifying score required to advance.\n4. Anti-cheat system: Tab switching will trigger immediate disqualification.\n5. Jury decision is final for all leaderboard payouts.`;
    onChange(template);
  };

  const clearFormatting = () => {
    onChange('');
  };

  return (
    <div className="space-y-1.5 text-left">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            {label}
          </label>
          <button
            type="button"
            onClick={applyTemplate}
            className="text-[10px] text-brandPrimary hover:text-brandPrimary/80 font-bold flex items-center gap-1 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-amber-500" /> Insert Rules Template
          </button>
        </div>
      )}

      {/* Editor Main Container */}
      <div className="border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/80 shadow-sm transition-all focus-within:border-brandPrimary focus-within:ring-1 focus-within:ring-brandPrimary/30">
        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**')}
              title="Bold"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-700 dark:text-slate-200"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*')}
              title="Italic"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-700 dark:text-slate-200"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('### ')}
              title="Heading"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-700 dark:text-slate-200"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-slate-300 dark:bg-white/10 mx-1" />

            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('• ')}
              title="Bullet List"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-700 dark:text-slate-200"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('1. ')}
              title="Numbered List"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-700 dark:text-slate-200"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('✓ ')}
              title="Check Rule"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-slate-700 dark:text-slate-200"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertPrefixAtLineStart('⚠️ ')}
              title="Warning Note"
              className="p-1.5 hover:bg-slate-200 dark:hover:bg-white/10 rounded text-amber-500"
            >
              <AlertCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={clearFormatting}
            title="Clear Text"
            className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 rounded transition-colors text-[10px] flex items-center gap-1 font-semibold"
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
          className="w-full p-3 bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y font-mono leading-relaxed"
        />

        {/* Bottom Status bar */}
        <div className="flex justify-between items-center px-3 py-1 bg-slate-100/50 dark:bg-white/5 text-[10px] text-slate-400 border-t border-slate-200/50 dark:border-white/5">
          <span className="flex items-center gap-1"><FileText className="w-3 h-3 text-brandPrimary" /> Formatting supported (Markdown / Plaintext)</span>
          <span>{value.length} Characters</span>
        </div>
      </div>
    </div>
  );
};

export default RichTextEditor;
