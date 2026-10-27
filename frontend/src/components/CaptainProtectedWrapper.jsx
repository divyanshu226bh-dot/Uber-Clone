import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/Api';

const CaptainProtectWrapper = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('captainAccessToken');

    if (!token) {
      navigate('/captain-login');
      return;
    }

    api.get('http://localhost:3000/api/auth/get-me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          if (res.data.role && res.data.role !== 'captain') {
            navigate('/home');
          } else {
            setLoading(false);
          }
        }
      })
      .catch(() => {
        localStorage.removeItem('captainAccessToken');
        localStorage.removeItem('captain');
        localStorage.removeItem('captainId');
        navigate('/captain-login');
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#141414] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-zinc-400 font-medium">Verifying driver credentials...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default CaptainProtectWrapper;