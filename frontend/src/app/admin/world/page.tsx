'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, Button, Input } from '@/components/atoms';
import { Card, CardContent } from '@/components/molecules';
import { adminApi, getErrorMessage } from '@/lib/api';
import {
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle,
  Monitor,
  Terminal,
  Type,
} from 'lucide-react';

export default function AdminWorldPage() {
  const [message, setMessage] = useState('');
  const [worldId, setWorldId] = useState('0');
  const [worlds, setWorlds] = useState<Array<{ world_id: number; character_count: number }>>([]);
  const [worldsLoading, setWorldsLoading] = useState(false);
  const [messageType, setMessageType] = useState<'console' | 'ticker'>('ticker');
  const [from, setFrom] = useState('SYSTEM');
  const [mode, setMode] = useState('0');
  const [subMode, setSubMode] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadWorlds = async () => {
      setWorldsLoading(true);
      try {
        const res = await adminApi.getWorlds();
        const list = (res.data?.data?.worlds ?? []) as Array<{ world_id: number; character_count: number }>;
        if (!cancelled) {
          setWorlds(list);
          const hasWorld0 = list.some((w) => w.world_id === 0);
          if (hasWorld0) {
            setWorldId('0');
          } else if (list.length > 0) {
            setWorldId(String(list[0].world_id));
          } else {
            setWorldId('0');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!cancelled) {
          setWorldsLoading(false);
        }
      }
    };

    void loadWorlds();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const data: Parameters<typeof adminApi.messageWorld>[0] = {
        world_id: parseInt(worldId, 10),
        message: message.trim(),
        type: messageType,
      };

      if (messageType === 'console') {
        data.from = from || 'SYSTEM';
      } else {
        data.mode = parseInt(mode, 10);
        data.sub_mode = parseInt(subMode, 10);
      }

      await adminApi.messageWorld(data);
      setMessage('');
      setSuccessMessage('Message broadcasted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-blue-400" />
          World Broadcast
        </h1>
        <p className="text-slate-400 mt-1">Send messages to all players in the game</p>
      </motion.div>

      {/* Alerts */}
      <AnimatePresence>
        {successMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Alert variant="success" dismissible onDismiss={() => setSuccessMessage('')}>
              <CheckCircle className="w-4 h-4 inline mr-2" />
              {successMessage}
            </Alert>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <Alert variant="error" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Message Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card variant="glow">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Send className="w-5 h-5 text-slate-400" />
                Compose Message
              </h3>

              {/* Message Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Message Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMessageType('ticker')}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                      messageType === 'ticker'
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Type className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Ticker</p>
                      <p className="text-xs opacity-70">Scrolling text at top</p>
                    </div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMessageType('console')}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-300 ${
                      messageType === 'console'
                        ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <Terminal className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">Console</p>
                      <p className="text-xs opacity-70">Chat message from sender</p>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* World ID */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  World
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-50 group-focus-within:text-cyan-500 transition-colors pointer-events-none">
                    <Monitor className="w-5 h-5" />
                  </div>
                  <select
                    value={worldId}
                    onChange={(e) => setWorldId(e.target.value)}
                    disabled={worldsLoading}
                    className={[
                      'w-full px-4 py-3 rounded-lg',
                      'bg-slate-900/80 backdrop-blur-sm',
                      'border border-slate-700/50',
                      'text-white placeholder:text-slate-500',
                      'transition-all duration-300',
                      'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
                      'hover:border-slate-600',
                      'pl-10',
                      worldsLoading ? 'opacity-60 cursor-not-allowed' : '',
                    ].join(' ')}
                  >
                    {worldsLoading && <option value="0">Loading worlds...</option>}
                    {!worldsLoading && worlds.length === 0 && <option value="0">No active worlds detected</option>}
                    {!worldsLoading && worlds.length > 0 && worlds.every((w) => w.world_id !== 0) && (
                      <option value="0">All active worlds</option>
                    )}
                    {worlds.map((w) => (
                      <option key={w.world_id} value={String(w.world_id)}>
                        World {w.world_id} ({w.character_count} online)
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Select a world ID from the server{worlds.every((w) => w.world_id !== 0) ? ' (0 = broadcast to all active worlds)' : ''}
                </p>
              </div>

              {/* Type-specific fields */}
              {messageType === 'console' ? (
                <div className="mb-6">
                  <Input
                    label="From (Sender Name)"
                    placeholder="SYSTEM"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Mode</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value)}
                      className={[
                        'w-full px-4 py-3 rounded-lg',
                        'bg-slate-900/80 backdrop-blur-sm',
                        'border border-slate-700/50',
                        'text-white placeholder:text-slate-500',
                        'transition-all duration-300',
                        'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
                        'hover:border-slate-600',
                      ].join(' ')}
                    >
                      <option value="0">Red ticker</option>
                      <option value="1">White ticker</option>
                      <option value="2">Blue ticker</option>
                      <option value="3">Purple ticker</option>
                      <option value="4">COMP shop description</option>
                    </select>
                    <p className="text-xs text-slate-500">
                      Ticker color/type from comp_hack (`SendSystemMessage` type 0-4).
                    </p>
                  </div>

                  <div className="w-full space-y-1.5">
                    <label className="block text-sm font-medium text-slate-300 mb-1">Sub Mode</label>
                    <select
                      value={subMode}
                      onChange={(e) => setSubMode(e.target.value)}
                      className={[
                        'w-full px-4 py-3 rounded-lg',
                        'bg-slate-900/80 backdrop-blur-sm',
                        'border border-slate-700/50',
                        'text-white placeholder:text-slate-500',
                        'transition-all duration-300',
                        'focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20',
                        'hover:border-slate-600',
                      ].join(' ')}
                    >
                      <option value="0">0 (default)</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                    <p className="text-xs text-slate-500">
                      `comp_hack` sends this but appears unused in most cases (default 0).
                    </p>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Message Content
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/50 text-white placeholder:text-slate-500 transition-all duration-300 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
                <div className="flex justify-between mt-2 text-sm">
                  <p className="text-slate-500">
                    {message.length} / 500 characters
                  </p>
                  {message.length > 500 && (
                    <p className="text-red-400">Message too long!</p>
                  )}
                </div>
              </div>

              {/* Preview */}
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <p className="text-xs text-slate-500 mb-2">Preview:</p>
                  <p className="text-white">
                    {messageType === 'console' && (
                      <span className="text-cyan-400 font-bold">[{from || 'SYSTEM'}] </span>
                    )}
                    {message}
                  </p>
                </motion.div>
              )}

              {/* Warning */}
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-yellow-400 font-medium">Warning</p>
                    <p className="text-sm text-yellow-400/80 mt-1">
                      This message will be sent to all players currently online
                      {worldId !== '0' ? ` in world ${worldId}` : ' in all worlds'}.
                      Please double-check your message before sending.
                    </p>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={!message.trim() || message.length > 500}
                isLoading={isLoading}
                onClick={handleSendMessage}
              >
                <Send className="w-5 h-5" />
                Broadcast Message
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-white mb-4">Message Types</h3>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="w-4 h-4 text-cyan-400" />
                    <p className="font-medium text-white">Ticker</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    Displays as a scrolling ticker at the top of the screen. Good for announcements and event notifications.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <p className="font-medium text-white">Console</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    Appears as a chat message from the specified sender. Use for direct communication or system alerts.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    <p className="font-medium text-white">World ID</p>
                  </div>
                  <p className="text-sm text-slate-400">
                    Set to 0 to broadcast to all worlds/channels. Use a specific world ID to target a single channel.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
