
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Home, Menu } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Analytics = () => {
  const { data, isLoading, error } = useAnalytics();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const chartData = data?.map((result) => ({
    date: new Date(result.created_at).toLocaleDateString(),
    score: (result.score / result.total_questions) * 100,
  }));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Analytics</h2>
          <p className="text-gray-400 mb-6">
            There was an error loading your analytics data. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0D0D0D] text-white relative">
        {!isMobile ? (
          <DashboardSidebar />
        ) : (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-20"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0 border-r border-white/10 bg-black/80">
              <DashboardSidebar />
            </SheetContent>
          </Sheet>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 z-20"
          onClick={() => navigate('/')}
          title="Back to Home"
        >
          <Home className="h-6 w-6" />
        </Button>
        
        <main className={isMobile ? "pt-16" : "pl-64"}>
          <div className="p-4 md:p-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-6">Analytics</h1>
            
            <div className="grid grid-cols-1 gap-4 md:gap-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle>Interview Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData && chartData.length > 0 ? (
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <XAxis dataKey="date" stroke="#888888" />
                          <YAxis stroke="#888888" />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          Date
                                        </span>
                                        <span className="font-bold text-muted-foreground">
                                          {payload[0].payload.date}
                                        </span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                          Score
                                        </span>
                                        <span className="font-bold">
                                          {payload[0].value.toFixed(2)}%
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#8A2BE2"
                            strokeWidth={2}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px]">
                      <p className="text-muted-foreground">No interview data available.</p>
                      <p className="text-sm text-muted-foreground">
                        Complete practice interviews to see your performance analytics.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-black/30 border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Average Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {chartData && chartData.length > 0
                        ? `${(chartData.reduce((acc, item) => acc + item.score, 0) / chartData.length).toFixed(2)}%`
                        : "N/A"}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/30 border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Interviews Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {chartData?.length || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-black/30 border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      Best Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {chartData && chartData.length > 0
                        ? `${Math.max(...chartData.map(item => item.score)).toFixed(2)}%`
                        : "N/A"}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
