'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Reply, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BoAIInterface from '@/components/ui/BoAIInterface';
import BoAIFloatMenu from '@/components/ui/BoAIFloatMenu';

interface CommentProps {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  upvotes?: number;
  downvotes?: number;
  replies?: CommentProps[];
  onReply?: (commentId: string, reply: string) => void;
  onVote?: (commentId: string, vote: 'up' | 'down') => void;
  className?: string;
}

export default function CommentSection({
  id,
  author,
  avatar,
  content,
  timestamp,
  upvotes = 0,
  downvotes = 0,
  replies = [],
  onReply,
  onVote,
  className = ''
}: CommentProps) {
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showBoAI, setShowBoAI] = useState(false);
  const [showBoFloatMenu, setShowBoFloatMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const commentRef = useRef<HTMLDivElement>(null);

  const handleReplySubmit = () => {
    if (replyText.trim() && onReply) {
      onReply(id, replyText);
      setReplyText('');
      setShowReplyBox(false);
    }
  };

  const handleVote = (vote: 'up' | 'down') => {
    if (onVote) {
      onVote(id, vote);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Adjust position to appear near the selected text
      setMenuPosition({
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY - 40 // Appear slightly above the text
      });

      setSelectedText(selection.toString());
      setShowBoFloatMenu(true);
    }
  };

  const handleBoAIResult = (result: string) => {
    console.log('Bo AI result:', result);
    // Could update state or perform other actions with the result
  };

  // Close the float menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commentRef.current && !commentRef.current.contains(event.target as Node)) {
        setShowBoFloatMenu(false);
      }
    };

    document.addEventListener('mouseup', handleClickOutside);
    return () => {
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, []);

  return (
    <div className={`space-y-4 ${className}`} ref={commentRef}>
      {/* Main Comment */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 relative">
        <div className="flex gap-3">
          {/* Avatar */}
          <img
            src={avatar}
            alt={author}
            className="w-10 h-10 rounded-full border border-white/20 flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            {/* Author and Timestamp */}
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-clay-white">{author}</span>
              <span className="text-xs text-clay-white/50">{timestamp}</span>
            </div>

            {/* Content - Make selectable for Bo AI */}
            <p
              className="text-clay-white/80 mb-3 select-text cursor-auto"
              onMouseUp={handleTextSelection}
            >
              {content}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleVote('up')}
                className="flex items-center gap-1 text-sm text-clay-white/60 hover:text-terracotta-primary transition-colors"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{upvotes}</span>
              </button>

              <button
                onClick={() => handleVote('down')}
                className="flex items-center gap-1 text-sm text-clay-white/60 hover:text-terracotta-primary transition-colors"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowReplyBox(!showReplyBox)}
                className="flex items-center gap-1 text-sm text-clay-white/60 hover:text-clay-white transition-colors"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>

              <button
                onClick={() => setShowBoAI(!showBoAI)}
                className="flex items-center gap-1 text-sm text-clay-white/60 hover:text-clay-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask Bo</span>
              </button>

              <button className="text-clay-white/40 hover:text-clay-white transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Bo AI Interface */}
            <AnimatePresence>
              {showBoAI && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 relative"
                >
                  <BoAIInterface
                    content={content}
                    context="summary"
                    onResult={handleBoAIResult}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reply Box */}
            <AnimatePresence>
              {showReplyBox && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    className="
                      w-full p-3 rounded-lg
                      bg-white/5 border border-white/10
                      text-clay-white placeholder:text-clay-white/40
                      focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50
                      resize-none
                    "
                    rows={3}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      onClick={() => setShowReplyBox(false)}
                      className="
                        px-4 py-2 rounded-lg
                        text-clay-white/60 hover:text-clay-white
                        transition-colors
                      "
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReplySubmit}
                      disabled={!replyText.trim()}
                      className={`
                        px-4 py-2 rounded-lg font-medium
                        ${replyText.trim()
                          ? 'bg-terracotta-primary text-white hover:bg-terracotta-primary/90'
                          : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      Reply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bo AI Float Menu - Appears when text is selected */}
      <AnimatePresence>
        {showBoFloatMenu && (
          <BoAIFloatMenu
            content={selectedText}
            onClose={() => setShowBoFloatMenu(false)}
            onResult={handleBoAIResult}
            position={menuPosition}
          />
        )}
      </AnimatePresence>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-8 space-y-4">
          {replies.map((reply) => (
            <CommentSection
              key={reply.id}
              id={reply.id}
              author={reply.author}
              avatar={reply.avatar}
              content={reply.content}
              timestamp={reply.timestamp}
              upvotes={reply.upvotes}
              downvotes={reply.downvotes}
              onReply={onReply}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </div>
  );
}