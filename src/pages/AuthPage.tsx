import { useState } from 'react';
import { useAuth } from '@/store/AuthContext';
import { useStore } from '@/store/StoreContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, KeyRound, CheckCircle } from 'lucide-react';

type Mode = 'login' | 'register' | 'forgot';

export default function AuthPage({ mode: initialMode }: { mode: 'login' | 'register' }) {
  const { signIn, signUp, resetPassword } = useAuth();
  const { navigate } = useStore();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'forgot') {
      setLoading(true);
      const { error } = await resetPassword(email);
      setLoading(false);
      if (error) setError(error);
      else setResetSent(true);
      return;
    }

    setLoading(true);

    if (mode === 'register') {
      const { error } = await signUp(email, password, fullName);
      if (error) setError(error);
      else navigate('account');
    } else {
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('account');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center max-w-md mx-auto px-4 py-12">
      <div className="w-full bg-ivory dark:bg-walnut-950 rounded-card p-8 border border-champagne-200 dark:border-champagne-900/40 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-medium text-walnut-900 dark:text-ivory tracking-[0.25em]">GALINEX</h1>
          <p className="text-sm text-walnut-500 dark:text-beige-400 mt-3 tracking-wide">
            {mode === 'register' ? 'Create your account' : mode === 'forgot' ? 'Reset your password' : 'Welcome back'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-card bg-rose-50 dark:bg-rose-900/20 text-rose-600 text-sm border border-rose-200 dark:border-rose-900/40">
            {error}
          </div>
        )}

        {mode === 'forgot' && resetSent ? (
          <div className="text-center py-6">
            <CheckCircle size={48} className="mx-auto text-champagne-500 mb-4" />
            <h3 className="font-display text-xl text-walnut-900 dark:text-ivory mb-2">Check Your Email</h3>
            <p className="text-sm text-walnut-500 dark:text-beige-400 mb-6">We've sent a password reset link to {email}.</p>
            <button onClick={() => { setMode('login'); setResetSent(false); }} className="text-champagne-700 dark:text-champagne-400 font-medium hover:underline text-sm">
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium uppercase tracking-wider text-walnut-600 dark:text-beige-300 mb-2 block">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne-500" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 rounded-card bg-cream dark:bg-walnut-900 text-sm text-walnut-900 dark:text-ivory outline-none focus:ring-1 focus:ring-champagne-500 border border-champagne-200 dark:border-walnut-800 transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-walnut-600 dark:text-beige-300 mb-2 block">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-card bg-cream dark:bg-walnut-900 text-sm text-walnut-900 dark:text-ivory outline-none focus:ring-1 focus:ring-champagne-500 border border-champagne-200 dark:border-walnut-800 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-walnut-600 dark:text-beige-300">Password</label>
                  <button type="button" onClick={() => setMode('forgot')} className="text-xs text-champagne-600 dark:text-champagne-400 hover:underline flex items-center gap-1">
                    <KeyRound size={11} /> Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-champagne-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3 rounded-card bg-cream dark:bg-walnut-900 text-sm text-walnut-900 dark:text-ivory outline-none focus:ring-1 focus:ring-champagne-500 border border-champagne-200 dark:border-walnut-800 transition-colors"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-champagne-500 hover:text-champagne-600 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-card bg-champagne-600 hover:bg-champagne-500 text-ivory font-medium tracking-wide flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
            >
              {loading ? 'Please wait...' : mode === 'register' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {mode !== 'forgot' && (
          <p className="text-center text-sm text-walnut-500 dark:text-beige-400 mt-6">
            {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setMode(mode === 'register' ? 'login' : 'register')} className="text-champagne-700 dark:text-champagne-400 font-medium hover:underline">
              {mode === 'register' ? 'Sign In' : 'Register'}
            </button>
          </p>
        )}
        {mode === 'forgot' && !resetSent && (
          <p className="text-center text-sm text-walnut-500 dark:text-beige-400 mt-6">
            <button onClick={() => setMode('login')} className="text-champagne-700 dark:text-champagne-400 font-medium hover:underline">
              Back to Sign In
            </button>
          </p>
        )}

        {mode === 'login' && (
          <div className="mt-6 pt-6 border-t border-champagne-200/30 dark:border-champagne-900/20">
            <p className="text-center text-xs text-walnut-400 dark:text-beige-500">Admin access requires authorized credentials.</p>
          </div>
        )}
      </div>
    </div>
  );
}
