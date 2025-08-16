import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Trophy, Medal, Award, Flame, Clock, Target, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import CustomLoader from '@/components/CustomLoader';

interface LeaderRow {
  rank: number;
  username_masked: string;
  average_score: number;
  average_time_secs: number;
  interviews_taken: number;
  badges: string[];
  is_bot?: boolean;
}

interface LeaderboardData {
  currentUser: {
    user_id: string;
    league: 'bronze' | 'silver' | 'gold';
    rank: number;
    waitlist_position?: number;
    average_score: number;
    average_time_secs: number;
    interviews_taken: number;
    streak_days: number;
    percentile: number;
    next_league_hint: { type: 'interviews' | 'score'; value: number };
  } | null;
  leagues?: {
    [key: string]: {
      users: LeaderRow[];
      total: number;
      hasMore: boolean;
    };
  };
  users?: LeaderRow[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  leagueCounts?: {
    gold: number;
    silver: number;
    bronze: number;
  };
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('bronze');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedData, setPaginatedData] = useState<{ [key: string]: LeaderRow[] }>({});
  const [leagueCounts, setLeagueCounts] = useState({ gold: 0, silver: 0, bronze: 0 });

  const fetchLeaderboardData = async (league?: string, page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (league && league !== 'overview') {
        params.append('league', league);
        params.append('page', page.toString());
        params.append('limit', '50');
      }
      
      const { data: leaderboardData, error } = await supabase.functions.invoke('leaderboard-snapshot', {
        body: params.toString() ? { query: params.toString() } : {}
      });
      
      if (error) {
        console.error('Error fetching leaderboard:', error);
        return;
      }

      if (league && league !== 'overview') {
        // Paginated league data
        setPaginatedData(prev => ({
          ...prev,
          [league]: page === 1 ? leaderboardData.users : [...(prev[league] || []), ...leaderboardData.users]
        }));
        setLeagueCounts(prev => leaderboardData.leagueCounts ?? prev);
        if (page === 1) {
          setData({ ...leaderboardData, leagues: undefined });
        }
      } else {
        // Overview data
        setData(leaderboardData);
        setLeagueCounts({
          gold: leaderboardData.leagues?.gold?.total || 0,
          silver: leaderboardData.leagues?.silver?.total || 0,
          bronze: leaderboardData.leagues?.bronze?.total || 0
        });
      }
      
      // Set active tab to user's current league on first load
      if (leaderboardData?.currentUser?.league && !league) {
        setActiveTab(leaderboardData.currentUser.league);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
    if (value !== 'overview') {
      fetchLeaderboardData(value, 1);
    }
  };

  const loadMoreUsers = () => {
    if (activeTab !== 'overview') {
      setCurrentPage(prev => prev + 1);
      fetchLeaderboardData(activeTab, currentPage + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getUserPositionText = () => {
    if (!data?.currentUser) return '';
    const { rank, league, percentile } = data.currentUser;
    
    if (league === 'gold') {
      return `You are #${rank} in Gold League — Top ${Math.round(10 - percentile)}% globally!`;
    } else if (league === 'silver') {
      return `You are #${rank} in Silver League — Top ${Math.round(30 - percentile)}% globally!`;
    } else {
      return `You are #${rank} in Bronze League — Keep practicing to reach Silver!`;
    }
  };

  const renderBadges = (badges: string[]) => {
    const badgeConfig = {
      fast_thinker: { icon: '🏅', label: 'Fast Thinker', tooltip: 'Average response time under 30 seconds' },
      deep_thinker: { icon: '💡', label: 'Deep Thinker', tooltip: 'Takes time to think through answers (60+ seconds)' },
      consistency_champ: { icon: '📈', label: 'Consistency Champ', tooltip: 'Completed 10+ interviews' }
    };

    return badges.map((badge) => {
      const config = badgeConfig[badge as keyof typeof badgeConfig];
      if (!config) return null;

      return (
        <TooltipProvider key={badge}>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs">
                {config.icon}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{config.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    });
  };

  const renderLeagueTable = (users: LeaderRow[], showPagination = false) => (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Time</TableHead>
            <TableHead className="text-center">Interviews</TableHead>
            <TableHead className="text-center">Badges</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, index) => (
            <TableRow 
              key={user.rank} 
              className={`transition-colors ${
                data?.currentUser && user.username_masked === `User#${data.currentUser.user_id.slice(-4)}` 
                  ? 'bg-primary/10 hover:bg-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {user.rank <= 3 && (
                    <span className="text-lg">
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                    </span>
                  )}
                  #{user.rank}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {user.username_masked}
                  {data?.currentUser && user.username_masked === `User#${data.currentUser.user_id.slice(-4)}` && (
                    <Badge variant="secondary" className="text-xs">You</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center font-medium">{user.average_score}%</TableCell>
              <TableCell className="text-center">{formatTime(user.average_time_secs)}</TableCell>
              <TableCell className="text-center">{user.interviews_taken}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-1">
                  {renderBadges(user.badges)}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {showPagination && data?.pagination?.hasMore && (
        <div className="flex justify-center">
          <Button 
            onClick={loadMoreUsers} 
            variant="outline" 
            disabled={loading}
            className="hover:bg-muted"
          >
            {loading ? 'Loading...' : 'Load More Users'}
          </Button>
        </div>
      )}
      
      {showPagination && data?.pagination && (
        <p className="text-center text-sm text-muted-foreground">
          Showing {Math.min(50 * currentPage, data.pagination.total)} of {data.pagination.total} users
        </p>
      )}
    </div>
  );

  const getLeagueIcon = (league: string) => {
    switch (league) {
      case 'gold': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'silver': return <Medal className="w-5 h-5 text-gray-400" />;
      case 'bronze': return <Award className="w-5 h-5 text-amber-600" />;
      default: return null;
    }
  };

  const getProgressValue = () => {
    if (!data?.currentUser) return 0;
    const { league, percentile } = data.currentUser;
    
    if (league === 'gold') return 100;
    if (league === 'silver') return Math.max(70, 100 - percentile);
    return Math.max(0, 70 - percentile);
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 flex items-center justify-center">
        <CustomLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Back to Dashboard Button */}
        <Button
          onClick={() => navigate('/dashboard')}
          variant="ghost"
          className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* User Stats Card */}
        {data?.currentUser && (
          <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {getLeagueIcon(data.currentUser.league)}
                <span className="text-gradient bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Your Performance
                </span>
                <Badge variant="outline" className="ml-auto">
                  {data.currentUser.league.charAt(0).toUpperCase() + data.currentUser.league.slice(1)} League
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">#{data.currentUser.rank}</div>
                  <div className="text-sm text-muted-foreground">Global Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{data.currentUser.average_score}%</div>
                  <div className="text-sm text-muted-foreground">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{formatTime(data.currentUser.average_time_secs)}</div>
                  <div className="text-sm text-muted-foreground">Avg Time</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-2xl font-bold text-orange-400">{data.currentUser.streak_days}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">Day Streak</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to next league</span>
                  <span>{Math.round(getProgressValue())}%</span>
                </div>
                <Progress value={getProgressValue()} className="h-2" />
                <p className="text-sm text-muted-foreground text-center">
                  {getUserPositionText()}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-lg mx-auto mb-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="gold" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Gold ({leagueCounts.gold})
            </TabsTrigger>
            <TabsTrigger value="silver" className="flex items-center gap-2">
              <Medal className="w-4 h-4" />
              Silver ({leagueCounts.silver})
            </TabsTrigger>
            <TabsTrigger value="bronze" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Bronze ({leagueCounts.bronze})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {data?.currentUser && (
              <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <p className="text-lg font-medium text-primary">
                      {getUserPositionText()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <Trophy className="w-5 h-5" />
                    Gold League (Top 10%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderLeagueTable(data?.leagues?.gold?.users || [])}
                </CardContent>
              </Card>

              <Card className="border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700">
                    <Medal className="w-5 h-5" />
                    Silver League (Next 20%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderLeagueTable(data?.leagues?.silver?.users || [])}
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <Award className="w-5 h-5" />
                    Bronze League (Bottom 70%)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderLeagueTable(data?.leagues?.bronze?.users || [])}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="gold" className="space-y-6">
            <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Trophy className="w-5 h-5" />
                  Gold League - Top 10%
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderLeagueTable(paginatedData.gold || [], true)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="silver" className="space-y-6">
            <Card className="border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-700">
                  <Medal className="w-5 h-5" />
                  Silver League - Next 20%
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderLeagueTable(paginatedData.silver || [], true)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bronze" className="space-y-6">
            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800">
                  <Award className="w-5 h-5" />
                  Bronze League - Bottom 70%
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderLeagueTable(paginatedData.bronze || [], true)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;