import { Card, CardContent } from "@/components/molecules";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen pt-28 pb-12 animate-pulse">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-800 rounded" />
              <div className="h-4 w-48 bg-slate-800 rounded" />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-slate-800 rounded" />
            <div className="h-10 w-24 bg-slate-800 rounded" />
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl border border-slate-700/50" />
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Card Skeleton */}
          <div className="lg:col-span-1">
            <Card className="h-full border-slate-700/50 bg-slate-800/20">
              <CardContent className="pt-6 space-y-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-slate-800 mb-4" />
                  <div className="h-6 w-32 bg-slate-800 rounded mb-2" />
                  <div className="h-4 w-24 bg-slate-800 rounded" />
                </div>
                <div className="space-y-3">
                  <div className="h-10 bg-slate-800 rounded" />
                  <div className="h-10 bg-slate-800 rounded" />
                  <div className="h-10 bg-slate-800 rounded" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Cards Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-700/50 bg-slate-800/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded bg-slate-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-800 rounded" />
                    <div className="h-8 w-32 bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-800 rounded" />
              </CardContent>
            </Card>
            <Card className="border-slate-700/50 bg-slate-800/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded bg-slate-800" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-slate-800 rounded" />
                    <div className="h-8 w-32 bg-slate-800 rounded" />
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-800 rounded" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
