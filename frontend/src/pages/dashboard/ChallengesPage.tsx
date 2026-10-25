import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
  User as UserIcon,
  Crown
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface ChallengeItem {
  id: number;
  challenge_code: string;
  title: string;
  description: string;
  category: string;
  target: number;
  progress: number;
  is_completed: boolean;
  points_reward: number;
  completed_at?: string;
}

interface LeaderboardUser {
  rank: number;
  user_id: number;
  full_name: string;
  eco_points: number;
  activities_count: number;
}

export const ChallengesPage: React.FC = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [chData, lbData] = await Promise.all([
          apiRequest<ChallengeItem[]>('/api/v1/gamification/challenges'),
          apiRequest<LeaderboardUser[]>('/api/v1/gamification/leaderboard'),
        ]);
        setChallenges(chData);
        setLeaderboard(lbData);
      } catch (err) {
        console.error('Failed to load gamification data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getTier = (points: number) => {
    if (points >= 500) return { name: 'Planet Hero', color: 'bg-emerald-600 text-white' };
    if (points >= 250) return { name: 'Eco Guardian', color: 'bg-teal-600 text-white' };
    if (points >= 100) return { name: 'Active Recycler', color: 'bg-eco-600 text-white' };
    return { name: 'Green Seedling', color: 'bg-lime-600 text-white' };
  };

  const currentTier = getTier(user?.eco_points || 0);

  return (
    <div className="space-y-8">
      {/* Header & Balance Card */}
      <div className="bg-gradient-to-r from-eco-900 via-eco-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-eco-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold backdrop-blur-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>Gamified Sustainability</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Eco-Challenges & Rewards</h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-lg leading-relaxed">
            Complete milestones, learn sustainable disposal habits, and unlock eco-badges. Points are awarded through
            server-validated activities.
          </p>
        </div>

        {/* User Balance Capsule */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 text-center shrink-0 w-full sm:w-auto">
          <span className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider block mb-1">
            Your Balance
          </span>
          <div className="text-3xl font-black text-emerald-300">
            {user?.eco_points ?? 0}
          </div>
          <span className={`inline-block mt-2 text-[10px] font-bold px-3 py-0.5 rounded-full ${currentTier.color}`}>
            {currentTier.name}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Challenges List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-eco-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700" />
              Active Eco-Challenges
            </h3>
            <span className="text-xs text-textSecondary">
              {challenges.filter((c) => c.is_completed).length} / {challenges.length} Completed
            </span>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white p-5 rounded-2xl border border-[#E3EAE4] animate-pulse h-24" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {challenges.map((ch) => {
                const percent = Math.min(100, Math.round((ch.progress / ch.target) * 100));
                return (
                  <div
                    key={ch.id}
                    className={`bg-white p-5 rounded-2xl border transition-all ${
                      ch.is_completed ? 'border-emerald-200 bg-emerald-50/20' : 'border-[#E3EAE4] hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {ch.category}
                          </span>
                          <h4 className="text-sm font-bold text-eco-900">{ch.title}</h4>
                        </div>
                        <p className="text-xs text-textSecondary">{ch.description}</p>
                      </div>

                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                        +{ch.points_reward} pts
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-textSecondary">
                        <span>Progress: {ch.progress} / {ch.target}</span>
                        <span>{ch.is_completed ? 'Completed' : `${percent}%`}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            ch.is_completed ? 'bg-emerald-600' : 'bg-eco-700'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaderboard Table */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E3EAE4] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-eco-900">Community Leaderboard</h3>
              </div>
              <span className="text-[11px] text-textSecondary">Top Recyclers</span>
            </div>

            <div className="space-y-2.5 text-xs">
              {leaderboard.map((item) => {
                const isCurrentUser = item.user_id === user?.id;
                return (
                  <div
                    key={item.user_id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      isCurrentUser
                        ? 'bg-emerald-50 border-emerald-200 font-bold'
                        : 'bg-surface-soft border-surface-border'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                          item.rank === 1
                            ? 'bg-amber-400 text-amber-950'
                            : item.rank === 2
                            ? 'bg-gray-300 text-gray-800'
                            : item.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {item.rank}
                      </span>
                      <div className="truncate">
                        <span className="text-eco-900 truncate block max-w-[130px]">
                          {item.full_name} {isCurrentUser && '(You)'}
                        </span>
                        <span className="text-[10px] text-textSecondary font-normal">
                          {item.activities_count} activities logged
                        </span>
                      </div>
                    </div>

                    <span className="font-extrabold text-emerald-800 shrink-0">
                      {item.eco_points} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-[11px] text-textSecondary text-center">
            Points are updated automatically after every verified activity and scan.
          </div>
        </div>
      </div>
    </div>
  );
};
