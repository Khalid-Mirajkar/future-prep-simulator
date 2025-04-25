
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

const History = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: interviewResults = [], isLoading } = useQuery({
    queryKey: ['interview-results'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('interview_results')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const totalPages = Math.ceil(interviewResults.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResults = interviewResults.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (id: string) => {
    navigate(`/results/${id}`);
  };

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
          <h1 className="text-3xl font-bold mb-8">Interview History</h1>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-purple-500/30 bg-black/40">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-purple-400">Date</TableHead>
                      <TableHead className="text-purple-400">Job Title</TableHead>
                      <TableHead className="text-purple-400">Company Name</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentResults.map((result) => (
                      <TableRow 
                        key={result.id}
                        onClick={() => handleRowClick(result.id)}
                        className="cursor-pointer hover:bg-purple-500/10 transition-colors"
                      >
                        <TableCell className="font-medium">
                          {format(new Date(result.created_at), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>{result.job_title || 'N/A'}</TableCell>
                        <TableCell>{result.company_name || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => setCurrentPage(page)}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
