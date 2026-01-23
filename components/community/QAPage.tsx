'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Eye, ChevronUp, ChevronDown, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question, Answer, User } from '@/types/community';
import CommentSection from '@/components/comments/CommentSection';

interface QAPageProps {
  question: Question;
  answers: Answer[];
  currentUser?: User;
  onVote?: (postId: string, voteType: 'up' | 'down') => void;
  onAnswer?: (questionId: string, content: string) => void;
  onBookmark?: (postId: string) => void;
}

export default function QAPage({ 
  question, 
  answers = [], 
  currentUser,
  onVote,
  onAnswer,
  onBookmark
}: QAPageProps) {
  const [newAnswer, setNewAnswer] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);

  const handleAnswerSubmit = () => {
    if (newAnswer.trim() && onAnswer) {
      onAnswer(question.id, newAnswer);
      setNewAnswer('');
      setShowAnswerForm(false);
    }
  };

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(postId, voteType);
    }
  };

  const handleBookmark = (postId: string) => {
    if (onBookmark) {
      onBookmark(postId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          bg-white/5 backdrop-blur-sm
          border border-white/10 rounded-xl
          p-6
        "
      >
        <div className="flex gap-6">
          {/* Vote Column */}
          <div className="flex flex-col items-center gap-2 min-w-[60px]">
            <button 
              onClick={() => handleVote(question.id, 'up')}
              className="
                p-2 rounded-lg
                bg-white/5 hover:bg-violet-500/20
                border border-white/10 hover:border-violet-500/50
                transition-all duration-200
              "
            >
              <ChevronUp className="w-5 h-5 text-clay-white/60 hover:text-violet-400" />
            </button>
            <span className="text-sm font-semibold text-clay-white">{question.upvotes}</span>
            <button 
              onClick={() => handleVote(question.id, 'down')}
              className="
                p-2 rounded-lg
                bg-white/5 hover:bg-violet-500/20
                border border-white/10 hover:border-violet-500/50
                transition-all duration-200
              "
            >
              <ChevronDown className="w-5 h-5 text-clay-white/60 hover:text-violet-400" />
            </button>
          </div>

          {/* Content Column */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={question.author.avatar} 
                alt={question.author.username} 
                className="w-10 h-10 rounded-full border border-white/20" 
              />
              <div>
                <p className="font-semibold text-clay-white">{question.author.username}</p>
                <p className="text-xs text-clay-white/50">{question.createdAt}</p>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-clay-white mb-4">{question.title}</h1>

            {/* Content */}
            <div className="prose prose-invert max-w-none text-clay-white/80 mb-6">
              {question.content.split('\n').map((paragraph, i) => (
                <p key={i} className="mb-4">{paragraph}</p>
              ))}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="
                    px-3 py-1 rounded-full
                    bg-violet-500/20 text-violet-400
                    text-xs font-medium
                    border border-violet-500/30
                  "
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <button 
                onClick={() => setShowAnswerForm(!showAnswerForm)}
                className="
                  flex items-center gap-2 px-4 py-2 rounded-lg
                  bg-gradient-to-r from-violet-500 to-emerald-500
                  text-white font-medium
                  hover:opacity-90 transition-opacity
                "
              >
                <MessageCircle className="w-4 h-4" />
                <span>Answer Question</span>
              </button>

              <button 
                onClick={() => handleBookmark(question.id)}
                className="flex items-center gap-2 text-clay-white/60 hover:text-clay-white transition-colors"
              >
                <Bookmark className="w-4 h-4" />
                <span>Bookmark</span>
              </button>

              <button className="flex items-center gap-2 text-clay-white/60 hover:text-clay-white transition-colors">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <div className="flex items-center gap-4 ml-auto text-sm text-clay-white/50">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{question.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>{question.answers} answers</span>
                </div>
              </div>
            </div>

            {/* Answer Form */}
            <AnimatePresence>
              {showAnswerForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6"
                >
                  <textarea
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="Write your answer..."
                    className="
                      w-full p-4 rounded-lg
                      bg-white/5 border border-white/10
                      text-clay-white placeholder:text-clay-white/40
                      focus:outline-none focus:ring-2 focus:ring-violet-500/50
                      resize-none
                    "
                    rows={6}
                  />
                  <div className="flex justify-end gap-3 mt-3">
                    <button
                      onClick={() => setShowAnswerForm(false)}
                      className="
                        px-4 py-2 rounded-lg
                        text-clay-white/60 hover:text-clay-white
                        transition-colors
                      "
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAnswerSubmit}
                      disabled={!newAnswer.trim()}
                      className={`
                        px-4 py-2 rounded-lg font-medium
                        ${newAnswer.trim()
                          ? 'bg-violet-500 text-white hover:bg-violet-600'
                          : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                        }
                      `}
                    >
                      Post Answer
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Answers Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-clay-white flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {answers.length} Answer{answers.length !== 1 ? 's' : ''}
        </h2>

        {answers.length === 0 ? (
          <div className="text-center py-12 text-clay-white/50">
            <p>No answers yet. Be the first to answer this question!</p>
          </div>
        ) : (
          answers.map((answer, index) => (
            <motion.div
              key={answer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="
                bg-white/5 backdrop-blur-sm
                border border-white/10 rounded-xl
                p-6
              "
            >
              <div className="flex gap-6">
                {/* Vote Column */}
                <div className="flex flex-col items-center gap-2 min-w-[60px]">
                  <button 
                    onClick={() => handleVote(answer.id, 'up')}
                    className="
                      p-2 rounded-lg
                      bg-white/5 hover:bg-emerald-500/20
                      border border-white/10 hover:border-emerald-500/50
                      transition-all duration-200
                    "
                  >
                    <ChevronUp className="w-5 h-5 text-clay-white/60 hover:text-emerald-400" />
                  </button>
                  <span className="text-sm font-semibold text-clay-white">{answer.upvotes}</span>
                  <button 
                    onClick={() => handleVote(answer.id, 'down')}
                    className="
                      p-2 rounded-lg
                      bg-white/5 hover:bg-emerald-500/20
                      border border-white/10 hover:border-emerald-500/50
                      transition-all duration-200
                    "
                  >
                    <ChevronDown className="w-5 h-5 text-clay-white/60 hover:text-emerald-400" />
                  </button>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">
                  {/* Author Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <img 
                      src={answer.author.avatar} 
                      alt={answer.author.username} 
                      className="w-8 h-8 rounded-full border border-white/20" 
                    />
                    <div>
                      <p className="font-semibold text-clay-white">{answer.author.username}</p>
                      <p className="text-xs text-clay-white/50">{answer.createdAt}</p>
                    </div>
                  </div>

                  {/* Answer Content */}
                  <div className="prose prose-invert max-w-none text-clay-white/80">
                    {answer.content.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-4">{paragraph}</p>
                    ))}
                  </div>

                  {/* Answer Actions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-white/10 mt-4">
                    <button className="flex items-center gap-2 text-clay-white/60 hover:text-clay-white transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>Helpful</span>
                    </button>
                    <button className="flex items-center gap-2 text-clay-white/60 hover:text-clay-white transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                    <button className="text-clay-white/40 hover:text-clay-white transition-colors ml-auto">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Comments for the question */}
      <div className="mt-8">
        <CommentSection
          id={question.id}
          author={question.author.username}
          avatar={question.author.avatar}
          content={question.content}
          timestamp={question.createdAt}
          upvotes={question.upvotes}
        />
      </div>
    </div>
  );
}