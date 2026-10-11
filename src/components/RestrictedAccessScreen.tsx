import React from 'react';
import { AuthUserProfile } from '../services/auth';
import { BrandLogo } from '../assets/brandLogos';

interface RestrictedAccessScreenProps {
  user: AuthUserProfile;
  onSignOut: () => void;
  onRetryLogin: () => void;
}

export const RestrictedAccessScreen: React.FC<RestrictedAccessScreenProps> = ({
  user,
  onSignOut,
  onRetryLogin,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white font-sans overflow-y-auto">
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-900/20 via-transparent to-transparent pointer-events-none" />

      <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-rose-500/30 shadow-[0_25px_60px_-15px_rgba(244,63,94,0.25)] p-8 sm:p-10 flex flex-col items-center text-center animate-fadeIn my-auto">
        {/* Shield / Access Denied Icon with QDOBA Branding */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-rose-950/80 border-2 border-rose-500/50 flex items-center justify-center shadow-lg shadow-rose-900/40">
            <svg
              className="w-10 h-10 text-rose-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.002A11.959 11.959 0 0112 3.464zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white p-0.5 shadow-md flex items-center justify-center">
            <BrandLogo brand="QDOBA" size={28} />
          </div>
        </div>

        {/* Security Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-medium mb-4 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse"></span>
          Access Control Enforced · 403 Forbidden
        </div>

        {/* Main Headings */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          Restricted Access
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed mb-6 max-w-md">
          Your Google account is not on the authorized Access Control List (ACL) for the confidential South Bay QDOBA Competitive Landscape map.
        </p>

        {/* User Identity Pill */}
        <div className="w-full bg-slate-800/80 rounded-2xl border border-slate-700 p-4 mb-6 text-left flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-10 h-10 rounded-full border border-slate-600 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 text-slate-300 font-bold flex items-center justify-center shrink-0 text-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">
                Logged in as
              </span>
              <span className="text-xs font-bold text-slate-200 truncate block">
                {user.email}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
            Unauthorized
          </span>
        </div>

        {/* Authorized Policy Notice */}
        <div className="w-full bg-slate-950/60 rounded-2xl border border-slate-800 p-4 mb-6 text-left text-xs text-slate-400 space-y-2">
          <div className="font-semibold text-slate-300 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Authorized Accounts Only:
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1 font-mono">
            <li>loganreese110216@gmail.com</li>
            <li>reese.dawn@gmail.com</li>
            <li>marcusreese10@gmail.com</li>
            <li>Any corporate email ending in @qdoba.com</li>
            <li>Verified franchise partner &amp; strategy stakeholders</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onSignOut}
            className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Switch Account / Sign In
          </button>

          <a
            href={`mailto:loganreese110216@gmail.com?subject=Access%20Request%20for%20QDOBA%20South%20Bay%20Map&body=Hello%2C%0A%0APlease%20grant%20access%20to%20my%20email%3A%20${encodeURIComponent(
              user.email
            )}%20for%20the%20QDOBA%20South%20Bay%20Strategic%20Competitor%20Map.`}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 font-semibold text-xs transition-all duration-150 flex items-center justify-center gap-2"
          >
            Request Access
          </a>
        </div>
      </div>
    </div>
  );
};
