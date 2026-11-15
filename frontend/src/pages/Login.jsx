import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Eye, EyeOff, LogIn } from 'lucide-react';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (isAuthenticated && !loading) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (data) => {
    setApiError(null);
    dispatch(authStart());
    try {
      const response = await api.post('/auth/login', {
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      dispatch(authSuccess(response.data.user));
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setApiError(errorMsg);
      dispatch(authFailure(errorMsg));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0e14] px-4 py-12 relative overflow-hidden select-none">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#00c805]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00c805]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md p-8 rounded-2xl bg-[#151a26] border border-[#222b3e] relative z-10 glow-bull"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-[#00c805]/10 flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6 text-[#00c805]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">SB STOCKS</h2>
          <p className="text-[#8a9fc2] text-sm mt-1">Sign in to your paper trading account</p>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 p-3 rounded-lg bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-[#ff3b30] text-sm"
          >
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email or Username */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8a9fc2] mb-2">
              Email or Username
            </label>
            <input
              type="text"
              placeholder="e.g. trader or trader@example.com"
              className={`w-full px-4 py-3 rounded-lg bg-[#0b0e14] border text-white text-sm outline-none transition-colors focus:border-[#00c805]/50 focus:ring-1 focus:ring-[#00c805]/20 ${
                errors.emailOrUsername ? 'border-[#ff3b30]' : 'border-[#222b3e]'
              }`}
              {...register('emailOrUsername', {
                required: 'Please enter your username or email address',
              })}
            />
            {errors.emailOrUsername && (
              <span className="text-xs text-[#ff3b30] mt-1 block">
                {errors.emailOrUsername.message}
              </span>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#8a9fc2]">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-[#00c805] hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-lg bg-[#0b0e14] border text-white text-sm outline-none transition-colors focus:border-[#00c805]/50 focus:ring-1 focus:ring-[#00c805]/20 ${
                  errors.password ? 'border-[#ff3b30]' : 'border-[#222b3e]'
                }`}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9fc2] hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <span className="text-xs text-[#ff3b30] mt-1 block">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg bg-[#00c805] hover:bg-[#00c805]/90 text-[#0b0e14] font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#00c805]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-[#0b0e14] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#8a9fc2]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#00c805] font-bold hover:underline">
            Sign Up
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
