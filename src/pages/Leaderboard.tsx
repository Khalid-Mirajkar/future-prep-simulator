import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Flame, Clock, Target, TrendingUp, Eye, ChevronDown, Star, ArrowLeft, Search, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Constants for ranking calculations
const BASELINE_TIME_SECONDS = 90;

interface LeaderRow {
  rank: number;
  username_masked: string;
  average_score: number;
  average_time_secs: number;
  interviews_taken: number;
  badges: string[];
  is_bot?: boolean;
}

interface CurrentUser {
  user_id: string;
  league: 'bronze' | 'silver' | 'gold';
  rank: number;
  waitlist_position?: number;
  average_score: number;
  average_time_secs: number;
  interviews_taken: number;
  streak_days: number;
  at_risk_until?: string;
  next_league_hint: { type: 'interviews' | 'score'; value: number };
}

interface LeaderboardData {
  currentUser: CurrentUser | null;
  leagues: {
    bronze: { total: number; top10: LeaderRow[] };
    silver: { total: number; top10: LeaderRow[] };
    gold: { total: number; top10: LeaderRow[] };
  };
}

interface League {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  emoji: string;
}

const getBadgeIcon = (badge: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    "fast_thinker": <Medal className="h-3 w-3 text-yellow-400" />,
    "deep_thinker": <Target className="h-3 w-3 text-blue-400" />,
    "consistency_champ": <TrendingUp className="h-3 w-3 text-green-400" />
  };
  return iconMap[badge] || <Star className="h-3 w-3" />;
};

const getBadgeTooltip = (badge: string) => {
  const tooltipMap: { [key: string]: string } = {
    "fast_thinker": "Fast Thinker (<30s average)",
    "deep_thinker": "Deep Thinker (>60s average)",
    "consistency_champ": "Consistency Champ (10+ interviews)"
  };
  return tooltipMap[badge] || badge;
};

const Leaderboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedLeague, setSelectedLeague] = useState<string>("bronze");
  const [showFullLeague, setShowFullLeague] = useState<{ [key: string]: boolean }>({});
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke('leaderboard-snapshot', {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (error) throw error;
        
        setLeaderboardData(data);
        
        // Set initial league tab to user's current league
        if (data.currentUser) {
          setSelectedLeague(data.currentUser.league);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [user]);

  const leagues: League[] = [
    {
      name: "Gold League",
      icon: <Crown className="h-5 w-5" />,
      color: "text-yellow-400",
      bgGradient: "from-yellow-500/20 to-amber-600/20",
      borderColor: "border-yellow-500/30",
      emoji: "🥇"
    },
    {
      name: "Silver League",
      icon: <Trophy className="h-5 w-5" />,
      color: "text-gray-300",
      bgGradient: "from-gray-400/20 to-slate-500/20",
      borderColor: "border-gray-400/30",
      emoji: "🥈"
    },
    {
      name: "Bronze League",
      icon: <Medal className="h-5 w-5" />,
      color: "text-amber-600",
      bgGradient: "from-amber-600/20 to-orange-700/20",
      borderColor: "border-amber-600/30",
      emoji: "🥉"
    }
  ];

  const currentUser = leaderboardData?.currentUser;
  const currentLeague = leagues.find(l => l.name.toLowerCase().includes(selectedLeague));

  const getProgressMessage = () => {
    if (!currentUser) return "";
    
    if (currentUser.league === "gold") {
      return "🔥 Congrats, you made it to Gold League!";
    } else if (currentUser.next_league_hint.type === 'interviews') {
      return `${currentUser.next_league_hint.value} more interviews to reach ${currentUser.league === 'bronze' ? 'Silver' : 'Gold'}!`;
    } else {
      return `Improve average score by +${currentUser.next_league_hint.value}% to reach ${currentUser.league === 'bronze' ? 'Silver' : 'Gold'}`;
    }
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const toggleFullLeague = (leagueName: string) => {
    setShowFullLeague(prev => ({
      ...prev,
      [leagueName]: !prev[leagueName]
    }));
  };

  const renderLeagueTable = (leagueKey: string) => {
    if (!leaderboardData) return null;
    
    const league = leagues.find(l => l.name.toLowerCase().includes(leagueKey));
    const leagueData = leaderboardData.leagues[leagueKey as keyof typeof leaderboardData.leagues];
    const displayUsers = showFullLeague[league?.name || ''] ? leagueData.top10 : leagueData.top10.slice(0, 10);
    
    if (!league) return null;

    return (
      <motion.div
        key={league.name}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <Card className={cn("glass-card", league.borderColor, "border-2")}>
          <CardHeader>
            <CardTitle className={cn("flex items-center gap-3", league.color)}>
              {league.icon}
              <span className="text-gradient">{league.name}</span>
              <Badge variant="secondary" className="ml-auto">
                {leagueData.total} users
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-white/10">
                    <TableHead className="text-muted-foreground">Rank</TableHead>
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">Avg Score</TableHead>
                    <TableHead className="text-muted-foreground">Avg Time</TableHead>
                    <TableHead className="text-muted-foreground">Interviews</TableHead>
                    <TableHead className="text-muted-foreground">Streak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayUsers.map((leagueUser, index) => {
                    const isCurrentUser = currentUser?.user_id && 
                      leagueUser.username_masked === `User#${currentUser.user_id.slice(-4)}`;
                    
                    return (
                      <motion.tr
                        key={`${leagueUser.rank}-${leagueUser.username_masked}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "border-white/5 hover:bg-white/5 transition-colors",
                          isCurrentUser && "bg-primary/10 border-primary/20",
                          leagueUser.is_bot && "opacity-75"
                        )}
                      >
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-2">
                            #{leagueUser.rank}
                            {leagueUser.rank <= 3 && (
                              <Trophy className={cn(
                                "h-4 w-4",
                                leagueUser.rank === 1 ? "text-yellow-400" :
                                leagueUser.rank === 2 ? "text-gray-300" : "text-amber-600"
                              )} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              isCurrentUser && "text-primary font-semibold",
                              leagueUser.is_bot && "italic text-muted-foreground"
                            )}>
                              {leagueUser.username_masked}
                            </span>
                            <TooltipProvider>
                              <div className="flex gap-1">
                                {leagueUser.badges.map((badge, i) => (
                                  <Tooltip key={i}>
                                    <TooltipTrigger asChild>
                                      <div className="cursor-help">
                                        {getBadgeIcon(badge)}
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{getBadgeTooltip(badge)}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                ))}
                              </div>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            {leagueUser.average_score}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                            {formatTime(leagueUser.average_time_secs)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {leagueUser.interviews_taken}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-400" />
                            <span className="text-orange-400 font-semibold">
                              {isCurrentUser ? (currentUser?.streak_days || 0) : '—'}
                            </span>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {leagueData.total > 10 && (
              <div className="mt-4 text-center">
                <Button
                  variant="ghost"
                  onClick={() => toggleFullLeague(league.name)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showFullLeague[league.name] ? "Show Top 10" : "View Full League"}
                  <ChevronDown className={cn(
                    "h-4 w-4 ml-2 transition-transform",
                    showFullLeague[league.name] && "rotate-180"
                  )} />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative">
      {/* Background with radial gradient matching landing page */}
      <div 
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(circle at 50% 50%, #121318 0%, #0D0D0D 100%)"
        }}
      />
      
      {/* Back to Dashboard Button */}
      <div className="relative z-10 p-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all duration-300 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Back to Dashboard
          </Button>
        </motion.div>

        <div className="space-y-6">
          {loading && (
            <div className="space-y-4">
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {error && (
            <Card className="glass-card border-red-500/30">
              <CardContent className="p-6">
                <p className="text-red-400">Error loading leaderboard: {error}</p>
              </CardContent>
            </Card>
          )}

          {/* User Position Card */}
          {currentUser && !loading && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="glass-card border-primary/30 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <span className="text-2xl">
                        {leagues.find(l => l.name.toLowerCase().includes(currentUser.league))?.emoji}
                      </span>
                    </div>
                    <span className="text-gradient">Your Position</span>
                    {currentUser.waitlist_position && (
                      <Badge variant="outline" className="ml-auto">
                        Waitlist #{currentUser.waitlist_position}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gradient">
                        Rank #{currentUser.rank}
                      </div>
                      <div className="text-muted-foreground capitalize">
                        {currentUser.league} League
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {currentUser.average_score}% avg score
                      </div>
                      <div className="text-muted-foreground">
                        {currentUser.interviews_taken} interviews completed
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 cursor-help">
                            <Flame className="h-5 w-5 text-orange-400" />
                            <span className="text-lg font-bold text-orange-400">
                              {currentUser.streak_days}
                            </span>
                            <span className="text-sm text-muted-foreground">day streak</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Consecutive days with at least one completed interview</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {currentUser.league !== 'gold' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress to {currentUser.league === 'bronze' ? 'Silver' : 'Gold'} League</span>
                        <span>{getProgressMessage()}</span>
                      </div>
                      <Progress 
                        value={currentUser.league === 'bronze' ? 33 : 66} 
                        className="h-2"
                        indicatorClassName="bg-gradient-to-r from-primary to-primary/80"
                      />
                    </div>
                  )}
                  
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-center font-medium text-primary">
                      {getProgressMessage()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* League Selection Tabs */}
          {leaderboardData && !loading && (
            <div className="flex gap-2 p-1 bg-muted/20 rounded-lg">
              {leagues.map((league) => {
                const leagueKey = league.name.toLowerCase().split(' ')[0];
                const leagueData = leaderboardData.leagues[leagueKey as keyof typeof leaderboardData.leagues];
                return (
                  <button
                    key={league.name}
                    onClick={() => setSelectedLeague(leagueKey)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all",
                      selectedLeague === leagueKey
                        ? `bg-gradient-to-r ${league.bgGradient} text-white border ${league.borderColor}`
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="text-lg">{league.emoji}</span>
                    <span className="font-medium">{league.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {leagueData.total}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}

          {/* League Tables */}
          {!loading && (
            <AnimatePresence mode="wait">
              {renderLeagueTable(selectedLeague)}
            </AnimatePresence>
          )}

          {/* Ranking Formula Info */}
          <Card className="glass-card border-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-gradient">Ranking Formula</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="font-semibold text-green-400">Average Score</div>
                  <div className="text-muted-foreground">60% weight</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="font-semibold text-blue-400">Interviews Taken</div>
                  <div className="text-muted-foreground">30% weight</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="font-semibold text-purple-400">Time Factor</div>
                  <div className="text-muted-foreground">10% weight</div>
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-muted/10 border border-muted/20">
                <div className="text-center text-sm text-muted-foreground">
                  <strong>Badge Legend:</strong> 🏅 Fast Thinker (&lt;30s) • 💡 Deep Thinker (&gt;60s) • 📈 Consistency Champ (10+ interviews)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;