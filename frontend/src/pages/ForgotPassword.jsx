import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowLeft, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    setSubmitted(true);
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
        <div className="flex flex-col items-center mb-6">
          <div className="h-12 w-12 rounded-xl bg-[#00c805]/10 flex items-center justify-center mb-3">
            <TrendingUp className="h-6 w-6 text-[#00c805]" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset Password</h2>
          <p className="text-[#8a9fc2] text-sm mt-1 text-center">
            Enter your email to receive password reset instructions
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4 text-center py-4">
            <div className="h-12 w-12 rounded-full bg-[#00c805]/15 text-[#00c805] flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <p className="text-sm text-white">
              If an account matches that email, password reset instructions have been sent.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#00c805] hover:underline pt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8a9fc2] mb-2">
                Registered Email
              </label>
              <input
                type="email"
                placeholder="trader@example.com"
                className={`w-full px-4 py-3 rounded-lg bg-[#0b0e14] border text-white text-sm outline-none transition-colors focus:border-[#00c805]/50 focus:ring-1 focus:ring-[#00c805]/20 ${
                  errors.email ? 'border-[#ff3b30]' : 'border-[#222b3e]'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                })}
              />
              {errors.email && (
                <span className="text-xs text-[#ff3b30] mt-1 block">{errors.email.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-lg bg-[#00c805] hover:bg-[#00c805]/90 text-[#0b0e14] font-bold text-sm tracking-wide transition-all shadow-lg hover:shadow-[#00c805]/20 cursor-pointer"
            >
              Send Reset Link
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#8a9fc2] hover:text-white transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
