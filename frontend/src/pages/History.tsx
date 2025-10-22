import Header from '../components/layout/Header';
import { Clock } from 'lucide-react';

const History = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="History" showActions={false} />
      <div className="p-8">
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            History Page Coming Soon
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            View historical test execution data here
          </p>
        </div>
      </div>
    </div>
  );
};

export default History;
