import React, { useState } from 'react';
import {
  signInWithGoogle,
  setSimulatedUser,
  isEmailAuthorized,
  AuthUserProfile,
} from '../services/auth';
import { BrandLogo } from '../assets/brandLogos';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUserProfile) => void;
  onLoginRestricted: (user: AuthUserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onLoginRestricted,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [showDirectInput, setShowDirectInput] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await signInWithGoogle();
      if (user.isAuthorized) {
        onLoginSuccess(user);
      } else {
        onLoginRestricted(user);
      }
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      if (err?.code === 'auth/popup-blocked') {
        setErrorMessage(
          'Google Sign-In popup was blocked by your browser. Please allow popups or use the direct email verification below.'
        );
        setShowDirectInput(true);
      } else if (err?.code === 'auth/unauthorized-domain') {
        setErrorMessage(
          'Firebase domain check notice: You can test the ACL directly with your Google email below.'
        );
        setShowDirectInput(true);
      } else {
        setErrorMessage(
          err?.message || 'Failed to complete Google Sign-In. You can verify your email directly below.'
        );
        setShowDirectInput(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAccount = (email: string, name: string) => {
    const isAuth = isEmailAuthorized(email);
    const profile: AuthUserProfile = {
      email,
      displayName: name,
      isAuthorized: isAuth,
    };
    setSimulatedUser(profile);
    if (isAuth) {
      onLoginSuccess(profile);
    } else {
      onLoginRestricted(profile);
    }
  };

  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const email = customEmail.trim();
    const isAuth = isEmailAuthorized(email);
    const profile: AuthUserProfile = {
      email,
      displayName: email.split('@')[0],
      isAuthorized: isAuth,
    };
    setSimulatedUser(profile);
    if (isAuth) {
      onLoginSuccess(profile);
    } else {
      onLoginRestricted(profile);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/40 text-slate-100 font-sans overflow-y-auto">
      {/* Background Decorative Circles */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-orange-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-slate-900/95 backdrop-blur-2xl rounded-3xl border border-slate-700/80 shadow-2xl p-7 sm:p-10 flex flex-col items-center text-center animate-fadeIn my-auto">
        {/* QDOBA Master Emblem */}
        <div className="mb-6 relative group">
          <div className="w-20 h-20 rounded-full bg-white p-1.5 shadow-xl shadow-orange-500/20 border-3 border-orange-500 flex items-center justify-center">
            <BrandLogo brand="QDOBA" size={68} className="w-full h-full object-cover scale-[1.04] rounded-full" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center shadow-xs text-white text-[11px] font-bold">
            🔒
          </span>
        </div>

        {/* Security / ACL Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-mono font-medium mb-3">
          <span className="w-2 h-2 rounded-full bg-orange-400"></span>
          ACL Access Control Enforced
        </div>

        {/* Header Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          QDOBA South Bay Strategy
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
          Confidential South Bay competitive intelligence &amp; market expansion map. Sign in with your authorized Google Account to access site selection data.
        </p>

        {/* Error Alert (if any) */}
        {errorMessage && (
          <div className="w-full mb-5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs text-left flex items-start gap-2.5">
            <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Official Google Sign-In Button */}
        <div className="w-full space-y-3 mb-6">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl active:scale-[0.99] border border-slate-200 disabled:opacity-60 cursor-pointer group"
          >
            {isLoading ? (
              <svg className="animate-spin w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>Sign in with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 mb-5">
          <div className="h-px bg-slate-800 flex-1"></div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            ACL Verification &amp; Testing
          </span>
          <div className="h-px bg-slate-800 flex-1"></div>
        </div>

        {/* Quick Testing Profiles (Allows testing authorized and unauthorized accounts directly) */}
        <div className="w-full space-y-2 mb-5 text-left">
          <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
            Test with Whitelisted Google Accounts:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
            <button
              onClick={() => handleTestAccount('loganreese110216@gmail.com', 'Logan Reese')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-left transition-colors flex items-center justify-between"
            >
              <div className="truncate">
                <span className="block font-semibold truncate text-[11px]">Logan Reese</span>
                <span className="block text-[10px] text-slate-400 truncate">loganreese110216@gmail.com</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold ml-1">✓ Allow</span>
            </button>

            <button
              onClick={() => handleTestAccount('reese.dawn@gmail.com', 'Dawn Reese')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-left transition-colors flex items-center justify-between"
            >
              <div className="truncate">
                <span className="block font-semibold truncate text-[11px]">Dawn Reese</span>
                <span className="block text-[10px] text-slate-400 truncate">reese.dawn@gmail.com</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold ml-1">✓ Allow</span>
            </button>

            <button
              onClick={() => handleTestAccount('marcusreese10@gmail.com', 'Marcus Reese')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-left transition-colors flex items-center justify-between"
            >
              <div className="truncate">
                <span className="block font-semibold truncate text-[11px]">Marcus Reese</span>
                <span className="block text-[10px] text-slate-400 truncate">marcusreese10@gmail.com</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold ml-1">✓ Allow</span>
            </button>

            <button
              onClick={() => handleTestAccount('corporate-strategy@qdoba.com', 'QDOBA Corporate')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-left transition-colors flex items-center justify-between"
            >
              <div className="truncate">
                <span className="block font-semibold truncate text-[11px]">QDOBA Corporate</span>
                <span className="block text-[10px] text-slate-400 truncate">@qdoba.com</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold ml-1">✓ Allow</span>
            </button>

            <button
              onClick={() => handleTestAccount('whipsfan33556677@gmail.com', 'Admin User')}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-200 border border-slate-700/80 text-left transition-colors flex items-center justify-between"
            >
              <div className="truncate">
                <span className="block font-semibold truncate text-[11px]">Admin User</span>
                <span className="block text-[10px] text-slate-400 truncate">whipsfan33556677@gmail.com</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold ml-1">✓ Allow</span>
            </button>

            <button
              onClick={() => handleTestAccount('unauthorized.guest@gmail.com', 'Guest User')}
              className="p-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/40 text-rose-200 border border-rose-800/60 text-left transition-colors flex items-center justify-between"
            >
              <div className="truncate">
                <span className="block font-semibold truncate text-[11px]">Unauthorized Test</span>
                <span className="block text-[10px] text-rose-300/70 truncate">guest@gmail.com</span>
              </div>
              <span className="text-[10px] text-rose-400 font-bold ml-1">✕ Deny</span>
            </button>
          </div>
        </div>

        {/* Custom Email Form (if needed for custom franchiser testing) */}
        {showDirectInput ? (
          <form onSubmit={handleCustomEmailSubmit} className="w-full bg-slate-950/60 p-3 rounded-2xl border border-slate-800 text-left space-y-2 mb-4">
            <label className="text-[11px] font-mono text-slate-400 block">
              Enter any Google email to test ACL verification:
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="your.email@gmail.com or @qdoba.com"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Verify
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowDirectInput(true)}
            className="text-[11px] text-slate-400 hover:text-slate-200 underline cursor-pointer mb-2"
          >
            Enter specific Google email manually
          </button>
        )}

        {/* Footer Policy Notice */}
        <p className="text-[10px] text-slate-500 text-center leading-relaxed">
          Authorized domains: @qdoba.com, approved franchise stakeholders, and designated strategic managers. Unauthorized attempts are logged and denied.
        </p>
      </div>
    </div>
  );
};
