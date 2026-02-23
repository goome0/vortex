'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/atoms';
import { ROUTES } from '@/lib/constants';
import { 
  Lock, 
  Eye, 
  Database, 
  Shield,
  ChevronLeft,
  Cookie,
  Server,
  UserCog
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href={ROUTES.HOME}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 mb-6">
            <Lock className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white">
            Privacy Policy
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains what information we collect 
            and how we use it. Last updated: February 2026
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Fan Project Notice */}
          <section className="glass rounded-2xl p-8 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 border-cyan-500/30">
            <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Fan Preservation Project
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  This is a non-commercial, fan-operated private server for Shin Megami Tensei: IMAGINE, 
                  a discontinued MMORPG. We collect minimal data necessary to provide the service and 
                  do not sell, share, or monetize any user information. All intellectual property 
                  rights belong to ATLUS, SEGA, Cave, and Marvelous.
                </p>
              </div>
            </div>
          </section>

          {/* Section 1 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Database className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>We collect only the minimum information necessary to operate the service:</p>
              <ul className="space-y-3 ml-4">
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-white">Account Information:</strong> Username, email address, 
                    and encrypted password. This is required to create and secure your account.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-white">Game Data:</strong> Character information, progress, 
                    inventory, and other in-game data necessary for gameplay.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-cyan-400 font-bold">•</span>
                  <div>
                    <strong className="text-white">Connection Data:</strong> IP addresses and connection 
                    logs for security purposes and to prevent abuse.
                  </div>
                </li>
              </ul>
              <p className="text-green-400 font-medium">
                We do NOT collect: payment information, personal identification documents, 
                location data, or any information unrelated to game operation.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <Eye className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>Your information is used exclusively for:</p>
              <ul className="space-y-2 ml-4 list-disc list-inside">
                <li>Providing and maintaining the game service</li>
                <li>Account authentication and security</li>
                <li>Preventing cheating, abuse, and unauthorized access</li>
                <li>Communicating important service updates</li>
                <li>Improving the game experience for all players</li>
              </ul>
              <p className="text-amber-400 font-medium">
                We will NEVER sell, rent, or share your personal information with third parties 
                for commercial purposes. This is a non-profit fan project.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <Server className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">3. Data Storage & Security</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                We implement reasonable security measures to protect your data:
              </p>
              <ul className="space-y-2 ml-4 list-disc list-inside">
                <li>Passwords are encrypted using industry-standard hashing algorithms</li>
                <li>Database access is restricted to authorized personnel only</li>
                <li>Connection logs are periodically purged</li>
                <li>We use secure connections (HTTPS) for web communications</li>
              </ul>
              <p>
                However, as a volunteer-run project, we cannot guarantee absolute security. 
                We recommend using a unique password for this service that you don't use elsewhere.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
                <Cookie className="w-5 h-5 text-orange-400" />
              </div>
              <h2 className="text-xl font-bold text-white">4. Cookies & Local Storage</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                We use cookies and local storage solely for:
              </p>
              <ul className="space-y-2 ml-4 list-disc list-inside">
                <li>Maintaining your login session</li>
                <li>Remembering your preferences</li>
                <li>Basic website functionality</li>
              </ul>
              <p>
                We do not use tracking cookies, analytics services, or advertising cookies. 
                Your browsing activity is not monitored or shared with any third parties.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                <UserCog className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-xl font-bold text-white">5. Your Rights</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="space-y-2 ml-4 list-disc list-inside">
                <li>Request access to your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your account and associated data</li>
                <li>Withdraw consent at any time by discontinuing use of the service</li>
              </ul>
              <p>
                To exercise these rights, please contact us through our community Discord 
                server or via the contact methods provided on this website.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">6. Service Discontinuation</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                As a fan-operated service, we may be required to discontinue operations 
                at the request of rights holders (ATLUS, SEGA, Cave, Marvelous, or their 
                representatives). In such an event:
              </p>
              <ul className="space-y-2 ml-4 list-disc list-inside">
                <li>We will provide advance notice when possible</li>
                <li>All user data will be securely deleted</li>
                <li>No data will be transferred to any third party</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="glass rounded-2xl p-8 text-center">
            <h3 className="text-lg font-bold text-white mb-4">
              Questions or Concerns?
            </h3>
            <p className="text-slate-300 mb-6">
              If you have any questions about this Privacy Policy, please reach out 
              to us through our community Discord.
            </p>
            <a
              href="https://discord.gg/Njz2wmGr"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:text-cyan-200 hover:border-cyan-500/50 transition-colors mb-6"
            >
              discord.gg/Njz2wmGr
            </a>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={ROUTES.HOME}>
                <Button variant="ghost" size="lg">
                  Return to Home
                </Button>
              </Link>
              <Link href="/terms">
                <Button variant="outline" size="lg">
                  View Terms of Service
                </Button>
              </Link>
            </div>
          </section>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-slate-500 mt-12"
        >
          © {new Date().getFullYear()} Vortex/Heeho Server - A Fan Preservation Project
          <br />
          Shin Megami Tensei: IMAGINE © ATLUS / SEGA / Cave / Marvelous
        </motion.p>
      </div>
    </div>
  );
}
