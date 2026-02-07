import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from './hooks/useHistory';
import { textActions } from './utils/textActions';
import {
  Type,
  Quote,
  Minus,
  Eraser,
  Search,
  ArrowDownAZ,
  ArrowUpAZ,
  Copy,
  Download,
  Upload,
  RotateCcw,
  RotateCw,
  Trash2,
  FileText,
  Brackets,
  Plus,
  Fingerprint,
  AlignLeft,
  X,
  Hash,
  Clock,
  Replace
} from 'lucide-react';

// --- Components ---

interface ToolButtonProps {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
}

const ToolButton: React.FC<ToolButtonProps> = ({ onClick, icon: Icon, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      flex w-full items-center gap-2 p-2 rounded transition-colors
      hover:bg-slate-800 text-slate-300 hover:text-white
      disabled:opacity-50 disabled:cursor-not-allowed
    `}
    title={label}
  >
    <Icon size={18} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-6 px-2">
    {children}
  </h3>
);

const IconButton: React.FC<{ onClick: () => void; icon: React.ElementType; title: string; disabled?: boolean }> = ({ onClick, icon: Icon, title, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors disabled:opacity-30"
  >
    <Icon size={20} />
  </button>
);

// --- Main App ---

export default function App() {
  // State
  const {
    state: text,
    set: setText,
    reset: resetText,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory('', 10);

  const [executionTime, setExecutionTime] = useState(0);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('text-tool-content');
    if (saved) resetText(saved);
  }, [resetText]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('text-tool-content', text);
    }, 1000);
    return () => clearTimeout(timer);
  }, [text]);

  // Performance: Memoized Stats
  const stats = useMemo(() => {
    const lines = text.split('\n');
    const nonEmptyLines = lines.filter(l => l.trim().length > 0);
    return {
      lines: lines.length,
      chars: text.length,
      nonEmptyLines: nonEmptyLines.length,
      emptyLines: lines.length - nonEmptyLines.length
    };
  }, [text]);

  // Handlers
  const handleAction = (fn: (t: string) => string) => {
    try {
      const start = performance.now();
      const newText = fn(text);
      const end = performance.now();
      
      if (newText !== text) {
        setText(newText);
        setExecutionTime(end - start);
      }
    } catch (error) {
      console.error("Transformation failed:", error);
      alert("An error occurred during text transformation.");
    }
  };

  const handleFindReplace = () => {
    if (!findText) return;
    handleAction((t) => textActions.findAndReplace(t, findText, replaceText));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (typeof content === 'string') {
        setText(content);
        setExecutionTime(0);
        // Immediate save to localStorage
        localStorage.setItem('text-tool-content', content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformed_text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      
      {/* Sidebar (Left) */}
      <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 z-20">
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText size={24} className="text-white" />
          </div>
          <h1 className="font-bold text-xl text-white tracking-tight">TextTool</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {/* Find & Replace Section */}
          <div className="mb-6 bg-slate-950/50 p-4 rounded-lg border border-slate-800">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="Find..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-sm py-2 pl-8 pr-2 text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>
              <div className="relative">
                <Replace className="absolute left-2 top-2.5 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="Replace..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded text-sm py-2 pl-8 pr-2 text-slate-200 focus:outline-none focus:border-blue-500 placeholder:text-slate-600"
                />
              </div>
              <button 
                onClick={handleFindReplace}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded transition-colors"
              >
                Replace All
              </button>
            </div>
          </div>

          <SectionLabel>CASE</SectionLabel>
          <ToolButton onClick={() => handleAction(textActions.toUpperCase)} icon={Type} label="UPPERCASE" />
          <ToolButton onClick={() => handleAction(textActions.toLowerCase)} icon={Type} label="lowercase" />
          <ToolButton onClick={() => handleAction(textActions.capitalizeWords)} icon={Type} label="Capitalize Words" />
          <ToolButton onClick={() => handleAction(textActions.capitalizeFirstLetter)} icon={Type} label="Sentence case" />

          <SectionLabel>SYMBOLS</SectionLabel>
          <ToolButton onClick={() => handleAction(textActions.addPlus)} icon={Plus} label="Add +" />
          <ToolButton onClick={() => handleAction(textActions.removePlus)} icon={Minus} label="Remove +" />
          <ToolButton onClick={() => handleAction(textActions.addQuotes)} icon={Quote} label='Add ""' />
          <ToolButton onClick={() => handleAction(textActions.removeQuotes)} icon={Eraser} label='Remove ""' />
          <ToolButton onClick={() => handleAction(textActions.addBrackets)} icon={Brackets} label="Add []" />
          <ToolButton onClick={() => handleAction(textActions.removeBrackets)} icon={Eraser} label="Remove []" />
          <ToolButton onClick={() => handleAction(textActions.addDash)} icon={Minus} label="Add -" />
          <ToolButton onClick={() => handleAction(textActions.removeDash)} icon={Eraser} label="Remove -" />
          <ToolButton onClick={() => handleAction(textActions.addDashBrackets)} icon={Brackets} label="Add -[]" />
          <ToolButton onClick={() => handleAction(textActions.removeDashBrackets)} icon={Eraser} label="Remove -[]" />
          <ToolButton onClick={() => handleAction(textActions.addDashQuotes)} icon={Quote} label='Add -""' />
          <ToolButton onClick={() => handleAction(textActions.removeDashQuotes)} icon={Eraser} label='Remove -""' />

          <SectionLabel>CLEANING</SectionLabel>
          <ToolButton onClick={() => handleAction(textActions.trim)} icon={AlignLeft} label="Trim Whitespace" />
          <ToolButton onClick={() => handleAction(textActions.removeTabs)} icon={X} label="Remove Tabs" />
          <ToolButton onClick={() => handleAction(textActions.removeAfterDash)} icon={Eraser} label="Remove after ' -'" />
          <ToolButton onClick={() => handleAction(textActions.replaceSpacesWithUnderscore)} icon={Minus} label="Spaces to _" />
          <ToolButton onClick={() => handleAction(textActions.stripSpecialCharacters)} icon={Fingerprint} label="Strip Special Chars" />

          <SectionLabel>SORT & UNIQUE</SectionLabel>
          <ToolButton onClick={() => handleAction(textActions.sortAZ)} icon={ArrowDownAZ} label="Sort A-Z" />
          <ToolButton onClick={() => handleAction(textActions.sortZA)} icon={ArrowUpAZ} label="Sort Z-A" />
          <ToolButton onClick={() => handleAction(textActions.removeDuplicates)} icon={Fingerprint} label="Remove Duplicates" />
        </div>
      </aside>

      {/* Main Content (Right) */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950">
        
        {/* Top Toolbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <IconButton onClick={undo} disabled={!canUndo} icon={RotateCcw} title="Undo (Ctrl+Z)" />
            <IconButton onClick={redo} disabled={!canRedo} icon={RotateCw} title="Redo (Ctrl+Y)" />
            <div className="w-px h-6 bg-slate-700 mx-3" />
            <IconButton onClick={handleCopy} icon={Copy} title="Copy to Clipboard" />
            <IconButton onClick={() => setText('')} icon={Trash2} title="Clear Editor" />
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-sm font-medium cursor-pointer transition-colors text-slate-300">
              <Upload size={16} />
              <span>Import</span>
              <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
            </label>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-medium transition-colors"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 p-0 overflow-hidden relative flex flex-col">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 w-full bg-slate-950 text-slate-200 p-6 font-mono text-sm leading-relaxed resize-none focus:outline-none placeholder:text-slate-600"
            placeholder="Paste or type your text here..."
            spellCheck={false}
          />
        </div>

        {/* Footer Stats */}
        <footer className="h-10 border-t border-slate-800 bg-slate-900 flex items-center justify-between px-6 text-xs text-slate-400 select-none">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Hash size={14} />
              <span>Lines: <span className="text-slate-200 font-mono">{stats.lines}</span></span>
            </span>
            <span className="flex items-center gap-2">
              <span>Empty: <span className="text-slate-200 font-mono">{stats.emptyLines}</span></span>
            </span>
            <span className="flex items-center gap-2">
              <Type size={14} />
              <span>Chars: <span className="text-slate-200 font-mono">{stats.chars}</span></span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {executionTime > 0 && (
              <span className="flex items-center gap-2 text-emerald-400">
                <Clock size={14} />
                <span>{executionTime.toFixed(2)} ms</span>
              </span>
            )}
          </div>
        </footer>

      </main>
    </div>
  );
}
