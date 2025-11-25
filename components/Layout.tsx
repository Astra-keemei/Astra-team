import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center">
      <main className="w-full max-w-md bg-white min-h-screen shadow-2xl sm:min-h-[calc(100vh-2rem)] sm:my-4 sm:rounded-xl overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;