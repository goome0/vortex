'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button, Input, Alert } from '@/components/ui';
import { useAuthStore } from '@/stores';
import { ROUTES } from '@/lib/constants';
import { Mail, Lock, User, Gamepad2, ArrowRight, CheckCircle } from 'lucide-react';

const passwordRequirements = [
  { id: 'length', label: 'At least 8 characters', regex: /.{8,}/ },
  { id: 'uppercase', label: 'One uppercase letter', regex: /[A-Z]/ },
  { id: 'lowercase', label: 'One lowercase letter', regex: /[a-z]/ },
  { id: 'number', label: 'One number', regex: /[0-9]/ },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Password strength check
  const passwordStrength = passwordRequirements.filter((req) =>
    req.regex.test(password)
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, router]);

  // Clear errors on unmount
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!username) {
      errors.username = 'Username is required';
    } else if (username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (passwordStrength.length < 4) {
      errors.password = 'Password does not meet requirements';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      errors.terms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await register(username, email, password);
    if (success) {
      router.push(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-white">
            Join the Wasteland
          </h1>
          <p className="mt-2 text-slate-400">
            Create your account and start your adventure
          </p>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8 shadow-2xl"
        >
          {error && (
            <Alert variant="error" className="mb-6" dismissible onDismiss={clearError}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="text"
              label="Username"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              error={formErrors.username}
              icon={<User className="w-5 h-5" />}
              disabled={isLoading}
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="survivor@wasteland.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={formErrors.email}
              icon={<Mail className="w-5 h-5" />}
              disabled={isLoading}
            />

            <div>
              <Input
                type="password"
                label="Password"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={formErrors.password}
                icon={<Lock className="w-5 h-5" />}
                disabled={isLoading}
              />
              {/* Password Requirements */}
              {password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-3 grid grid-cols-2 gap-2"
                >
                  {passwordRequirements.map((req) => {
                    const isMet = req.regex.test(password);
                    return (
                      <div
                        key={req.id}
                        className={`flex items-center gap-1.5 text-xs ${
                          isMet ? 'text-green-400' : 'text-slate-500'
                        }`}
                      >
                        <CheckCircle className={`w-3 h-3 ${isMet ? 'text-green-400' : 'text-slate-600'}`} />
                        {req.label}
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={formErrors.confirmPassword}
              icon={<Lock className="w-5 h-5" />}
              disabled={isLoading}
            />

            <div>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  I accept the{' '}
                  <Link href="/terms" className="text-cyan-400 hover:text-cyan-300">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-cyan-400 hover:text-cyan-300">
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {formErrors.terms && (
                <p className="mt-1 text-sm text-red-400">{formErrors.terms}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-900/80 text-slate-500">
                Already a survivor?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link href={ROUTES.LOGIN}>
            <Button variant="outline" className="w-full">
              Sign In Instead
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
