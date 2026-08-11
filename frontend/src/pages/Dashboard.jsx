import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 h-full flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome back, {user?.name || 'User'}!
        </h1>
        <p className="text-gray-600 text-lg mb-2">Role: {user?.role || 'N/A'}</p>
        <p className="text-gray-500">More dashboard widgets coming soon.</p>
      </div>
    </div>
  );
};

export default Dashboard;
