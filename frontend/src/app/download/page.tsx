'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { ROUTES } from '@/lib/constants';
import {
  Download,
  Cpu,
  CheckCircle,
  ChevronRight,
  Zap,
} from 'lucide-react';

const CLIENT_LITE_URL = process.env.NEXT_PUBLIC_CLIENT_LITE_URL || '';

const systemRequirements = {
  minimum: [
    { label: 'OS', value: 'Windows 2000 / XP' },
    { label: 'Processor', value: 'Pentium 4 / Athlon XP (1.5 GHz)' },
    { label: 'Memory', value: '512 MB RAM' },
    { label: 'Graphics', value: 'DirectX 9.0 compatible GPU (64 MB VRAM)' },
    { label: 'Storage', value: '3 GB available space' },
    { label: 'Network', value: 'Broadband Internet connection' },
  ],
  recommended: [
    { label: 'OS', value: 'Windows XP / Vista' },
    { label: 'Processor', value: 'Pentium 4 (2.4 GHz) or better' },
    { label: 'Memory', value: '1 GB RAM' },
    { label: 'Graphics', value: 'DirectX 9.0 compatible GPU (128 MB VRAM)' },
    { label: 'Storage', value: '3 GB available space' },
    { label: 'Network', value: 'Broadband Internet connection' },
  ],
};

const downloadOptions = [
  {
    id: 'lite',
    name: 'Client Lite',
    size: 'N/A',
    description: 'The only available download option right now.',
    recommended: true,
    icon: Zap,
  },
];

const features = [
  'Virus-free guaranteed',
  'Auto-update system',
  'Quick installation',
  '24/7 support available',
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen pt-20">
      {/* Background */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 grid-pattern opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge variant="success" size="md" className="mb-4">
            <CheckCircle className="w-3 h-3" /> Latest Version: 4.2.1
          </Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">
            Download the Game
          </h1>
          <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto">
            Get ready to enter the wasteland. Download the client and start your adventure today.
          </p>
        </motion.div>

        {/* Download Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-16"
        >
          {downloadOptions.map((option) => {
            const Icon = option.icon;
            return (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  className={`h-full cursor-pointer transition-all ${
                    option.recommended ? 'border-red-500/50' : ''
                  }`}
                  variant={option.recommended ? 'glow' : 'default'}
                >
                  <CardContent className="pt-6">
                    {option.recommended && (
                      <Badge variant="danger" className="mb-4">
                        Recommended
                      </Badge>
                    )}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{option.name}</h3>
                        <p className="text-slate-400">{option.size}</p>
                      </div>
                    </div>
                    <p className="text-slate-400 mb-6">{option.description}</p>
                    {CLIENT_LITE_URL ? (
                      <a href={CLIENT_LITE_URL} target="_blank" rel="noreferrer" className="block">
                        <Button className="w-full" variant="primary">
                          <Download className="w-5 h-5" />
                          Download Now
                        </Button>
                      </a>
                    ) : (
                      <Button className="w-full" variant="primary" disabled>
                        <Download className="w-5 h-5" />
                        Download Now
                      </Button>
                    )}
                    {CLIENT_LITE_URL && (
                      <a
                        href={CLIENT_LITE_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block text-center text-sm text-cyan-300 hover:text-cyan-200 underline underline-offset-4"
                      >
                        Direct link
                      </a>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>{feature}</span>
            </div>
          ))}
        </motion.div>

        {/* System Requirements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-3xl font-display font-bold text-white text-center mb-8">
            System Requirements
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Minimum */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu className="w-6 h-6 text-slate-400" />
                  <h3 className="text-lg font-bold text-white">Minimum</h3>
                </div>
                <div className="space-y-4">
                  {systemRequirements.minimum.map((req, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-slate-400">{req.label}</span>
                      <span className="text-white text-right">{req.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommended */}
            <Card variant="glow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-bold text-white">Recommended</h3>
                  <Badge variant="warning" size="sm">Best Experience</Badge>
                </div>
                <div className="space-y-4">
                  {systemRequirements.recommended.map((req, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-slate-400">{req.label}</span>
                      <span className="text-white text-right">{req.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-slate-400 mb-4">
            Don&apos;t have an account yet?
          </p>
          <Link href={ROUTES.REGISTER}>
            <Button variant="outline" size="lg">
              Create Free Account
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
