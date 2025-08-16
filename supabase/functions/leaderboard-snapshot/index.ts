import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Constants for ranking calculations
const BASELINE_TIME_SECONDS = 90;
const ACTIVE_DAYS_THRESHOLD = 14;
const GOLD_PERCENTAGE = 0.10; // Top 10%
const SILVER_PERCENTAGE = 0.20; // Next 20%
const BRONZE_PERCENTAGE = 0.70; // Bottom 70%
const BOT_COUNT = 975; // Generate ~975 bots for realistic population

interface InterviewResult {
  id: string;
  user_id: string;
  score: number;
  time_seconds: number;
  created_at: string;
}

interface UserStats {
  user_id: string;
  username_masked: string;
  average_score: number;
  average_time_secs: number;
  interviews_taken: number;
  streak_days: number;
  rank_score: number;
  last_interview_date: string;
  is_bot?: boolean;
}

interface LeaderRow {
  rank: number;
  username_masked: string;
  average_score: number;
  average_time_secs: number;
  interviews_taken: number;
  badges: string[];
  is_bot?: boolean;
}

// Mock bot data for realistic competition
const generateBots = (): UserStats[] => {
  const bots: UserStats[] = [];
  
  // Bronze bots (~60% of total bots)
  const bronzeBotCount = Math.floor(BOT_COUNT * 0.60);
  for (let i = 0; i < bronzeBotCount; i++) {
    bots.push({
      user_id: `bot_bronze_${i}`,
      username_masked: `User#${Math.random().toString().slice(2, 6)}`,
      average_score: 45 + Math.random() * 25, // 45-70% range
      average_time_secs: 480 + Math.random() * 240, // 8-12 mins
      interviews_taken: 2 + Math.floor(Math.random() * 4), // 2-5 interviews
      streak_days: 0,
      rank_score: 0,
      last_interview_date: new Date().toISOString(),
      is_bot: true
    });
  }
  
  // Silver bots (~30% of total bots)
  const silverBotCount = Math.floor(BOT_COUNT * 0.30);
  for (let i = 0; i < silverBotCount; i++) {
    bots.push({
      user_id: `bot_silver_${i}`,
      username_masked: `User#${Math.random().toString().slice(2, 6)}`,
      average_score: 65 + Math.random() * 20, // 65-85% range
      average_time_secs: 300 + Math.random() * 180, // 5-8 mins
      interviews_taken: 4 + Math.floor(Math.random() * 6), // 4-9 interviews
      streak_days: 0,
      rank_score: 0,
      last_interview_date: new Date().toISOString(),
      is_bot: true
    });
  }
  
  // Gold bots (~10% of total bots)
  const goldBotCount = BOT_COUNT - bronzeBotCount - silverBotCount;
  for (let i = 0; i < goldBotCount; i++) {
    bots.push({
      user_id: `bot_gold_${i}`,
      username_masked: `User#${Math.random().toString().slice(2, 6)}`,
      average_score: 75 + Math.random() * 20, // 75-95% range
      average_time_secs: 180 + Math.random() * 180, // 3-6 mins
      interviews_taken: 6 + Math.floor(Math.random() * 8), // 6-13 interviews
      streak_days: 0,
      rank_score: 0,
      last_interview_date: new Date().toISOString(),
      is_bot: true
    });
  }
  
  // Calculate rank scores for bots
  bots.forEach(bot => {
    const timeFactor = Math.min(100, Math.max(0, (BASELINE_TIME_SECONDS / Math.max(bot.average_time_secs, 1)) * 100));
    bot.rank_score = (bot.average_score * 0.6) + (bot.interviews_taken * 0.3) + (timeFactor * 0.1);
  });
  
  return bots;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the current user from the Authorization header
    const authHeader = req.headers.get('Authorization');
    let currentUserId = null;
    
    if (authHeader) {
      const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
      currentUserId = user?.id;
    }

    // Parse query parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const league = url.searchParams.get('league') || 'all';
    const offset = (page - 1) * limit;

    // Fetch all interview results
    const { data: interviews, error: interviewsError } = await supabase
      .from('interview_results')
      .select('*')
      .order('created_at', { ascending: false });

    // Calculate user statistics
    const userStatsMap = new Map<string, UserStats>();
    const now = new Date();
    const activeThreshold = new Date(now.getTime() - ACTIVE_DAYS_THRESHOLD * 24 * 60 * 60 * 1000);

    // Process each interview
    for (const interview of interviews) {
      const userId = interview.user_id;
      
      if (!userStatsMap.has(userId)) {
        userStatsMap.set(userId, {
          user_id: userId,
          username_masked: `User#${userId.slice(-4)}`,
          average_score: 0,
          average_time_secs: 0,
          interviews_taken: 0,
          streak_days: 0,
          rank_score: 0,
          last_interview_date: interview.created_at,
          is_bot: false
        });
      }

      const stats = userStatsMap.get(userId)!;
      stats.interviews_taken++;
      
      // Update running averages
      stats.average_score = ((stats.average_score * (stats.interviews_taken - 1)) + interview.score) / stats.interviews_taken;
      stats.average_time_secs = ((stats.average_time_secs * (stats.interviews_taken - 1)) + (interview.time_seconds || 60)) / stats.interviews_taken;
      
      if (interview.created_at > stats.last_interview_date) {
        stats.last_interview_date = interview.created_at;
      }
    }

    // Check which users are real (have profiles) vs bots
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id');
    
    const realUserIds = new Set(profiles?.map(p => p.id) || []);

    // Calculate streaks and mark bots for real users
    for (const [userId, stats] of userStatsMap) {
      stats.is_bot = !realUserIds.has(userId);
      
      // Calculate streak for real users only
      if (!stats.is_bot) {
        stats.streak_days = calculateStreak(interviews.filter(i => i.user_id === userId));
      }
      
      // Calculate rank score
      const timeFactor = Math.min(100, Math.max(0, (BASELINE_TIME_SECONDS / Math.max(stats.average_time_secs, 1)) * 100));
      stats.rank_score = (stats.average_score * 0.6) + (stats.interviews_taken * 0.3) + (timeFactor * 0.1);
    }

    // Add bots to the user stats
    const bots = generateBots();
    bots.forEach(bot => {
      userStatsMap.set(bot.user_id, bot);
    });

    // Filter active users (excluding bots from percentile calculations)
    const allUsers = Array.from(userStatsMap.values());
    const activeUsers = allUsers.filter(user => {
      const lastInterviewDate = new Date(user.last_interview_date);
      return lastInterviewDate >= activeThreshold;
    });

    const activeRealUsers = activeUsers.filter(user => !user.is_bot);

    // Sort by rank score
    activeUsers.sort((a, b) => b.rank_score - a.rank_score);
    activeRealUsers.sort((a, b) => b.rank_score - a.rank_score);

    // Determine league thresholds based on real users only
    const goldThreshold = Math.max(1, Math.ceil(activeRealUsers.length * GOLD_PERCENTAGE));
    const silverThreshold = Math.max(1, Math.ceil(activeRealUsers.length * SILVER_PERCENTAGE));

    // Assign leagues and calculate waitlists
    const goldUsers: UserStats[] = [];
    const silverUsers: UserStats[] = [];
    const bronzeUsers: UserStats[] = [];
    
    let goldWaitlist: UserStats[] = [];
    let silverWaitlist: UserStats[] = [];

    // Process real users first for league assignment
    activeRealUsers.forEach((user, index) => {
      if (index < goldThreshold) {
        goldUsers.push(user);
      } else if (index < goldThreshold + silverThreshold) {
        silverUsers.push(user);
      } else {
        bronzeUsers.push(user);
      }
    });

    // Add bots to leagues with realistic distribution
    const activeBots = activeUsers.filter(user => user.is_bot);
    activeBots.forEach(bot => {
      // Distribute bots across leagues based on their rank score
      const botRankAmongReal = activeRealUsers.filter(u => u.rank_score <= bot.rank_score).length;
      const botRankPercentile = activeRealUsers.length > 0 ? botRankAmongReal / activeRealUsers.length : 0;
      
      if (botRankPercentile <= GOLD_PERCENTAGE) {
        goldUsers.push(bot);
      } else if (botRankPercentile <= GOLD_PERCENTAGE + SILVER_PERCENTAGE) {
        silverUsers.push(bot);
      } else {
        bronzeUsers.push(bot);
      }
    });

    // Sort final league arrays
    goldUsers.sort((a, b) => b.rank_score - a.rank_score);
    silverUsers.sort((a, b) => b.rank_score - a.rank_score);
    bronzeUsers.sort((a, b) => b.rank_score - a.rank_score);

    // Helper function to get paginated results for a league
    const getPaginatedLeague = (users: UserStats[], startRank: number = 1) => {
      if (league !== 'all') {
        // Filter to specific league if requested
        const leagueUsers = users.slice(offset, offset + limit);
        return {
          users: leagueUsers.map((user, index) => ({
            rank: startRank + offset + index,
            username_masked: user.username_masked,
            average_score: Math.round(user.average_score),
            average_time_secs: Math.round(user.average_time_secs),
            interviews_taken: user.interviews_taken,
            badges: calculateBadges(user),
            is_bot: user.is_bot
          })),
          total: users.length,
          hasMore: offset + limit < users.length
        };
      }
      
      // Default view: top 15 + current user if not in top 15
      const top15 = users.slice(0, 15);
      let rows = top15.map((user, index) => ({
        rank: startRank + index,
        username_masked: user.username_masked,
        average_score: Math.round(user.average_score),
        average_time_secs: Math.round(user.average_time_secs),
        interviews_taken: user.interviews_taken,
        badges: calculateBadges(user),
        is_bot: user.is_bot
      }));

      // Add current user if not in top 15
      if (currentUserId) {
        const currentUserIndex = users.findIndex(u => u.user_id === currentUserId);
        if (currentUserIndex >= 15) {
          const currentUser = users[currentUserIndex];
          rows.push({
            rank: startRank + currentUserIndex,
            username_masked: currentUser.username_masked,
            average_score: Math.round(currentUser.average_score),
            average_time_secs: Math.round(currentUser.average_time_secs),
            interviews_taken: currentUser.interviews_taken,
            badges: calculateBadges(currentUser),
            is_bot: false
          });
        }
      }

      return {
        users: rows,
        total: users.length,
        hasMore: false
      };
    };

    // Find current user stats
    let currentUser = null;
    let userLeague = 'bronze';
    let userRank = 0;
    let waitlistPosition = null;

    if (currentUserId && userStatsMap.has(currentUserId)) {
      const userStats = userStatsMap.get(currentUserId)!;
      
      // Determine user's league
      if (goldUsers.find(u => u.user_id === currentUserId)) {
        userLeague = 'gold';
        userRank = goldUsers.findIndex(u => u.user_id === currentUserId) + 1;
      } else if (silverUsers.find(u => u.user_id === currentUserId)) {
        userLeague = 'silver';
        userRank = silverUsers.findIndex(u => u.user_id === currentUserId) + 1;
      } else {
        userLeague = 'bronze';
        userRank = bronzeUsers.findIndex(u => u.user_id === currentUserId) + 1;
      }

      // Calculate league percentile
      const userRankAmongReal = activeRealUsers.filter(u => u.rank_score >= userStats.rank_score).length;
      const userPercentile = activeRealUsers.length > 0 ? (userRankAmongReal / activeRealUsers.length) * 100 : 0;

      // Calculate next league hint
      const nextLeagueHint = calculateNextLeagueHint(userStats, userLeague, goldThreshold, silverThreshold, activeRealUsers);

      currentUser = {
        user_id: currentUserId,
        league: userLeague,
        rank: userRank,
        waitlist_position: waitlistPosition,
        average_score: Math.round(userStats.average_score),
        average_time_secs: Math.round(userStats.average_time_secs),
        interviews_taken: userStats.interviews_taken,
        streak_days: userStats.streak_days,
        percentile: Math.round(userPercentile),
        next_league_hint: nextLeagueHint
      };
    }

    // Return paginated results based on request
    if (league !== 'all') {
      let leagueUsers: UserStats[];
      let startRank = 1;
      
      switch (league) {
        case 'gold':
          leagueUsers = goldUsers;
          break;
        case 'silver':
          leagueUsers = silverUsers;
          startRank = goldUsers.length + 1;
          break;
        case 'bronze':
          leagueUsers = bronzeUsers;
          startRank = goldUsers.length + silverUsers.length + 1;
          break;
        default:
          leagueUsers = [...goldUsers, ...silverUsers, ...bronzeUsers];
      }

      const paginatedResults = getPaginatedLeague(leagueUsers, startRank);
      
      return new Response(JSON.stringify({
        currentUser,
        league: league,
        users: paginatedResults.users,
        pagination: {
          page,
          limit,
          total: paginatedResults.total,
          hasMore: paginatedResults.hasMore
        },
        leagueCounts: {
          gold: goldUsers.length,
          silver: silverUsers.length,
          bronze: bronzeUsers.length
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Default overview response
    const response = {
      currentUser,
      leagues: {
        gold: getPaginatedLeague(goldUsers, 1),
        silver: getPaginatedLeague(silverUsers, goldUsers.length + 1),
        bronze: getPaginatedLeague(bronzeUsers, goldUsers.length + silverUsers.length + 1)
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in leaderboard-snapshot:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateStreak(userInterviews: InterviewResult[]): number {
  if (userInterviews.length === 0) return 0;

  // Sort interviews by date, most recent first
  const sortedInterviews = [...userInterviews].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let streak = 0;
  let currentDate = new Date(today);
  
  // Get unique interview dates
  const interviewDates = new Set(
    sortedInterviews.map(interview => {
      const date = new Date(interview.created_at);
      date.setHours(0, 0, 0, 0);
      return date.getTime();
    })
  );

  // Count consecutive days with interviews
  for (let i = 0; i < 365; i++) { // Max 365 day streak
    if (interviewDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function calculateBadges(user: UserStats): string[] {
  const badges: string[] = [];
  
  if (user.average_time_secs < 30) {
    badges.push('fast_thinker');
  } else if (user.average_time_secs > 60) {
    badges.push('deep_thinker');
  }
  
  if (user.interviews_taken >= 10) {
    badges.push('consistency_champ');
  }
  
  return badges;
}

function calculateNextLeagueHint(
  userStats: UserStats, 
  currentLeague: string,
  goldThreshold: number,
  silverThreshold: number,
  activeRealUsers: UserStats[]
): { type: 'interviews' | 'score'; value: number } {
  
  if (currentLeague === 'gold') {
    return { type: 'score', value: 0 }; // Already at top
  }

  const userRankAmongReal = activeRealUsers.filter(u => u.rank_score <= userStats.rank_score).length;
  
  if (currentLeague === 'silver') {
    // Need to reach gold
    const goldCutoffUser = activeRealUsers[goldThreshold - 1];
    if (goldCutoffUser && userStats.average_score < goldCutoffUser.average_score) {
      return { type: 'score', value: Math.ceil(goldCutoffUser.average_score - userStats.average_score) };
    }
    return { type: 'interviews', value: 3 };
  } else {
    // Need to reach silver
    const silverCutoffUser = activeRealUsers[goldThreshold + silverThreshold - 1];
    if (silverCutoffUser && userStats.average_score < silverCutoffUser.average_score) {
      return { type: 'score', value: Math.ceil(silverCutoffUser.average_score - userStats.average_score) };
    }
    return { type: 'interviews', value: 5 };
  }
}