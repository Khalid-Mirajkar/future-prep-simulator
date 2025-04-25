
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
} from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <aside className="w-64 bg-black/40 backdrop-blur-md h-screen fixed left-0 top-0 border-r border-white/10 z-10">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="h-6 w-6 text-purple-500" />
          <span className="text-xl font-bold text-white">Dashboard</span>
        </div>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.href}>
              <button
                onClick={() => navigate(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
                  location.pathname === item.href
                    ? "bg-purple-600/30 text-white"
                    : "hover:bg-white/5 text-gray-400 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default DashboardSidebar;
