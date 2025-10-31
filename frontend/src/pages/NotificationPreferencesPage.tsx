import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { notificationsAPI, NotificationPreferences } from '../api/notifications';
import { SmartText } from '../i18n/smartTranslation';

export const NotificationPreferencesPage = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setIsLoading(true);
      const result = await notificationsAPI.getPreferences();
      setPreferences(result.data);
    } catch (err) {
      console.error('Failed to load preferences:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setIsSaving(true);
      setSuccess('');
      await notificationsAPI.updatePreferences(preferences);
      setSuccess('Preferences saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      alert('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreferences, value: any) => {
    if (preferences) {
      setPreferences({ ...preferences, [key]: value });
    }
  };

  if (isLoading || !preferences) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <SmartText tag="p" className="text-slate-600">Loading preferences...</SmartText>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass rounded-3xl p-6 shadow-xl animate-slide-down">
          <SmartText tag="h1" className="text-3xl font-bold gradient-text mb-2">⚙️ Notification Settings</SmartText>
          <SmartText tag="p" className="text-slate-600 text-sm">Manage your notification preferences</SmartText>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-green-700 animate-bounce-in">
            ✅ {success}
          </div>
        )}

        {/* Channels */}
        <div className="glass rounded-3xl p-6 shadow-xl">
          <SmartText tag="h2" className="text-xl font-bold text-slate-800 mb-4">📡 Notification Channels</SmartText>
          <div className="space-y-4">
            {[
              { key: 'enable_in_app', label: 'In-App Notifications', icon: '💻', description: 'Show notifications in the application' },
              { key: 'enable_email', label: 'Email Notifications', icon: '📧', description: 'Send notifications to your email' },
              { key: 'enable_sms', label: 'SMS Notifications', icon: '📱', description: 'Send text messages for critical alerts' },
              { key: 'enable_push', label: 'Push Notifications', icon: '🔔', description: 'Browser push notifications' },
            ].map((channel) => (
              <label key={channel.key} className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{channel.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{channel.label}</p>
                    <p className="text-sm text-slate-500">{channel.description}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences[channel.key as keyof NotificationPreferences] as boolean}
                  onChange={(e) => updatePreference(channel.key as keyof NotificationPreferences, e.target.checked)}
                  className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Notification Types */}
        <div className="glass rounded-3xl p-6 shadow-xl">
          <SmartText tag="h2" className="text-xl font-bold text-slate-800 mb-4">📋 Notification Types</SmartText>
          <div className="space-y-4">
            {[
              { key: 'stock_alerts', label: 'Stock Alerts', icon: '📦', description: 'Low stock, out of stock, reorder notifications' },
              { key: 'po_alerts', label: 'Purchase Order Alerts', icon: '📝', description: 'PO approvals, receipts, status changes' },
              { key: 'payment_alerts', label: 'Payment Alerts', icon: '💰', description: 'Overdue payments, payment received' },
              { key: 'system_alerts', label: 'System Alerts', icon: '⚙️', description: 'System updates, maintenance notifications' },
            ].map((type) => (
              <label key={type.key} className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <div>
                    <p className="font-semibold text-slate-800">{type.label}</p>
                    <p className="text-sm text-slate-500">{type.description}</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences[type.key as keyof NotificationPreferences] as boolean}
                  onChange={(e) => updatePreference(type.key as keyof NotificationPreferences, e.target.checked)}
                  className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="glass rounded-3xl p-6 shadow-xl">
          <SmartText tag="h2" className="text-xl font-bold text-slate-800 mb-4">🌙 Quiet Hours</SmartText>
          <SmartText tag="p" className="text-sm text-slate-600 mb-4">Mute notifications during specific hours</SmartText>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <SmartText tag="label" className="block text-sm font-semibold text-slate-700 mb-2">Start Time</SmartText>
              <select
                value={preferences.quiet_hours_start ?? ''}
                onChange={(e) => updatePreference('quiet_hours_start', e.target.value ? parseInt(e.target.value) : null)}
                className="input-field"
              >
                <option value="">Not set</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
            <div>
              <SmartText tag="label" className="block text-sm font-semibold text-slate-700 mb-2">End Time</SmartText>
              <select
                value={preferences.quiet_hours_end ?? ''}
                onChange={(e) => updatePreference('quiet_hours_end', e.target.value ? parseInt(e.target.value) : null)}
                className="input-field"
              >
                <option value="">Not set</option>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Daily Digest */}
        <div className="glass rounded-3xl p-6 shadow-xl">
          <SmartText tag="h2" className="text-xl font-bold text-slate-800 mb-4">📬 Daily Digest</SmartText>
          <label className="flex items-center justify-between p-4 bg-white rounded-xl hover:bg-slate-50 cursor-pointer mb-4">
            <div>
              <SmartText tag="p" className="font-semibold text-slate-800">Enable Daily Digest</SmartText>
              <SmartText tag="p" className="text-sm text-slate-500">Receive a summary of notifications once per day</SmartText>
            </div>
            <input
              type="checkbox"
              checked={preferences.daily_digest}
              onChange={(e) => updatePreference('daily_digest', e.target.checked)}
              className="w-6 h-6 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
          </label>

          {preferences.daily_digest && (
            <div>
              <SmartText tag="label" className="block text-sm font-semibold text-slate-700 mb-2">Digest Time</SmartText>
              <select
                value={preferences.digest_time ?? 9}
                onChange={(e) => updatePreference('digest_time', parseInt(e.target.value))}
                className="input-field"
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {i.toString().padStart(2, '0')}:00
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
          <button onClick={loadPreferences}
            className="btn-secondary px-8"
            disabled={isSaving}><SmartText>Reset</SmartText></button>
        </div>
      </div>
    </Layout>
  );
};





