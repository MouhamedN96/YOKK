'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, RotateCcw, Copy, Check, Languages, MessageSquare, BookOpen, Volume2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { boAISpecificTask } from '@/lib/ai/hybrid-router';

interface BoAIFloatMenuProps {
  content: string; // The content to process
  onClose: () => void; // Function to close the menu
  onResult: (result: string) => void; // Callback when AI returns result
  position: { x: number; y: number }; // Position for the floating menu
}

export default function BoAIFloatMenu({ 
  content, 
  onClose, 
  onResult, 
  position 
}: BoAIFloatMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [selectedAction, setSelectedAction] = useState<'summary' | 'translate' | 'explain' | 'read-aloud' | 'sentiment'>('summary');
  const [targetLanguage, setTargetLanguage] = useState('en');

  const actions = [
    { id: 'summary' as const, label: 'Summarize', icon: BookOpen },
    { id: 'translate' as const, label: 'Translate', icon: Languages },
    { id: 'explain' as const, label: 'Explain', icon: MessageSquare },
    { id: 'read-aloud' as const, label: 'Read Aloud', icon: Volume2 },
  ];

  const handleProcess = async () => {
    if (!content) return;
    
    setIsProcessing(true);
    setResult('');
    
    try {
      const response = await boAISpecificTask(content, selectedAction, targetLanguage);
      
      // For now, we'll simulate getting the result
      // In a real implementation, we'd consume the stream
      let processedContent = '';
      
      switch (selectedAction) {
        case 'summary':
          processedContent = `This is a summary of the content: "${content.substring(0, 100)}...". The main points are...`;
          break;
        case 'translate':
          processedContent = `[Translated to ${targetLanguage}]: ${content}`;
          break;
        case 'explain':
          processedContent = `Explanation: The content "${content.substring(0, 50)}..." discusses important concepts related to...`;
          break;
        case 'read-aloud':
          processedContent = `Reading aloud: ${content}`;
          break;
        case 'sentiment':
          processedContent = `Sentiment analysis: The content appears to have a neutral/positive sentiment with technical focus.`;
          break;
      }
      
      setResult(processedContent);
      onResult(processedContent);
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

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const floatMenu = document.getElementById('bo-ai-float-menu');
      if (floatMenu && !floatMenu.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <motion.div
      id="bo-ai-float-menu"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 10000
      }}
      className="
        w-80
        bg-charcoal-base/95 backdrop-blur-xl
        border border-white/10 rounded-xl
        shadow-2xl overflow-hidden
      "
    >
      {/* Header */}
      <div className="
        p-3 border-b border-white/10
        bg-gradient-to-r from-terracotta-primary/10 to-savanna-gold/10
        flex justify-between items-center
      ">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-terracotta-primary" />
          <h3 className="font-semibold text-clay-white text-sm">
            Bo AI Assistant
          </h3>
        </div>
        <button
          onClick={onClose}
          className="
            p-1 rounded-lg hover:bg-white/10
            text-clay-white/60 hover:text-clay-white
            transition-colors
          "
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Selector */}
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => setSelectedAction(action.id)}
                className={`
                  flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs
                  transition-all duration-200
                  ${selectedAction === action.id
                    ? 'bg-terracotta-primary text-white'
                    : 'bg-white/5 text-clay-white/70 hover:bg-white/10'
                  }
                `}
              >
                <Icon className="w-3 h-3" />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Language Selector for Translate Action */}
        {selectedAction === 'translate' && (
          <div className="mb-3">
            <label className="block text-xs text-clay-white/60 mb-1">Target Language</label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="
                w-full px-2.5 py-1.5 rounded-lg text-xs
                bg-white/5 border border-white/10
                text-clay-white
                focus:outline-none focus:ring-1 focus:ring-terracotta-primary/50
              "
            >
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="pt">Portuguese</option>
              <option value="sw">Swahili</option>
              <option value="ha">Hausa</option>
              <option value="yo">Yoruba</option>
              <option value="ig">Igbo</option>
              <option value="am">Amharic</option>
              <option value="so">Somali</option>
            </select>
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={isProcessing || !content}
          className={`
            w-full py-2 rounded-lg font-medium text-xs
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
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              {selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1)} Text
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
            <div className="p-3">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-clay-white/60">Result:</span>
                <button
                  onClick={handleCopy}
                  className="
                    flex items-center gap-0.5 text-xs
                    text-terracotta-primary hover:text-terracotta-primary/80
                    transition-colors
                  "
                >
                  {copied ? (
                    <>
                      <Check className="w-2.5 h-2.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-2.5 h-2.5" /> Copy
                    </>
                  )}
                </button>
              </div>
              <div className="
                p-2.5 rounded-lg bg-white/5 border border-white/10
                max-h-32 overflow-y-auto text-xs text-clay-white
                whitespace-pre-wrap
              ">
                {result}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}