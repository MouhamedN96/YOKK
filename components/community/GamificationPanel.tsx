'use client';

import React, { useState } from 'react';
import { Trophy, Star, Award, Zap, Flame, Crown, Heart, MessageCircle, TrendingUp, Target, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Achievement, LeaderboardEntry } from '@/types/community';

interface GamificationPanelProps {
  user: User;
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  onAchievementUnlock?: (achievementId: string) => void;
}

export default function GamificationPanel({ 
  user, 
  achievements, 
  leaderboard,
  onAchievementUnlock
}: GamificationPanelProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'leaderboard'>('profile');
  const [showAchievementModal, setShowAchievementModal] = useState<string | null>(null);

  const unlockedAchievements = achievements.filter(a => a.unlockedAt);
  const lockedAchievements = achievements.filter(a => !a.unlockedAt);

  const handleAchievementClick = (achievementId: string) => {
    setShowAchievementModal(achievementId);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {[
          { id: 'profile', label: 'Profile', icon: Star },
          { id: 'achievements', label: 'Achievements', icon: Award },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center gap-2 px-4 py-3 font-medium text-sm
                transition-colors duration-200
                ${activeTab === tab.id
                  ? 'text-clay-white border-b-2 border-terracotta-primary'
                  : 'text-clay-white/60 hover:text-clay-white'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {/* Profile Tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* User Stats Card */}
              <div className="
                bg-gradient-to-br from-terracotta-primary/10 to-savanna-gold/10
                border border-terracotta-primary/30 rounded-xl
                p-6
              ">
                <div className="flex items-center gap-6">
                  <img 
                    src={user.avatar} 
                    alt={user.username} 
                    className="w-20 h-20 rounded-full border-4 border-terracotta-primary/30" 
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-clay-white">{user.username}</h2>
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-terracotta-primary/20 text-terracotta-primary text-sm font-medium">
                        <Crown className="w-4 h-4" />
                        <span>Level {user.level}</span>
                      </div>
                    </div>
                    
                    <p className="text-clay-white/60 mb-4">{user.bio || 'A passionate developer contributing to the African tech ecosystem'}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-clay-white">{user.xp}</div>
                        <div className="text-xs text-clay-white/60">XP</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-clay-white">{user.streak}</div>
                        <div className="text-xs text-clay-white/60">Day Streak</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-clay-white">{unlockedAchievements.length}</div>
                        <div className="text-xs text-clay-white/60">Achievements</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-clay-white">127</div>
                        <div className="text-xs text-clay-white/60">Contributions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="
                bg-white/5 backdrop-blur-sm
                border border-white/10 rounded-xl
                p-6
              ">
                <h3 className="text-lg font-semibold text-clay-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recent Activity
                </h3>
                
                <div className="space-y-4">
                  {[
                    { action: 'answered a question', time: '2 hours ago', points: 10 },
                    { action: 'received upvote', time: '4 hours ago', points: 5 },
                    { action: 'completed daily streak', time: '1 day ago', points: 25 },
                    { action: 'published a launch', time: '2 days ago', points: 50 },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-clay-white">{activity.action}</p>
                        <p className="text-xs text-clay-white/50">{activity.time}</p>
                      </div>
                      <div className="flex items-center gap-1 text-green-400">
                        <Star className="w-4 h-4" />
                        <span className="text-sm">+{activity.points}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-clay-white flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Your Achievements
                </h3>
                <div className="text-sm text-clay-white/60">
                  {unlockedAchievements.length}/{achievements.length} unlocked
                </div>
              </div>

              {/* Unlocked Achievements */}
              {unlockedAchievements.length > 0 && (
                <div>
                  <h4 className="text-md font-medium text-clay-white/80 mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-terracotta-primary" />
                    Unlocked ({unlockedAchievements.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {unlockedAchievements.map((achievement) => {
                      const Icon = achievement.type === 'badge' ? Award : 
                                  achievement.type === 'milestone' ? Star : 
                                  Heart;
                      return (
                        <motion.div
                          key={achievement.id}
                          whileHover={{ scale: 1.02 }}
                          className="
                            group relative overflow-hidden
                            bg-gradient-to-br from-terracotta-primary/10 to-savanna-gold/10
                            border border-terracotta-primary/30 rounded-xl
                            p-4 cursor-pointer
                          "
                          onClick={() => handleAchievementClick(achievement.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-terracotta-primary/20">
                              <Icon className="w-6 h-6 text-terracotta-primary" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-clay-white">{achievement.title}</h4>
                              <p className="text-sm text-clay-white/70">{achievement.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 text-xs text-terracotta-primary">
                                  <Star className="w-3 h-3" />
                                  <span>+{achievement.xpReward} XP</span>
                                </div>
                                <span className="text-xs text-clay-white/50">{achievement.unlockedAt}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Locked Achievements */}
              {lockedAchievements.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-md font-medium text-clay-white/80 mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-clay-white/40" />
                    Locked ({lockedAchievements.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lockedAchievements.map((achievement) => {
                      const Icon = achievement.type === 'badge' ? Award : 
                                  achievement.type === 'milestone' ? Star : 
                                  Heart;
                      return (
                        <div
                          key={achievement.id}
                          className="
                            group relative overflow-hidden
                            bg-white/5 backdrop-blur-sm
                            border border-white/10 rounded-xl
                            p-4 opacity-60
                          "
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-white/10">
                              <Icon className="w-6 h-6 text-clay-white/40" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-clay-white/60">{achievement.title}</h4>
                              <p className="text-sm text-clay-white/40">{achievement.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1 text-xs text-clay-white/40">
                                  <Star className="w-3 h-3" />
                                  <span>+{achievement.xpReward} XP</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-clay-white flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Community Leaderboard
                </h3>
                <div className="text-sm text-clay-white/60">
                  Top {leaderboard.length} contributors
                </div>
              </div>

              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      flex items-center gap-4 p-4 rounded-xl
                      ${entry.user.id === user.id
                        ? 'bg-gradient-to-r from-terracotta-primary/10 to-savanna-gold/10 border border-terracotta-primary/30'
                        : 'bg-white/5 backdrop-blur-sm border border-white/10'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                        index === 1 ? 'bg-gray-500/20 text-gray-400' :
                        index === 2 ? 'bg-amber-700/20 text-amber-500' :
                        'bg-white/10 text-clay-white/60'}
                    `}>
                      {index + 1}
                    </div>
                    
                    <img 
                      src={entry.user.avatar} 
                      alt={entry.user.username} 
                      className="w-10 h-10 rounded-full border border-white/20" 
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${entry.user.id === user.id ? 'text-terracotta-primary' : 'text-clay-white'}`}>
                          {entry.user.username}
                        </span>
                        {index < 3 && (
                          <div className={`
                            w-5 h-5 rounded-full flex items-center justify-center
                            ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                              index === 1 ? 'bg-gray-500/20 text-gray-400' :
                              'bg-amber-700/20 text-amber-500'}
                          `}>
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-clay-white/60">
                        Level {entry.user.level} • {entry.user.xp} XP
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-semibold text-clay-white">{entry.xp.toLocaleString()}</div>
                      <div className="text-xs text-clay-white/60">{entry.achievements} achievements</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchievementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAchievementModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="
                bg-charcoal-base rounded-xl p-6 max-w-md w-full
                border border-white/10
              "
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-terracotta-primary to-savanna-gold flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-clay-white mb-2">
                  Achievement Unlocked!
                </h3>
                
                <p className="text-clay-white/80 mb-4">
                  Congratulations! You've earned the "<strong>First Contribution</strong>" achievement.
                </p>
                
                <div className="flex items-center justify-center gap-2 text-terracotta-primary font-semibold mb-6">
                  <Star className="w-5 h-5" />
                  <span>+50 XP</span>
                </div>
                
                <button
                  onClick={() => setShowAchievementModal(null)}
                  className="
                    w-full py-3 rounded-lg
                    bg-gradient-to-r from-terracotta-primary to-savanna-gold
                    text-white font-semibold
                    hover:opacity-90 transition-opacity
                  "
                >
                  Celebrate!
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Lock icon for locked achievements
const Lock = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);