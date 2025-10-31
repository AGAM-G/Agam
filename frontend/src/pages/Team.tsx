import Header from '../components/layout/Header';
import { Users } from 'lucide-react';

const Team = () => {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden flex flex-col">
      <Header title="Team" showActions={false} />
      <div className="flex-1 overflow-y-auto px-8 pt-4 pb-4">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Team Management Coming Soon
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Manage team members and permissions here
          </p>
        </div>
      </div>
    </div>
  );
};

export default Team;
