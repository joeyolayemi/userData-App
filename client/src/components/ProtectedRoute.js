import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import config from '../config';

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          setIsAuthenticated(false);
          return;
        }

        const response = await fetch(`${config.apiUrl}/api/admin/verify`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('adminToken');
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('adminToken');
      }
    };

    verifyToken();
  }, []);

  if (isAuthenticated === null) {
    // Show loading state while checking authentication
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/admin" />;
}

export default ProtectedRoute; 