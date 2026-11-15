import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0e14] text-white">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-[#00c805] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-[#8a9fc2]">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
