import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/Api';
import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaCar,
  FaLock,
  FaEnvelope,
} from 'react-icons/fa';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('http://localhost:3000/api/auth/login', {
        email,
        password,
      });

      if (response.status === 200) {
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        navigate('/home');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to login. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF6F5] text-[#111111] flex flex-col justify-between selection:bg-[#990011] selection:text-white">
      {/* Navbar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-[#111111]/10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#111111] hover:text-[#990011] transition-colors bg-white border border-[#111111]/10 px-4 py-2 rounded-full shadow-xs"
        >
          <FaArrowLeft /> Back to Home
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-[#111111]">
            Uber<span className="text-[#990011]">.</span>
          </span>
        </div>
      </nav>

      {/* Main Login Form Box */}
      <main className="w-full max-w-md mx-auto px-6 py-10 my-auto">
        <div className="bg-white border border-[#111111]/10 p-8 rounded-3xl shadow-sm">
          <div className="flex flex-col gap-2 mb-8">
            <div className="w-12 h-12 bg-[#FCF6F5] border border-[#111111]/5 rounded-2xl flex items-center justify-center text-[#990011] mb-2 shadow-xs">
              <FaCar className="text-xl" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-[#111111]">Rider Login</h2>
            <p className="text-xs font-medium text-zinc-500">
              Welcome back! Enter your details to request a ride.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 bg-[#990011]/10 border border-[#990011]/30 rounded-2xl text-[#990011] text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#990011] animate-ping"></span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]">Email Address</label>
              <div className="relative flex items-center">
                <FaEnvelope className="absolute left-4 text-zinc-400 text-sm" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-sm text-[#111111] font-medium pl-11 pr-4 py-3 rounded-2xl transition-all placeholder:text-zinc-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-[#111111]">Password</label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-4 text-zinc-400 text-sm" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FCF6F5] border border-[#111111]/15 focus:border-[#990011] focus:bg-white focus:outline-none text-sm text-[#111111] font-medium pl-11 pr-11 py-3 rounded-2xl transition-all placeholder:text-zinc-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-zinc-400 hover:text-[#990011] transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#990011] text-white font-bold text-sm py-3.5 rounded-2xl hover:bg-[#7a000e] transition-colors mt-2 flex justify-center items-center gap-2 disabled:opacity-50 shadow-xs"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Log In as Rider'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#111111]/10 text-center">
            <p className="text-xs font-medium text-zinc-500">
              Don't have a rider account?{' '}
              <Link
                to="/register"
                className="text-[#990011] font-bold underline underline-offset-4 hover:text-[#7a000e] transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link
              to="/captain-login"
              className="text-xs font-bold text-[#111111] hover:text-[#990011] transition-colors inline-flex items-center gap-1"
            >
              Sign in as Driver instead →
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs font-semibold text-zinc-500">
        &copy; {new Date().getFullYear()} Uber Clone. All rights reserved.
      </footer>
    </div>
  );
};

export default UserLogin;