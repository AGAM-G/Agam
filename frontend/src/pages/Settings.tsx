import Header from '../components/layout/Header';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Settings" showActions={false} />
      <div className="p-8">
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
