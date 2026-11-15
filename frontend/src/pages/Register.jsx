import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { authStart, authSuccess, authFailure } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const Register = () => {
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
      const response = await api.post('/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      dispatch(authSuccess(response.data.user));
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Registration failed. Please check inputs.';
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
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-[#00c805]/10 flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6 text-[#00c805]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">SB STOCKS</h2>
          <p className="text-[#8a9fc2] text-sm mt-1">Start paper trading with $100,000 virtual cash</p>
        </div>

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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8a9fc2] mb-2">
              Trading Username
            </label>
            <input
              type="text"
              placeholder="e.g. wallstreet_bull"
              className={`w-full px-4 py-3 rounded-lg bg-[#0b0e14] border text-white text-sm outline-none transition-colors focus:border-[#00c805]/50 focus:ring-1 focus:ring-[#00c805]/20 ${
                errors.username ? 'border-[#ff3b30]' : 'border-[#222b3e]'
              }`}
              {...register('username', {
                required: 'Username is required',
                minLength: { value: 3, message: 'Username must be at least 3 characters' },
              })}
            />
            {errors.username && (
              <span className="text-xs text-[#ff3b30] mt-1 block">{errors.username.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8a9fc2] mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="e.g. trader@example.com"
              className={`w-full px-4 py-3 rounded-lg bg-[#0b0e14] border text-white text-sm outline-none transition-colors focus:border-[#00c805]/50 focus:ring-1 focus:ring-[#00c805]/20 ${
                errors.email ? 'border-[#ff3b30]' : 'border-[#222b3e]'
              }`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {errors.email && (
              <span className="text-xs text-[#ff3b30] mt-1 block">{errors.email.message}</span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8a9fc2] mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimum 6 characters"
                className={`w-full px-4 py-3 rounded-lg bg-[#0b0e14] border text-white text-sm outline-none transition-colors focus:border-[#00c805]/50 focus:ring-1 focus:ring-[#00c805]/20 ${
                  errors.password ? 'border-[#ff3b30]' : 'border-[#222b3e]'
                }`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
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

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 px-4 rounded-lg bg-[#00c805] hover:bg-[#00c805]/90 text-[#0b0e14] font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#00c805]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-[#0b0e14] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-[#8a9fc2]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00c805] font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
