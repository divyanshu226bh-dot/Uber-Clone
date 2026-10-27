import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/Api';

const UserProtectWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userAccessToken');

    if (!token) {
      navigate('/login');
      return;
    }

    api
      .get('http://localhost:3000/api/auth/get-me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          if (res.data.role && res.data.role !== 'rider') {
            navigate('/captain-home');
          } else {
            setLoading(false);
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('userAccessToken');
        localStorage.removeItem('user');
        navigate('/login');
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-zinc-400 font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default UserProtectWrapper;