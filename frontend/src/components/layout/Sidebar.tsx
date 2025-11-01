import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Play,
  FileText,
  BarChart3,
  Clock,
  Activity,
  Calendar,
  Users,
  Settings,
  Zap,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/test-runner', icon: Play, label: 'Test Runner' },
    { path: '/test-results', icon: FileText, label: 'Test Results' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/history', icon: Clock, label: 'History' },
    { path: '/monitoring', icon: Activity, label: 'Monitoring' },
    { path: '/schedule', icon: Calendar, label: 'Schedule' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">AutomationHub</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Test Management Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-gray-900 dark:bg-gray-700 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">Dev Team</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">admin@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
