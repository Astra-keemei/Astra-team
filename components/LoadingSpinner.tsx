import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[50vh] space-y-4">
    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    <p className="text-gray-500 text-sm font-medium">Loading Astar Lakh...</p>
  </div>
);

export default LoadingSpinner;