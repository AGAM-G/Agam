import Header from '../components/layout/Header';
import { Activity } from 'lucide-react';

const Monitoring = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Monitoring" showActions={false} />
      <div className="p-8">
        <div className="text-center py-12">
          <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Monitoring Dashboard Coming Soon
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Real-time monitoring and alerts will appear here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Monitoring;
