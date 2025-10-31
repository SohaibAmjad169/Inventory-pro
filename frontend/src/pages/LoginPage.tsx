import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../i18n/i18nContext';
import { SmartText } from '../i18n/smartTranslation';

export const LoginPage = () => {
  const { t } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(identifier, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="blob blob-blue w-72 h-72 top-0 -left-24"></div>
        <div className="blob blob-purple w-72 h-72 top-1/2 -right-24"></div>
        <div className="blob blob-pink w-72 h-72 bottom-0 left-1/2"></div>
      </div>

      {/* Login Card */}
      <div className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md relative z-10 animate-scale-in shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 gradient-text text-shadow-lg">
            {t.auth.login}
          </h1>
          <p className="text-slate-600 text-sm">
            {t.auth.signIn}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username/Email Input */}
          <div className="animate-slide-up" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.auth.username}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="input-field"
              placeholder={t.auth.username}
            />
          </div>

          {/* Password Input */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.auth.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-field"
              placeholder={t.auth.password}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-bounce-in">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`btn-primary w-full ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t.common.loading}
              </span>
            ) : (
              t.auth.signIn
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 glass rounded-xl p-4 animate-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <SmartText tag="p" className="text-xs font-semibold text-slate-700 mb-2">Demo Credentials:</SmartText>
          <div className="space-y-1 text-xs text-slate-600">
            <p><SmartText tag="span" className="font-mono bg-slate-100 px-2 py-1 rounded">owner</SmartText> / <SmartText tag="span" className="font-mono bg-slate-100 px-2 py-1 rounded">Owner@123456</SmartText></p>
            <p><SmartText tag="span" className="font-mono bg-slate-100 px-2 py-1 rounded">admin</SmartText> / <SmartText tag="span" className="font-mono bg-slate-100 px-2 py-1 rounded">Admin@123456</SmartText></p>
            <p><SmartText tag="span" className="font-mono bg-slate-100 px-2 py-1 rounded">guest_user</SmartText> / <SmartText tag="span" className="font-mono bg-slate-100 px-2 py-1 rounded">Guest@123456</SmartText></p>
          </div>
        </div>
      </div>
    </div>
  );
};
