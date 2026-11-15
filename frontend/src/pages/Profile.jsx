import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { User, Lock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { updateUserProfile } from '../store/slices/authSlice.js';
import api from '../services/api.js';

const AVATAR_OPTIONS = [
  { key: 'bull', label: 'Bullish Trader', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bull' },
  { key: 'bear', label: 'Bearish Short', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bear' },
  { key: 'whale', label: 'Whale Investor', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=whale' },
  { key: 'shark', label: 'Day Shark', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=shark' },
  { key: 'rocket', label: 'Moon Rider', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=rocket' },
];

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0].url);
  const [profileSuccess, setProfileSuccess] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm({
    defaultValues: {
      username: user?.username || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    watch,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm();

  const newPassword = watch('newPassword');

  const onUpdateProfile = async (data) => {
    setProfileSuccess(null);
    setProfileError(null);
    setUpdatingProfile(true);

    try {
      const response = await api.put('/auth/profile', {
        username: data.username,
        avatar: selectedAvatar,
      });
      dispatch(updateUserProfile(response.data.user));
      setProfileSuccess('Profile updated successfully.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const onChangePassword = async (data) => {
    setPasswordSuccess(null);
    setPasswordError(null);
    setUpdatingPassword(true);

    try {
      await api.put('/auth/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setPasswordSuccess('Password changed successfully.');
      resetPasswordForm();
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Double check your current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Profile Settings</h1>
        <p className="text-xs text-[#8a9fc2] mt-1">Manage your virtual trading profile credentials and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: General Info & Avatar choice */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#222b3e]/40 pb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-[#00c805]" />
              <span>General Information</span>
            </h3>

            {profileSuccess && (
              <div className="flex gap-2 p-3 rounded-lg bg-[#00c805]/10 border border-[#00c805]/20 text-xs text-[#00c805]">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{profileSuccess}</span>
              </div>
            )}
            {profileError && (
              <div className="flex gap-2 p-3 rounded-lg bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-xs text-[#ff3b30]">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8a9fc2] uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0b0e14]/60 border border-[#222b3e]/40 text-sm text-[#8a9fc2] cursor-not-allowed outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#8a9fc2] uppercase tracking-wider">Trading Alias (Username)</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className={`w-full px-3 py-2.5 rounded-lg bg-[#0b0e14] border text-sm text-white outline-none focus:border-[#00c805]/45 focus:ring-1 focus:ring-[#00c805]/10 ${
                    profileErrors.username ? 'border-[#ff3b30]/60' : 'border-[#222b3e]'
                  }`}
                  {...registerProfile('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' },
                  })}
                />
                {profileErrors.username && (
                  <span className="text-xs text-[#ff3b30] pl-1">{profileErrors.username.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[#8a9fc2] uppercase tracking-wider block">Choose Avatar</label>
                <div className="flex flex-wrap gap-4 pt-1">
                  {AVATAR_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setSelectedAvatar(opt.url)}
                      className={`h-14 w-14 rounded-xl flex items-center justify-center p-1.5 border transition-all cursor-pointer ${
                        selectedAvatar === opt.url
                          ? 'border-[#00c805] bg-[#00c805]/10 shadow-lg shadow-[#00c805]/5 scale-105'
                          : 'border-[#222b3e] bg-[#0b0e14] hover:border-[#8a9fc2]'
                      }`}
                      title={opt.label}
                    >
                      <img src={opt.url} alt={opt.label} className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingProfile}
                className="bg-[#00c805] hover:bg-[#00c805]/90 disabled:bg-[#00c805]/50 text-[#0b0e14] font-bold text-xs px-5 py-2.5 rounded-lg transition-all cursor-pointer"
              >
                {updatingProfile ? 'Saving...' : 'Update Settings'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Change Password Form */}
        <div className="space-y-6">
          <div className="rounded-xl bg-[#151a26] border border-[#222b3e] p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white border-b border-[#222b3e]/40 pb-3 flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#00c805]" />
              <span>Change Password</span>
            </h3>

            {passwordSuccess && (
              <div className="flex gap-2 p-3 rounded-lg bg-[#00c805]/10 border border-[#00c805]/20 text-xs text-[#00c805]">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}
            {passwordError && (
              <div className="flex gap-2 p-3 rounded-lg bg-[#ff3b30]/10 border border-[#ff3b30]/20 text-xs text-[#ff3b30]">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a9fc2] uppercase tracking-wider">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 rounded-lg bg-[#0b0e14] border text-xs text-white outline-none focus:border-[#00c805]/45 focus:ring-1 focus:ring-[#00c805]/10 ${
                    passwordErrors.currentPassword ? 'border-[#ff3b30]/60' : 'border-[#222b3e]'
                  }`}
                  {...registerPassword('currentPassword', { required: 'Current password is required' })}
                />
                {passwordErrors.currentPassword && (
                  <span className="text-[10px] text-[#ff3b30] pl-1">{passwordErrors.currentPassword.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a9fc2] uppercase tracking-wider">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 6 characters"
                  className={`w-full px-3 py-2 rounded-lg bg-[#0b0e14] border text-xs text-white outline-none focus:border-[#00c805]/45 focus:ring-1 focus:ring-[#00c805]/10 ${
                    passwordErrors.newPassword ? 'border-[#ff3b30]/60' : 'border-[#222b3e]'
                  }`}
                  {...registerPassword('newPassword', {
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                  })}
                />
                {passwordErrors.newPassword && (
                  <span className="text-[10px] text-[#ff3b30] pl-1">{passwordErrors.newPassword.message}</span>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#8a9fc2] uppercase tracking-wider">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm password"
                  className={`w-full px-3 py-2 rounded-lg bg-[#0b0e14] border text-xs text-white outline-none focus:border-[#00c805]/45 focus:ring-1 focus:ring-[#00c805]/10 ${
                    passwordErrors.confirmPassword ? 'border-[#ff3b30]/60' : 'border-[#222b3e]'
                  }`}
                  {...registerPassword('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) => value === newPassword || 'Passwords do not match',
                  })}
                />
                {passwordErrors.confirmPassword && (
                  <span className="text-[10px] text-[#ff3b30] pl-1">{passwordErrors.confirmPassword.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full bg-[#00c805] hover:bg-[#00c805]/90 disabled:bg-[#00c805]/50 text-[#0b0e14] font-bold text-xs py-2.5 mt-2 rounded-lg transition-all cursor-pointer"
              >
                {updatingPassword ? 'Saving...' : 'Change Password'}
              </button>
            </form>
          </div>

          <div className="p-4 bg-[#151a26] border border-[#222b3e] rounded-xl flex gap-3 items-start">
            <ShieldCheck className="h-5 w-5 text-[#00c805] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-white">Authentication Security</p>
              <p className="text-[10px] text-[#8a9fc2] leading-relaxed">
                Sessions are secured using rotated HTTP-Only refresh cookies and 15-minute JWT access tokens.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
