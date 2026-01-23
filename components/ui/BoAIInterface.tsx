'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Copy, Check, Languages, MessageSquare, BookOpen, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BoAIInterfaceProps {
  content?: string; // The content to summarize, translate, etc.
  context?: string; // Context for the AI (e.g., "summary", "translate", "explain")
  language?: string; // Target language for translation
  onResult?: (result: string) => void; // Callback when AI returns result
  className?: string; // Additional classes for styling
}

export default function BoAIInterface({ 
  content = '', 
  context = 'summary', 
  language = 'en', 
  onResult,
  className = ''
}: BoAIInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedAction, setSelectedAction] = useState(context);
  const [selectedLanguage, setSelectedLanguage] = useState(language);

  const actions = [
    { id: 'summary', label: 'Summarize', icon: BookOpen },
    { id: 'translate', label: 'Translate', icon: Languages },
    { id: 'explain', label: 'Explain', icon: MessageSquare },
    { id: 'read-aloud', label: 'Read Aloud', icon: Volume2 },
  ];

  const handleProcess = async () => {
    if (!content) return;
    
    setIsProcessing(true);
    setResult('');
    
    try {
      // In a real implementation, this would call the AI API
      // For now, we'll simulate the response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let processedContent = '';
      
      switch (selectedAction) {
        case 'summary':
          processedContent = `This is a summary of the content: "${content.substring(0, 100)}...". The main points are...`;
          break;
        case 'translate':
          processedContent = `[Translated to ${selectedLanguage}]: ${content}`;
          break;
        case 'explain':
          processedContent = `Explanation: The content "${content.substring(0, 50)}..." discusses important concepts related to...`;
          break;
        case 'read-aloud':
          processedContent = `Reading aloud: ${content}`;
          break;
        default:
          processedContent = content;
      }
      
      setResult(processedContent);
      if (onResult) onResult(processedContent);
    } catch (error) {
      setResult('Error processing content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (context && context !== selectedAction) {
      setSelectedAction(context);
    }
  }, [context]);

  return (
    <div className={`inline-block ${className}`}>
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-gradient-to-r from-terracotta-primary/20 to-savanna-gold/20
          border border-terracotta-primary/30
          text-terracotta-primary text-sm font-medium
          hover:from-terracotta-primary/30 hover:to-savanna-gold/30
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50
        `}
        aria-label="Open Bo AI assistant"
      >
        <Sparkles className="w-4 h-4" />
        <span>Ask Bo</span>
      </motion.button>

      {/* Expanded Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="
              absolute z-50 mt-2 w-80
              bg-charcoal-base/95 backdrop-blur-xl
              border border-white/10 rounded-xl
              shadow-2xl overflow-hidden
            "
          >
            {/* Header */}
            <div className="
              p-4 border-b border-white/10
              bg-gradient-to-r from-terracotta-primary/10 to-savanna-gold/10
            ">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-clay-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-terracotta-primary" />
                  Bo AI Assistant
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="
                    p-1 rounded-lg hover:bg-white/10
                    text-clay-white/60 hover:text-clay-white
                    transition-colors
                  "
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <p className="text-xs text-clay-white/60 mt-1">
                Summarize, translate, or explain content
              </p>
            </div>

            {/* Action Selector */}
            <div className="p-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => setSelectedAction(action.id)}
                      className={`
                        flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                        transition-all duration-200
                        ${selectedAction === action.id
                          ? 'bg-terracotta-primary text-white'
                          : 'bg-white/5 text-clay-white/70 hover:bg-white/10'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      {action.label}
                    </button>
                  );
                })}
              </div>

              {/* Language Selector for Translate Action */}
              {selectedAction === 'translate' && (
                <div className="mb-4">
                  <label className="block text-xs text-clay-white/60 mb-1">Target Language</label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="
                      w-full px-3 py-2 rounded-lg
                      bg-white/5 border border-white/10
                      text-clay-white text-sm
                      focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50
                    "
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="pt">Portuguese</option>
                    <option value="sw">Swahili</option>
                    <option value="ha">Hausa</option>
                    <option value="yo">Yoruba</option>
                    <option value="ig">Igbo</option>
                  </select>
                </div>
              )}

              {/* Process Button */}
              <button
                onClick={handleProcess}
                disabled={isProcessing || !content}
                className={`
                  w-full py-2.5 rounded-lg font-medium text-sm
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${isProcessing || !content
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-terracotta-primary to-savanna-gold text-white hover:opacity-90'
                  }
                `}
              >
                {isProcessing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} Content
                  </>
                )}
              </button>
            </div>

            {/* Result Area */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-white/10"
                >
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-clay-white/60">Result:</span>
                      <button
                        onClick={handleCopy}
                        className="
                          flex items-center gap-1 text-xs
                          text-terracotta-primary hover:text-terracotta-primary/80
                          transition-colors
                        "
                      >
                        {copied ? (
                          <>
                            <Check className="w-3 h-3" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div className="
                      p-3 rounded-lg bg-white/5 border border-white/10
                      max-h-40 overflow-y-auto text-sm text-clay-white
                      whitespace-pre-wrap
                    ">
                      {result}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}