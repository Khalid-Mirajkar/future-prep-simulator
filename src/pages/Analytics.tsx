
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Home, Menu, Clock } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";

const Analytics = () => {
  const { data, isLoading, error, analytics } = useAnalytics();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Helper function to safely format numbers
  const formatNumber = (value: any): string => {
    return typeof value === 'number' ? value.toFixed(2) + '%' : 'N/A';
  };
  
  // Format time in minutes and seconds
  const formatTime = (seconds: number | null): string => {
    if (seconds === null || seconds === 0) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Colors for the bar chart
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

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
            <PageHeader 
              title="Interview Analytics"
              highlightedWord="Analytics"
            />
            
            {analytics && data && data.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:gap-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-black/30 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Interviews
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {analytics.totalInterviews}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/30 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(analytics.averageScore)}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-black/30 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">
                        Average Time
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-400" />
                        {formatTime(analytics.averageTimeSeconds)}
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
                        {formatNumber(analytics.bestScore)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Performance Chart */}
                <Card className="bg-black/30 border-white/10">
                  <CardHeader>
                    <CardTitle>Interview Performance Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.scoreByDate.length > 0 ? (
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analytics.scoreByDate}>
                            <XAxis dataKey="date" stroke="#888888" />
                            <YAxis stroke="#888888" domain={[0, 100]} />
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
                                            {formatNumber(payload[0].value)}
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
                        <p className="text-muted-foreground">Not enough data to show performance trends.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Company Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Card className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle>Performance by Company</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.scoreByCompany.length > 0 ? (
                        <div className="h-[300px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.scoreByCompany}>
                              <XAxis dataKey="company" stroke="#888888" />
                              <YAxis stroke="#888888" domain={[0, 100]} />
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (active && payload && payload.length) {
                                    return (
                                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                                        <div className="grid grid-cols-1 gap-2">
                                          <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                              Company
                                            </span>
                                            <span className="font-bold text-muted-foreground">
                                              {payload[0].payload.company}
                                            </span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                              Avg. Score
                                            </span>
                                            <span className="font-bold">
                                              {formatNumber(payload[0].value)}
                                            </span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                                              Interviews
                                            </span>
                                            <span className="font-bold">
                                              {payload[0].payload.count}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Bar dataKey="averageScore" name="Average Score">
                                {analytics.scoreByCompany.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={colors[index % colors.length]}
                                  />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-[300px]">
                          <p className="text-muted-foreground">Not enough data to show company performance.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Recent Interviews */}
                  <Card className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle>Recent Interviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead>Time</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {data.slice(0, 5).map((result) => (
                            <TableRow key={result.id}>
                              <TableCell className="font-medium">
                                {new Date(result.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{result.company_name || 'N/A'}</TableCell>
                              <TableCell>
                                {formatNumber((result.score / result.total_questions) * 100)}
                              </TableCell>
                              <TableCell>
                                {formatTime(result.time_seconds)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {data.length > 5 && (
                        <div className="mt-4 text-center">
                          <Button 
                            variant="outline" 
                            onClick={() => navigate('/dashboard/history')}
                          >
                            View All Interviews
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card className="bg-black/30 border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-lg mb-2">No interview data available</p>
                  <p className="text-gray-400 mb-6 text-center">
                    Complete practice interviews to build your analytics.
                  </p>
                  <Button onClick={() => navigate('/start-practice')} className="bg-purple-600 hover:bg-purple-700">
                    Start Practice
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Analytics;
