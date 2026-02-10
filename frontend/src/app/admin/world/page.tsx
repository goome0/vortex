'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Input, Alert } from '@/components/ui';
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
  const [messageType, setMessageType] = useState<'console' | 'ticker'>('ticker');
  const [from, setFrom] = useState('SYSTEM');
  const [mode, setMode] = useState('0');
  const [subMode, setSubMode] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const data: Record<string, unknown> = {
        world_id: parseInt(worldId),
        message: message.trim(),
        type: messageType,
      };

      if (messageType === 'console') {
        data.from = from || 'SYSTEM';
      } else {
        data.mode = parseInt(mode);
        data.sub_mode = parseInt(subMode);
      }

      await adminApi.messageWorld(data as { world_id: number; message: string; type: string; from: string });
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
                <Input
                  type="number"
                  label="World ID"
                  placeholder="0 for all worlds"
                  value={worldId}
                  onChange={(e) => setWorldId(e.target.value)}
                  icon={<Monitor className="w-5 h-5" />}
                />
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
                  <Input
                    type="number"
                    label="Mode"
                    placeholder="0"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  />
                  <Input
                    type="number"
                    label="Sub Mode"
                    placeholder="0"
                    value={subMode}
                    onChange={(e) => setSubMode(e.target.value)}
                  />
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
