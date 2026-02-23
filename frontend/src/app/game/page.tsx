'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/atoms';
import { Card, CardContent } from '@/components/molecules';
import { ROUTES } from '@/lib/constants';
import { useAuthStore } from '@/stores';
import { Gamepad2, ArrowLeft } from 'lucide-react';

export default function GamePage() {
  const router = useRouter();
  const { isHydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.GAME)}`);
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen pt-28 pb-12 px-4">
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-xl mx-auto">
        <Card className="border-slate-700/50">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Gamepad2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Game</h1>
              <p className="text-slate-400 mt-1">
                This web panel doesn&apos;t include the game client yet.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button variant="secondary" onClick={() => router.push(ROUTES.DASHBOARD)}>
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
