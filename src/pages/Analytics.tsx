
import { Progress } from "@/components/ui/progress";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Analytics = () => {
  const { data: results = [], isLoading } = useAnalytics();
  const navigate = useNavigate();

  // Calculate statistics
  const totalInterviews = results.length;
  const averageScore = totalInterviews > 0
    ? Math.round((results.reduce((acc, curr) => acc + (curr.score / curr.total_questions * 100), 0) / totalInterviews))
    : 0;

  // Format data for the bar chart
  const chartData = results.slice(0, 10).map(result => ({
    interview: result.company_name || 'Interview',
    score: Math.round((result.score / result.total_questions) * 100)
  })).reverse();

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white relative">
      <DashboardSidebar />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 right-4 z-20"
        onClick={() => navigate('/')}
        title="Back to Home"
      >
        <Home className="h-6 w-6" />
      </Button>

      <main className="pl-64">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Analytics</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Interviews Attempted Card */}
            <Card className="bg-black/40 border border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Interviews Attempted
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-white">
                  {isLoading ? "..." : totalInterviews}
                </div>
              </CardContent>
            </Card>

            {/* Average Score Card */}
            <Card className="bg-black/40 border border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">
                  Average Score
                </CardTitle>
                <BarChart2 className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <Progress
                      value={averageScore}
                      className="h-24 w-24 rounded-full [&>div]:rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
                      {isLoading ? "..." : `${averageScore}%`}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Past Interviews Score Chart */}
          <Card className="bg-black/40 border border-purple-500/30">
            <CardHeader>
              <CardTitle>Past Interview Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="interview" 
                      stroke="#888" 
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#888" 
                      fontSize={12}
                      tickLine={false}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1a1a1a",
                        border: "1px solid #333",
                        borderRadius: "4px",
                        color: "#fff"
                      }}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#9b87f5"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
