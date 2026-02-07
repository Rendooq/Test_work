// src/app/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import { type TransformAction, type TransformPayload } from '../utils/textUtils';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

// --- Components ---

const ToolButton = ({
  onClick,
  icon: Icon,
  label,
  disabled = false,
  active = false,
}: {
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  disabled?: boolean;
  active?: boolean;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
      ${
        active
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
      }
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    `}
    title={label}
  >
    <Icon className="w-4 h-4" />
    <span className="hidden xl:inline">{label}</span>
  </motion.button>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4 px-1">
    {children}
  </h3>
);

// --- Main Page ---

export default function TextTransformer() {
  // State
  const {
    state: text,
    set: setText,
    reset: resetText,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory('', 15);

  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ lines: 0, emptyLines: 0, chars: 0 });
  const [lastExecTime, setLastExecTime] = useState(0);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  
  const workerRef = useRef<Worker | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize Worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('../workers/textWorker.ts', import.meta.url));
    
    workerRef.current.onmessage = (e: MessageEvent<{ success: boolean; text: string; executionTime: number; error?: string }>) => {
      const { success, text: newText, executionTime, error } = e.data;
      setIsProcessing(false);
      
      if (success) {
        setText(newText);
        setLastExecTime(executionTime);
      } else {
        console.error('Worker error:', error);
        alert('An error occurred during processing.');
      }
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, [setText]);

  // Persistence (Auto-save)
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

  // Stats Calculation (Memoized)
  useEffect(() => {
    // Simple stats can be done on main thread even for 10k lines
    // If this becomes heavy, move to worker as well
    const lines = text.split('\n');
    const empty = lines.filter((l) => !l.trim()).length;
    setStats({
      lines: lines.length,
      emptyLines: empty,
      chars: text.length,
    });
  }, [text]);

  // Handlers
  const handleTransform = (action: TransformAction) => {
    if (!workerRef.current || isProcessing) return;
    setIsProcessing(true);

    const payload: TransformPayload = {
      action,
      text,
      params: action === 'find_replace' ? { find: findText, replace: replaceText } : undefined,
    };

    workerRef.current.postMessage(payload);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setText(content);
    };
    reader.readAsText(file);
    // Reset input
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
      // Optional: Toast notification here
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar / Control Panel */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
            <FileText className="text-blue-600" /> TextTool
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          
          {/* History Controls */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <ToolButton 
              onClick={undo} 
              disabled={!canUndo} 
              icon={RotateCcw} 
              label="Undo" 
            />
            <ToolButton 
              onClick={redo} 
              disabled={!canRedo} 
              icon={RotateCw} 
              label="Redo" 
            />
          </div>

          <SectionLabel>Case</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <ToolButton onClick={() => handleTransform('upper')} icon={Type} label="UPPER" />
            <ToolButton onClick={() => handleTransform('lower')} icon={Type} label="lower" />
            <ToolButton onClick={() => handleTransform('cap_words')} icon={Type} label="Capitalize" />
            <ToolButton onClick={() => handleTransform('cap_first')} icon={Type} label="Sentence" />
          </div>

          <SectionLabel>Symbols</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <ToolButton onClick={() => handleTransform('add_plus')} icon={Plus} label="Add +" />
            <ToolButton onClick={() => handleTransform('remove_plus')} icon={Minus} label="Remove +" />
            <ToolButton onClick={() => handleTransform('add_quotes')} icon={Quote} label='Add ""' />
            <ToolButton onClick={() => handleTransform('remove_quotes')} icon={Eraser} label='Rem ""' />
            <ToolButton onClick={() => handleTransform('add_brackets')} icon={Brackets} label="Add []" />
            <ToolButton onClick={() => handleTransform('remove_brackets')} icon={Eraser} label="Rem []" />
            <ToolButton onClick={() => handleTransform('add_dash')} icon={Minus} label="Add -" />
            <ToolButton onClick={() => handleTransform('remove_dash')} icon={Eraser} label="Rem -" />
          </div>

          <SectionLabel>Cleaning</SectionLabel>
          <div className="grid grid-cols-1 gap-2">
            <ToolButton onClick={() => handleTransform('trim')} icon={AlignLeft} label="Trim Spaces" />
            <ToolButton onClick={() => handleTransform('remove_tabs')} icon={X} label="Remove Tabs" />
            <ToolButton onClick={() => handleTransform('remove_after_dash')} icon={Eraser} label="Remove after ' -'" />
            <ToolButton onClick={() => handleTransform('space_to_underscore')} icon={Minus} label="Space to _" />
            <ToolButton onClick={() => handleTransform('strip_special')} icon={Fingerprint} label="Strip Special Chars" />
          </div>

          <SectionLabel>Sort & Unique</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            <ToolButton onClick={() => handleTransform('sort_asc')} icon={ArrowDownAZ} label="A-Z" />
            <ToolButton onClick={() => handleTransform('sort_desc')} icon={ArrowUpAZ} label="Z-A" />
            <ToolButton onClick={() => handleTransform('unique')} icon={Fingerprint} label="Unique" />
          </div>

          <SectionLabel>Find & Replace</SectionLabel>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <input
              type="text"
              placeholder="Find..."
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Replace..."
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500"
            />
            <ToolButton 
              onClick={() => handleTransform('find_replace')} 
              icon={Search} 
              label="Replace All" 
              active
            />
          </div>
        </div>

        {/* File Operations */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="w-4 h-4" /> Import
              <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
            </label>
            <ToolButton onClick={handleDownload} icon={Download} label="Export" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Toolbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <span className="font-bold text-slate-700">{stats.lines}</span> Lines
            </span>
            <span className="w-px h-4 bg-slate-300" />
            <span className="flex items-center gap-1">
              <span className="font-bold text-slate-700">{stats.emptyLines}</span> Empty
            </span>
            <span className="w-px h-4 bg-slate-300" />
            <span className="flex items-center gap-1">
              <span className="font-bold text-slate-700">{stats.chars}</span> Chars
            </span>
          </div>

          <div className="flex items-center gap-2">
            <AnimatePresence>
              {lastExecTime > 0 && (
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-green-600 font-mono mr-4"
                >
                  Done in {lastExecTime.toFixed(2)}ms
                </motion.span>
              )}
            </AnimatePresence>
            <ToolButton onClick={handleCopy} icon={Copy} label="Copy" />
            <ToolButton onClick={() => setText('')} icon={Trash2} label="Clear" />
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 p-6 overflow-hidden relative">
          <div className="absolute inset-0 p-6">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-full p-4 bg-white border border-slate-200 rounded-lg shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono text-sm leading-relaxed text-slate-800"
              placeholder="Paste or type your text here..."
              spellCheck={false}
            />
            
            {/* Loading Overlay */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-20 rounded-lg"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium text-blue-700">Processing...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
