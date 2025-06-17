import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserRound,
  BarChart2,
  History,
  MessageSquare,
  Users,
  FileText,
  BookOpen,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

// Add Dashboard as the first item in the navigation
const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "My Profile",
    icon: UserRound,
    href: "/dashboard/profile",
  },
  {
    title: "Analytics",
    icon: BarChart2,
    href: "/dashboard/analytics",
  },
  {
    title: "History",
    icon: History,
    href: "/dashboard/history",
  },
  {
    title: "CV Checker",
    icon: FileCheck,
    href: "/dashboard/cv-checker",
  },
  {
    title: "Feedback",
    icon: MessageSquare,
    href: "/dashboard/feedback",
  },
  {
    title: "Leaderboard",
    icon: Users,
    href: "/dashboard/leaderboard",
  },
  {
    title: "Interview Mock PDF",
    icon: FileText,
    href: "/dashboard/mock-pdf",
  },
  {
    title: "Subscriptions",
    icon: BookOpen,
    href: "/dashboard/subscriptions",
  },
];

const DashboardSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const handleNavigation = (href: string) => {
    // Only navigate if we're not already on this page
    if (location.pathname !== href) {
      navigate(href);
    }
  };

  return (
    <aside className={cn(
      "bg-black/40 backdrop-blur-md border-r border-white/10 z-10",
      isMobile ? "w-full h-full" : "w-64 h-screen fixed left-0 top-0"
    )}>
      <div className="p-4 md:p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LayoutDashboard className="h-5 w-5 md:h-6 md:w-6 text-purple-500" />
          </motion.div>
          <span className="text-lg md:text-xl font-bold text-gradient">Dashboard</span>
        </div>
      </div>
      <nav className="p-3 md:p-4 overflow-y-auto max-h-[calc(100vh-70px)]">
        <ul className="space-y-1 md:space-y-2">
          {sidebarItems.map((item, index) => (
            <motion.li 
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <button
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  "w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-md transition-colors text-sm md:text-base",
                  location.pathname === item.href
                    ? "bg-gradient-to-r from-purple-600/50 to-purple-500/20 text-white"
                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 md:h-5 md:w-5 transition-colors",
                  location.pathname === item.href
                    ? "text-purple-400"
                    : "text-gray-500 group-hover:text-white"
                )} />
                <span className={cn(
                  "transition-colors",
                  location.pathname === item.href && "text-gradient"
                )}>{item.title}</span>
              </button>
            </motion.li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
