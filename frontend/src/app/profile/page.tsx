'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { motion } from 'framer-motion';
import { Badge, Button, Card, CardContent, Input, Alert } from '@/components/ui';
import { ROUTES, TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/constants';
import { authApi, getErrorMessage } from '@/lib/api';
import { useAuthStore } from '@/stores';
import { KeyRound, LogOut, Save, Shield, User } from 'lucide-react';

const REMEMBER_ME_KEY = 'vortex_remember_me';
const COOKIE_PATH = '/';
const STORAGE_TOKEN_KEY = TOKEN_KEY;
const STORAGE_REFRESH_TOKEN_KEY = REFRESH_TOKEN_KEY;

function getCookieOptions() {
  const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
  return { secure: isHttps, sameSite: 'strict' as const, path: COOKIE_PATH };
}

function getStored(key: string): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(key) ?? undefined;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isHydrated, isLoading, logout, fetchProfile } = useAuthStore();

  const [rememberMe, setRememberMe] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setRememberMe(window.localStorage.getItem(REMEMBER_ME_KEY) === '1');
  }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isHydrated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  const isAdmin = (user?.user_level ?? 0) >= 1000;

  const lastLoginText = useMemo(() => {
    const ts = user?.last_login ?? 0;
    if (!ts) return '—';
    try {
      return new Date(ts * 1000).toLocaleString();
    } catch {
      return String(ts);
    }
  }, [user?.last_login]);

  const handleSavePreferences = async () => {
    setSaving(true);
    setError('');
    try {
      const token = Cookies.get(TOKEN_KEY) || getStored(STORAGE_TOKEN_KEY);
      const refreshToken = Cookies.get(REFRESH_TOKEN_KEY) || getStored(STORAGE_REFRESH_TOKEN_KEY);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? '1' : '0');
      }

      const cookieOptions = getCookieOptions();
      if (token) {
        Cookies.set(TOKEN_KEY, token, {
          ...cookieOptions,
          ...(rememberMe && { expires: 7 }),
        });
      }
      if (refreshToken) {
        Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
          ...cookieOptions,
          ...(rememberMe && { expires: 30 }),
        });
      }

      setSuccessMessage('Settings saved');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    setPasswordLoading(true);
    setError('');
    try {
      const pw = newPassword.trim();
      if (pw.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      if (pw.length > 16) {
        throw new Error('Password must be at most 16 characters');
      }
      if (pw !== confirmPassword.trim()) {
        throw new Error('Passwords do not match');
      }

      await authApi.resetPassword(pw);
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password updated successfully');
      setTimeout(() => setSuccessMessage(''), 2500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!isHydrated || isLoading || !user) {
    return (
      <div className="min-h-screen pt-28 pb-12">
        <div className="absolute inset-0 hero-gradient" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-8 border border-slate-700/50">
            <p className="text-slate-300">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-12">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <User className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400">Manage your account preferences</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="danger" onClick={() => router.push(ROUTES.ADMIN)}>
                  <Shield className="w-4 h-4" />
                  GM Panel
                </Button>
              )}
              <Button variant="ghost" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {successMessage && (
          <Alert variant="success" dismissible onDismiss={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert variant="error" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="glow">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-white">Profile</h3>
                <Badge variant={isAdmin ? 'danger' : 'default'}>
                  {isAdmin ? `GM ${user.user_level}` : 'Player'}
                </Badge>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Username</span>
                  <span className="text-white font-medium">{user.username}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Display name</span>
                  <span className="text-white font-medium">{user.disp_name || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Email</span>
                  <span className="text-white font-medium">{user.email || '—'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Last login</span>
                  <span className="text-white font-medium">{lastLoginText}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">COMP Credits</span>
                  <span className="text-white font-medium">{(user.cp ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Tickets</span>
                  <span className="text-white font-medium">{user.ticket_count ?? 0}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-slate-400">Characters</span>
                  <span className="text-white font-medium">{user.character_count ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="glow">
            <CardContent className="pt-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Preferences</h3>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-cyan-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <div>
                  <p className="text-white font-medium">Remember me</p>
                  <p className="text-slate-400 text-sm">
                    Keep you signed in across browser restarts (updates cookie expiration).
                  </p>
                </div>
              </label>

              <Button
                variant="secondary"
                onClick={handleSavePreferences}
                disabled={saving}
                className="w-full"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save preferences'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card variant="glow">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-white">Change password</h3>
              <Badge variant="default">6–16 chars</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="password"
                label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<KeyRound className="w-5 h-5" />}
                maxLength={16}
              />
              <Input
                type="password"
                label="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                maxLength={16}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                variant="secondary"
                onClick={handleResetPassword}
                disabled={passwordLoading}
              >
                <KeyRound className="w-4 h-4" />
                {passwordLoading ? 'Updating...' : 'Update password'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

