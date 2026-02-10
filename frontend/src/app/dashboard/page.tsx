"use client";

import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { ROUTES } from "@/lib/constants";
import { useAuthStore } from "@/stores";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Coins,
  Download,
  Gamepad2,
  LogOut,
  Settings,
  Shield,
  Ticket,
  TrendingUp,
  User,
  UserCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isHydrated, logout, fetchProfile } =
    useAuthStore();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isHydrated, router]);

  // Fetch fresh profile data on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  if (!isHydrated || isLoading || !user) {
    return <DashboardSkeleton />;
  }

  const isAdmin = user.user_level >= 1000;

  return (
    <div className="min-h-screen pt-28 pb-12">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back,{" "}
                <span className="gradient-text-primary">
                  {user.disp_name || user.username}
                </span>
              </h1>
              <p className="text-slate-400">
                Let&apos;s check on your progress, survivor.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="danger"
                onClick={() => router.push(ROUTES.ADMIN)}
              >
                <Shield className="w-4 h-4" />
                GM Panel
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => router.push(ROUTES.PROFILE)}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
            <Button variant="ghost" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            {
              label: "CP Balance",
              value: user.cp?.toLocaleString() || "0",
              icon: Coins,
              color: "text-yellow-400",
            },
            {
              label: "User Level",
              value: user.user_level?.toString() || "0",
              icon: TrendingUp,
              color: "text-green-400",
            },
            {
              label: "Tickets",
              value: user.ticket_count?.toString() || "0",
              icon: Ticket,
              color: "text-cyan-400",
            },
            {
              label: "Characters",
              value: user.character_count?.toString() || "0",
              icon: UserCircle,
              color: "text-blue-400",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="glass rounded-xl p-5 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.label}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card variant="glow" className="h-full">
              <CardContent className="pt-6">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="relative mx-auto w-24 h-24 mb-4">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                      <Gamepad2 className="w-12 h-12 text-white" />
                    </div>
                    {isAdmin && (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-900 border-2 border-amber-500 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-amber-400" />
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    {user.disp_name || user.username}
                  </h3>
                  <p className="text-slate-400 text-sm">@{user.username}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {isAdmin && <Badge variant="warning">Admin</Badge>}
                    <Badge variant={user.enabled ? "success" : "danger"}>
                      {user.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>

                  {/* Account Info */}
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-slate-800/50">
                      <span className="text-slate-400">Email</span>
                      <span className="text-white font-medium text-sm truncate ml-2">
                        {user.email}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-slate-800/50">
                      <span className="text-slate-400">Characters</span>
                      <span className="text-white font-medium">
                        {user.character_count}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-2 rounded-lg bg-slate-800/50">
                      <span className="text-slate-400">Account Status</span>
                      <Badge variant="success" pulse>
                        Active
                      </Badge>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(ROUTES.GAME)}
                    >
                      <Gamepad2 className="w-4 h-4" />
                      Web Game
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => router.push(ROUTES.DOWNLOAD)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* CP Balance Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Your CP Balance</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      {user.cp?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  CP (Cash Points) can be used for in-game purchases. This is a
                  free server — no real money transactions.
                </p>
              </CardContent>
            </Card>

            {/* Tickets Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Tickets Available</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {user.ticket_count?.toString() || "0"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-500">
                  Tickets can be used for special events and promotions within
                  the game.
                </p>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card
                className="border-cyan-500/20 hover:border-cyan-500/40 transition-colors cursor-pointer group"
                onClick={() => router.push(ROUTES.DOWNLOAD)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Download className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          Download Client
                        </p>
                        <p className="text-sm text-slate-400">
                          Get the game client
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-emerald-500/20 hover:border-emerald-500/40 transition-colors cursor-pointer group"
                onClick={() => router.push(ROUTES.TICKETS)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Ticket className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          Support Tickets
                        </p>
                        <p className="text-sm text-slate-400">
                          Open & track requests
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>

              <Card
                className="border-teal-500/20 hover:border-teal-500/40 transition-colors cursor-pointer group"
                onClick={() => router.push(ROUTES.NEWS)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Server News</p>
                        <p className="text-sm text-slate-400">Latest updates</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-teal-400 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
