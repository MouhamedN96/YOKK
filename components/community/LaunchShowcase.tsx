'use client';

import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, ExternalLink, TrendingUp, Star, Calendar, Globe, Github } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Launch, User } from '@/types/community';

interface LaunchShowcaseProps {
  launches: Launch[];
  currentUser?: User;
  onVote?: (launchId: string, voteType: 'up' | 'down') => void;
  onComment?: (launchId: string, comment: string) => void;
}

export default function LaunchShowcase({ 
  launches, 
  currentUser,
  onVote,
  onComment
}: LaunchShowcaseProps) {
  const [expandedLaunch, setExpandedLaunch] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLaunch(expandedLaunch === id ? null : id);
  };

  const handleVote = (launchId: string, voteType: 'up' | 'down') => {
    if (onVote) {
      onVote(launchId, voteType);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold text-clay-white">Launch Showcase</h1>
        <div className="flex items-center gap-2 text-sm text-clay-white/60">
          <TrendingUp className="w-4 h-4" />
          <span>Discover the latest African tech innovations</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {launches.map((launch, index) => (
          <motion.div
            key={launch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`
              group relative overflow-hidden
              bg-white/5 backdrop-blur-sm
              border border-white/10 rounded-xl
              transition-all duration-300
              hover:transform hover:scale-[1.02]
              ${launch.isTrending ? 'ring-2 ring-terracotta-primary/50' : ''}
            `}
          >
            {/* Trending Badge */}
            {launch.isTrending && (
              <div className="absolute top-3 right-3 z-10">
                <span className="
                  px-2 py-1 rounded-full
                  bg-gradient-to-r from-orange-500 to-amber-500
                  text-white text-xs font-bold
                  flex items-center gap-1
                ">
                  <TrendingUp className="w-3 h-3" />
                  TRENDING
                </span>
              </div>
            )}

            {/* Image */}
            <div className="aspect-video bg-gradient-to-br from-terracotta-primary/20 to-savanna-gold/20 relative overflow-hidden">
              {launch.imageUrl ? (
                <img 
                  src={launch.imageUrl} 
                  alt={launch.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta-primary to-savanna-gold flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-clay-white/60 text-sm">No image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Title and Tagline */}
              <div className="mb-3">
                <h3 className="text-lg font-bold text-clay-white mb-1 group-hover:text-terracotta-primary transition-colors">
                  {launch.title}
                </h3>
                <p className="text-sm text-clay-white/70 line-clamp-2">
                  {launch.tagline}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-2 mb-3">
                <img 
                  src={launch.author.avatar} 
                  alt={launch.author.username} 
                  className="w-6 h-6 rounded-full border border-white/20" 
                />
                <span className="text-xs text-clay-white/60">{launch.author.username}</span>
              </div>

              {/* Category and Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="
                  px-2 py-1 rounded-full
                  bg-violet-500/20 text-violet-400
                  text-xs font-medium
                  border border-violet-500/30
                ">
                  {launch.category}
                </span>
                {launch.tags.slice(0, 2).map((tag, idx) => (
                  <span 
                    key={idx}
                    className="
                      px-2 py-1 rounded-full
                      bg-white/10 text-clay-white/60
                      text-xs
                      border border-white/10
                    "
                  >
                    #{tag}
                  </span>
                ))}
                {launch.tags.length > 2 && (
                  <span className="text-xs text-clay-white/40">+{launch.tags.length - 2}</span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => handleVote(launch.id, 'up')}
                    className="flex items-center gap-1 text-sm text-clay-white/60 hover:text-terracotta-primary transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{launch.upvotes}</span>
                  </button>
                  <button className="flex items-center gap-1 text-sm text-clay-white/60 hover:text-clay-white transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{launch.comments}</span>
                  </button>
                </div>
                <span className="text-xs text-clay-white/40">{launch.launchDate}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button 
                  onClick={() => toggleExpand(launch.id)}
                  className="
                    flex-1 py-2 rounded-lg
                    bg-white/5 hover:bg-white/10
                    border border-white/10 hover:border-white/20
                    text-sm font-medium text-clay-white
                    transition-all duration-200
                  "
                >
                  {expandedLaunch === launch.id ? 'Show Less' : 'Details'}
                </button>
                
                {launch.websiteUrl && (
                  <a 
                    href={launch.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      p-2 rounded-lg
                      bg-gradient-to-r from-terracotta-primary to-savanna-gold
                      hover:opacity-90
                      transition-opacity
                    "
                  >
                    <ExternalLink className="w-4 h-4 text-white" />
                  </a>
                )}
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedLaunch === launch.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <p className="text-sm text-clay-white/80 mb-4">
                      {launch.description}
                    </p>
                    
                    <div className="space-y-2">
                      {launch.websiteUrl && (
                        <a 
                          href={launch.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-terracotta-primary hover:text-terracotta-primary/80 transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          <span>Visit Website</span>
                        </a>
                      )}
                      
                      {launch.author.skills?.includes('github') && launch.websiteUrl?.includes('github') && (
                        <a 
                          href={launch.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-clay-white/60 hover:text-clay-white transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          <span>View on GitHub</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}