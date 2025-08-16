import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Flame, Clock, Target, TrendingUp, Eye, ChevronDown, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

// Mock data for demonstration - In production, this would come from your database
const mockLeaderboardData = [
  { id: "1", username: "User#1234", averageScore: 95, averageTime: 25, interviewsTaken: 45, streak: 12, badges: ["🏅", "📈"] },
  { id: "2", username: "User#5678", averageScore: 92, averageTime: 30, interviewsTaken: 38, streak: 8, badges: ["💡", "📈"] },
  { id: "3", username: "User#9012", averageScore: 89, averageTime: 28, interviewsTaken: 42, streak: 15, badges: ["🏅", "💡"] },
  { id: "4", username: "User#3456", averageScore: 87, averageTime: 35, interviewsTaken: 29, streak: 5, badges: ["📈"] },
  { id: "5", username: "User#7890", averageScore: 85, averageTime: 32, interviewsTaken: 33, streak: 9, badges: ["🏅"] },
  { id: "6", username: "User#2468", averageScore: 83, averageTime: 40, interviewsTaken: 25, streak: 3, badges: ["💡"] },
  { id: "7", username: "User#1357", averageScore: 81, averageTime: 38, interviewsTaken: 27, streak: 7, badges: ["📈"] },
  { id: "8", username: "User#9753", averageScore: 79, averageTime: 42, interviewsTaken: 22, streak: 4, badges: ["🏅"] },
  { id: "9", username: "User#8642", averageScore: 77, averageTime: 45, interviewsTaken: 19, streak: 2, badges: ["💡"] },
  { id: "10", username: "User#7531", averageScore: 75, averageTime: 47, interviewsTaken: 16, streak: 6, badges: ["📈"] },
];

interface LeaderboardUser {
  id: string;
  username: string;
  averageScore: number;
  averageTime: number;
  interviewsTaken: number;
  streak: number;
  badges: string[];
}

interface League {
  name: string;
  icon: React.ReactNode;
  color: string;
  bgGradient: string;
  borderColor: string;
  users: LeaderboardUser[];
  limit: number;
}

const calculateRankScore = (user: LeaderboardUser): number => {
  const timeFactor = Math.max(0, 100 - user.averageTime);
  return (user.averageScore * 0.6) + (user.interviewsTaken * 0.3) + (timeFactor * 0.1);
};

const getBadgeIcon = (badge: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    "🏅": <Medal className="h-3 w-3 text-yellow-400" />,
    "💡": <Target className="h-3 w-3 text-blue-400" />,
    "📈": <TrendingUp className="h-3 w-3 text-green-400" />
  };
  return iconMap[badge] || <Star className="h-3 w-3" />;
};

const Leaderboard = () => {
  const { analytics } = useAnalytics();
  const { user } = useAuth();
  const [selectedLeague, setSelectedLeague] = useState<string>("gold");
  const [showFullLeague, setShowFullLeague] = useState<{ [key: string]: boolean }>({});

  // Calculate user's stats from analytics
  const userStats = useMemo(() => {
    if (!analytics) return null;
    
    return {
      id: user?.id || "",
      username: `User#${user?.id?.slice(-4) || "0000"}`,
      averageScore: Math.round(analytics.averageScore),
      averageTime: Math.round(analytics.averageTimeSeconds),
      interviewsTaken: analytics.totalInterviews,
      streak: 5, // Mock streak - would be calculated from daily activity
      badges: ["📈"] // Mock badges - would be calculated from user behavior
    };
  }, [analytics, user]);

  // Sort users by rank score and divide into leagues
  const sortedUsers = useMemo(() => {
    const allUsers = [...mockLeaderboardData];
    if (userStats && !allUsers.find(u => u.id === userStats.id)) {
      allUsers.push(userStats);
    }
    return allUsers.sort((a, b) => calculateRankScore(b) - calculateRankScore(a));
  }, [userStats]);

  const leagues: League[] = useMemo(() => {
    const goldLimit = Math.min(100, Math.ceil(sortedUsers.length * 0.01)) || 3;
    const silverLimit = Math.min(200, Math.ceil(sortedUsers.length * 0.05)) || 5;
    
    return [
      {
        name: "Gold League",
        icon: <Crown className="h-5 w-5" />,
        color: "text-yellow-400",
        bgGradient: "from-yellow-500/20 to-amber-600/20",
        borderColor: "border-yellow-500/30",
        users: sortedUsers.slice(0, goldLimit),
        limit: goldLimit
      },
      {
        name: "Silver League",
        icon: <Trophy className="h-5 w-5" />,
        color: "text-gray-300",
        bgGradient: "from-gray-400/20 to-slate-500/20",
        borderColor: "border-gray-400/30",
        users: sortedUsers.slice(goldLimit, goldLimit + silverLimit),
        limit: silverLimit
      },
      {
        name: "Bronze League",
        icon: <Medal className="h-5 w-5" />,
        color: "text-amber-600",
        bgGradient: "from-amber-600/20 to-orange-700/20",
        borderColor: "border-amber-600/30",
        users: sortedUsers.slice(goldLimit + silverLimit),
        limit: sortedUsers.length - goldLimit - silverLimit
      }
    ];
  }, [sortedUsers]);

  // Find user's current league and position
  const userPosition = useMemo(() => {
    if (!userStats) return null;
    
    const userRank = sortedUsers.findIndex(u => u.id === userStats.id) + 1;
    let currentLeague = "Bronze League";
    let nextLeague = null;
    let spotsToNext = 0;
    
    if (userRank <= leagues[0].limit) {
      currentLeague = "Gold League";
    } else if (userRank <= leagues[0].limit + leagues[1].limit) {
      currentLeague = "Silver League";
      nextLeague = "Gold League";
      spotsToNext = userRank - leagues[0].limit;
    } else {
      currentLeague = "Bronze League";
      nextLeague = "Silver League";
      spotsToNext = userRank - (leagues[0].limit + leagues[1].limit);
    }
    
    return {
      rank: userRank,
      league: currentLeague,
      nextLeague,
      spotsToNext,
      totalUsers: sortedUsers.length
    };
  }, [userStats, sortedUsers, leagues]);

  const getProgressMessage = () => {
    if (!userPosition) return "";
    
    if (userPosition.league === "Gold League") {
      return "🔥 Congrats, you made it to Gold League!";
    } else if (userPosition.spotsToNext <= 3) {
      return `${userPosition.spotsToNext} more spots to reach ${userPosition.nextLeague}!`;
    } else if (userPosition.league === "Bronze League") {
      return "Keep practicing to climb the ranks!";
    }
    return `You're ${userPosition.spotsToNext} spots away from ${userPosition.nextLeague}`;
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

  const renderLeagueTable = (league: League) => {
    const displayUsers = showFullLeague[league.name] ? league.users : league.users.slice(0, 10);
    
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
                {league.users.length} users
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
                    const globalRank = sortedUsers.findIndex(u => u.id === leagueUser.id) + 1;
                    const isCurrentUser = leagueUser.id === userStats?.id;
                    
                    return (
                      <motion.tr
                        key={leagueUser.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={cn(
                          "border-white/5 hover:bg-white/5 transition-colors",
                          isCurrentUser && "bg-primary/10 border-primary/20"
                        )}
                      >
                        <TableCell className="font-mono">
                          <div className="flex items-center gap-2">
                            #{globalRank}
                            {globalRank <= 3 && (
                              <Trophy className={cn(
                                "h-4 w-4",
                                globalRank === 1 ? "text-yellow-400" :
                                globalRank === 2 ? "text-gray-300" : "text-amber-600"
                              )} />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={cn(isCurrentUser && "text-primary font-semibold")}>
                              {leagueUser.username}
                            </span>
                            <div className="flex gap-1">
                              {leagueUser.badges.map((badge, i) => (
                                <div key={i} className="tooltip">
                                  {getBadgeIcon(badge)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            {leagueUser.averageScore}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                            {formatTime(leagueUser.averageTime)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {leagueUser.interviewsTaken}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Flame className="h-4 w-4 text-orange-400" />
                            <span className="text-orange-400 font-semibold">
                              {leagueUser.streak}
                            </span>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            {league.users.length > 10 && (
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
    <div className="space-y-6">
      {/* User Position Card */}
      {userPosition && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-card border-primary/30 border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Trophy className="h-5 w-5 text-primary" />
                </div>
                <span className="text-gradient">Your Position</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-gradient">
                    Rank #{userPosition.rank}
                  </div>
                  <div className="text-muted-foreground">
                    {userPosition.league}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {userStats?.averageScore}% avg score
                  </div>
                  <div className="text-muted-foreground">
                    {userStats?.interviewsTaken} interviews completed
                  </div>
                </div>
              </div>
              
              {userPosition.nextLeague && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {userPosition.nextLeague}</span>
                    <span>{userPosition.spotsToNext} spots to go</span>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (userPosition.spotsToNext / userPosition.rank) * 100)} 
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
      <div className="flex gap-2 p-1 bg-muted/20 rounded-lg">
        {leagues.map((league) => (
          <button
            key={league.name}
            onClick={() => setSelectedLeague(league.name.toLowerCase().split(' ')[0])}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all",
              selectedLeague === league.name.toLowerCase().split(' ')[0]
                ? `bg-gradient-to-r ${league.bgGradient} text-white border ${league.borderColor}`
                : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
            )}
          >
            {league.icon}
            <span className="font-medium">{league.name}</span>
            <Badge variant="secondary" className="text-xs">
              {league.users.length}
            </Badge>
          </button>
        ))}
      </div>

      {/* League Tables */}
      <AnimatePresence mode="wait">
        {leagues
          .filter(league => selectedLeague === league.name.toLowerCase().split(' ')[0])
          .map(league => renderLeagueTable(league))}
      </AnimatePresence>

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
              <strong>Badge Legend:</strong> 🏅 Fast Thinker (&lt;30s) • 💡 Deep Thinker (&gt;60s) • 📈 Consistency Champ (10+ interviews/week)
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Leaderboard;