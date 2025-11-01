import { Search, RefreshCw, Plus, Moon, Sun } from 'lucide-react';
import { useDarkMode } from '../../contexts/DarkModeContext';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title: string;
  showSearch?: boolean;
  showActions?: boolean;
  onRefresh?: () => void;
  onNewTest?: () => void;
}

const Header = ({
  title,
  showSearch = true,
  showActions = true,
  onRefresh,
  onNewTest,
}: HeaderProps) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        {/* Title and Status */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">{title}</h1>
          <div className="hidden md:flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">All systems operational</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Search */}
          {showSearch && (
            <div className="relative hidden xl:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search tests, results..."
                className="pl-10 pr-4 py-2 w-64 xl:w-80 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
              />
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              )}

              {onNewTest && (
                <button
                  onClick={onNewTest}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Test</span>
                </button>
              )}
            </>
          )}

          {/* Notifications */}
          <NotificationBell />

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
