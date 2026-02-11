'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import { 
  Shield, 
  AlertTriangle, 
  Heart, 
  Scale, 
  ChevronLeft,
  FileText,
  Ban,
  DollarSign,
  Users,
  Mail
} from 'lucide-react';

export default function TermsPage() {
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
            <Scale className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white">
            Terms of Service
          </h1>
          <p className="mt-4 text-slate-400 max-w-2xl mx-auto">
            Please read these terms carefully before using our service.
            Last updated: February 2026
          </p>
        </motion.div>

        {/* Important Disclaimer Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30"
        >
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">
                Important Legal Notice
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                This is a <strong>fan-operated private server</strong> for the discontinued MMORPG 
                "Shin Megami Tensei: IMAGINE Online". All intellectual property rights, including 
                but not limited to trademarks, copyrights, and game assets, belong to their 
                respective owners: <strong>ATLUS Co., Ltd., SEGA Corporation, Cave Co., Ltd., 
                and Marvelous Inc.</strong> This server is operated entirely by fans for fans, 
                with no commercial intent whatsoever.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Terms Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Section 1 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <h2 className="text-xl font-bold text-white">1. Intellectual Property Rights</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                "Shin Megami Tensei: IMAGINE Online" and all related content, including but not 
                limited to characters, artwork, music, storylines, and game mechanics, are the 
                intellectual property of <strong>ATLUS Co., Ltd.</strong> and its affiliated 
                companies, including <strong>SEGA Corporation</strong>, <strong>Cave Co., Ltd.</strong>, 
                and <strong>Marvelous Inc.</strong>
              </p>
              <p>
                This private server does not claim ownership of any game content. We operate 
                solely as a fan preservation project to maintain the community and memories 
                of this beloved game that was officially discontinued.
              </p>
              <p className="text-amber-400 font-medium">
                Should any rights holder request the removal or cessation of this service, 
                we will comply immediately and without reservation. We fully respect and 
                acknowledge the rights of all intellectual property owners.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">2. Non-Commercial Nature</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                <strong className="text-white">This server is completely free to play and operates 
                on a strictly non-commercial basis.</strong> We want to make this absolutely clear:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No real money transactions</strong> are accepted or processed on this server.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No in-game items, currency, or services</strong> can be purchased with real money.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No donations</strong> are solicited or accepted for server operation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Ban className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>No premium memberships</strong> or paid advantages exist.</span>
                </li>
              </ul>
              <p>
                All server costs are covered entirely by the volunteer staff. Our only goal is 
                to preserve this game for the community, not to generate profit.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-xl font-bold text-white">3. Fan Preservation Project</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                This server exists solely as a <strong>fan preservation project</strong> dedicated 
                to keeping the spirit of Shin Megami Tensei: IMAGINE alive in the hearts of 
                its devoted community.
              </p>
              <p>
                When the official servers were shut down, many players lost not just a game, 
                but a community, friendships, and countless memories. Our mission is to provide 
                a space where these connections can continue to flourish.
              </p>
              <p>
                We operate out of love for this game and its community. We do not represent, 
                nor are we affiliated with, endorsed by, or connected to ATLUS, SEGA, Cave, 
                Marvelous, or any of their subsidiaries.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white">4. User Conduct</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>By using this service, you agree to:</p>
              <ul className="space-y-2 ml-4 list-disc list-inside">
                <li>Treat all community members with respect and dignity</li>
                <li>Not engage in harassment, hate speech, or discriminatory behavior</li>
                <li>Not attempt to exploit, hack, or disrupt the server or its services</li>
                <li>Not engage in real-money trading of any kind related to this server</li>
                <li>Understand that this is an unofficial, fan-run server</li>
                <li>Accept that the service may be discontinued at any time</li>
              </ul>
            </div>
          </section>

          {/* Section 5 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="text-xl font-bold text-white">5. Disclaimer of Warranty</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                This service is provided <strong>"AS IS"</strong> without warranty of any kind, 
                express or implied. We make no guarantees regarding:
              </p>
              <ul className="space-y-2 ml-4 list-disc list-inside">
                <li>Server uptime or availability</li>
                <li>Data persistence or account security beyond reasonable measures</li>
                <li>Game content accuracy or completeness</li>
                <li>Continued operation of the service</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue the service at any 
                time without prior notice, particularly in response to requests from 
                intellectual property rights holders.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="glass rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-slate-500/10 border border-slate-500/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-white">6. Contact & Takedown Requests</h2>
            </div>
            <div className="space-y-4 text-slate-300 leading-relaxed">
              <p>
                If you are a representative of ATLUS, SEGA, Cave, Marvelous, or any other 
                rights holder and wish to request the removal of this service or any content, 
                please contact us. We are committed to responding promptly and complying 
                with all legitimate requests.
              </p>
              <p>
                For general inquiries or concerns, please contact us through our community Discord:
              </p>
              <p>
                <a
                  href="https://discord.gg/Njz2wmGr"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
                >
                  discord.gg/Njz2wmGr
                </a>
              </p>
            </div>
          </section>

          {/* Acceptance */}
          <section className="glass rounded-2xl p-8 bg-gradient-to-r from-cyan-500/5 to-teal-500/5 border-cyan-500/30">
            <div className="text-center">
              <h3 className="text-lg font-bold text-white mb-4">
                Acceptance of Terms
              </h3>
              <p className="text-slate-300 mb-6">
                By creating an account, logging in, or using any part of this service, 
                you acknowledge that you have read, understood, and agree to be bound 
                by these Terms of Service.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={ROUTES.REGISTER}>
                  <Button size="lg">
                    I Understand - Create Account
                  </Button>
                </Link>
                <Link href={ROUTES.HOME}>
                  <Button variant="ghost" size="lg">
                    Return to Home
                  </Button>
                </Link>
              </div>
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
