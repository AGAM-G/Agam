import { Header } from '../components/layout';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Settings" showActions={false} />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-4 pb-4">
        <div className="text-center py-12">
          <SettingsIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Settings Page Coming Soon
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Configure application settings here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
