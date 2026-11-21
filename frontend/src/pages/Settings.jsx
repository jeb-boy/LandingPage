
import { useEffect, useState } from 'react';
import { api } from '../api/client';

export default function Settings() {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    role: 'student',
    program: '',
    yearLevel: '',
  });

  const [prefs, setPrefs] = useState({
    notifications: true,
    emailUpdates: true,
    theme: 'light',
  });

  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load profile and preferences
  useEffect(() => {
    let active = true;

    async function loadSettings() {
      try {
        const [p, s] = await Promise.all([
          api.getProfile(),
          api.getSettings(),
        ]);

        if (!active) return;

        setProfile(p.profile);

        setPrefs({
          notifications: s.settings.notifications,
          emailUpdates: s.settings.email_updates,
          theme: s.settings.theme,
        });
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setBusy(false);
      }
    }

    loadSettings();

    return () => {
      active = false;
    };
  }, []);

  // Apply selected theme immediately
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark =
        prefs.theme === 'dark' ||
        (prefs.theme === 'system' && media.matches);

      root.classList.toggle('dark-theme', isDark);
    };

    applyTheme();

    if (prefs.theme === 'system') {
      media.addEventListener('change', applyTheme);

      return () => {
        media.removeEventListener('change', applyTheme);
      };
    }
  }, [prefs.theme]);

  // Save profile
  async function saveProfile(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const r = await api.updateProfile({
        fullName: profile.fullName,
        program: profile.program,
        yearLevel: profile.yearLevel,
      });

      setProfile(r.profile);
      setEditing(false);
      setMessage('Profile saved to the database.');
    } catch (e) {
      setError(e.message);
    }
  }

  // Save preferences
  async function savePrefs() {
    setError('');
    setMessage('');

    try {
      const r = await api.saveSettings(prefs);

      const savedPrefs = {
        notifications: r.settings.notifications,
        emailUpdates: r.settings.email_updates,
        theme: r.settings.theme,
      };

      setPrefs(savedPrefs);

      window.dispatchEvent(
        new CustomEvent('themeChanged', {
          detail: r.settings.theme,
        })
      );

      setMessage('Preferences saved to the database.');
    } catch (e) {
      setError(e.message);
    }
  }

  // Change password
  async function changePassword(e) {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      const r = await api.changePassword({
        currentPassword,
        newPassword,
      });

      setMessage(r.message);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError(e.message);
    }
  }

  if (busy) {
    return <p className="p-6">Loading account settings…</p>;
  }

  return (
    <div className="fade-in max-w-3xl">
      <h1 className="text-xl font-semibold mb-1">Settings</h1>

      <p className="text-sm text-gray-500 mb-6">
        Manage your account and saved preferences.
      </p>

      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 text-red-700 p-3 text-sm">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mb-4 rounded-lg bg-emerald-50 text-emerald-800 p-3 text-sm">
          {message}
        </p>
      )}

      {/* Profile Information */}
      <section className="settings-panel rounded-xl border p-6 mb-5">
        <h2 className="font-semibold mb-4">Profile Information</h2>

        <form onSubmit={saveProfile} className="space-y-4">
          <label className="block text-sm">
            Full Name
            <input
              disabled={!editing}
              value={profile.fullName || ''}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="settings-input mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
              required
            />
          </label>

          <label className="block text-sm">
            Email Address
            <input
              value={profile.email || ''}
              readOnly
              className="settings-input mt-1 w-full px-3 py-2 border rounded-lg bg-gray-50"
            />
          </label>

          <label className="block text-sm">
            Role
            <input
              value={profile.role || ''}
              readOnly
              className="settings-input mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </label>

          <label className="block text-sm">
            Program
            <input
              disabled={!editing}
              value={profile.program || ''}
              onChange={(e) => setProfile({ ...profile, program: e.target.value })}
              className="settings-input mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
            />
          </label>

          <label className="block text-sm">
            Year Level
            <input
              disabled={!editing}
              value={profile.yearLevel || ''}
              onChange={(e) => setProfile({ ...profile, yearLevel: e.target.value })}
              className="settings-input mt-1 w-full px-3 py-2 border rounded-lg disabled:bg-gray-50"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 border rounded-lg text-sm"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>

            {editing && (
              <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm">
                Save Profile
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Preferences */}
      <section className="settings-panel rounded-xl border p-6 mb-5">
        <h2 className="font-semibold mb-4">Preferences</h2>

        <div className="space-y-5 text-sm">
          <label className="flex justify-between gap-4">
            Notifications
            <input
              type="checkbox"
              checked={prefs.notifications}
              onChange={(e) => setPrefs({ ...prefs, notifications: e.target.checked })}
            />
          </label>

          <label className="flex justify-between gap-4">
            Email Updates
            <input
              type="checkbox"
              checked={prefs.emailUpdates}
              onChange={(e) => setPrefs({ ...prefs, emailUpdates: e.target.checked })}
            />
          </label>

          <label className="flex justify-between gap-4">
            Theme
            <select
              value={prefs.theme}
              onChange={(e) => setPrefs({ ...prefs, theme: e.target.value })}
              className="settings-input border rounded-lg px-3 py-2"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </label>
        </div>

        <button
          onClick={savePrefs}
          className="mt-5 px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm"
        >
          Save Preferences
        </button>
      </section>

      {/* Change Password */}
      <section className="settings-panel rounded-xl border p-6">
        <h2 className="font-semibold mb-4">Change Password</h2>

        <form onSubmit={changePassword} className="space-y-3 max-w-md">
          {[
            ['Current password', currentPassword, setCurrentPassword],
            ['New password', newPassword, setNewPassword],
            ['Confirm new password', confirmPassword, setConfirmPassword],
          ].map(([label, value, setter]) => (
            <label key={label} className="block text-sm">
              {label}
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                minLength={10}
                required
                className="settings-input mt-1 w-full border rounded-lg px-3 py-2"
              />
            </label>
          ))}

          <button className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-sm">
            Update Password
          </button>
        </form>
      </section>
    </div>
  );
}
