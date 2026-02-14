'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, Button, Input, Alert } from '@/components/ui';
import { adminApi, getErrorMessage } from '@/lib/api';
import {
  Package,
  Send,
  User,
  CheckCircle,
  Plus,
  Trash2,
  Hash,
  Coins,
  AlertCircle,
} from 'lucide-react';

interface ProductEntry {
  id: string;
  productId: number;
}

export default function AdminItemsPage() {
  const [targetPlayer, setTargetPlayer] = useState('');
  const [cpCost, setCpCost] = useState('0');
  const [products, setProducts] = useState<ProductEntry[]>([]);
  const [newProductId, setNewProductId] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProduct = () => {
    const id = parseInt(newProductId);
    if (isNaN(id) || id <= 0) return;
    setProducts([...products, { id: Date.now().toString(), productId: id }]);
    setNewProductId('');
  };

  const handleRemoveProduct = (entryId: string) => {
    setProducts(products.filter((p) => p.id !== entryId));
  };

  const handleSendItems = async () => {
    if (!targetPlayer || products.length === 0) return;

    setIsLoading(true);
    setError('');
    try {
      await adminApi.postItems({
        username: targetPlayer,
        cp: parseInt(cpCost) || 0,
        products: products.map((p) => p.productId),
      });
      setSuccessMessage(`Successfully sent ${products.length} product(s) to ${targetPlayer}!`);
      setProducts([]);
      setTargetPlayer('');
      setCpCost('0');
      setTimeout(() => setSuccessMessage(''), 5000);
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
          <Package className="w-7 h-7 text-purple-400" />
          Post Items
        </h1>
        <p className="text-slate-400 mt-1">Send product items to player post boxes</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-slate-400" />
                Add Products
              </h3>

              <div className="flex gap-3 mb-6">
                <div className="flex-grow">
                  <Input
                    type="number"
                    placeholder="Product ID..."
                    value={newProductId}
                    onChange={(e) => setNewProductId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddProduct()}
                    icon={<Hash className="w-5 h-5" />}
                  />
                </div>
                <Button onClick={handleAddProduct} disabled={!newProductId || parseInt(newProductId) <= 0}>
                  <Plus className="w-4 h-4" />
                  Add
                </Button>
              </div>

              {/* Product List */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="px-2 py-1 rounded text-xs font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        #{product.productId}
                      </div>
                      <span className="text-white">Product ID: {product.productId}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
                {products.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">
                    <Package className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-500">No products added</p>
                    <p className="text-xs text-slate-600 mt-1">Enter product IDs above</p>
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div className="mt-4 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-cyan-400 font-medium text-sm">Product IDs</p>
                    <p className="text-xs text-cyan-400/70 mt-1">
                      These are the product IDs from the COMP Credits (CP) shop database. Items are delivered to the player&apos;s post box.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Send Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="glow" className="h-full">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-slate-400" />
                Send Package
              </h3>

              {/* Target Player */}
              <div className="mb-6">
                <Input
                  label="Target Username"
                  placeholder="Enter account username..."
                  value={targetPlayer}
                  onChange={(e) => setTargetPlayer(e.target.value)}
                  icon={<User className="w-5 h-5" />}
                />
              </div>

              {/* COMP Credits Cost */}
              <div className="mb-6">
                <Input
                  type="number"
                  label="COMP Credits Cost (0 = free)"
                  placeholder="0"
                  value={cpCost}
                  onChange={(e) => setCpCost(e.target.value)}
                  icon={<Coins className="w-5 h-5" />}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Set to 0 to send items for free. Otherwise, the player pays this COMP Credits amount to claim.
                </p>
              </div>

              {/* Summary */}
              <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Package Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target</span>
                    <span className="text-white font-medium">{targetPlayer || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Products</span>
                    <span className="text-white font-medium">{products.length} item(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">COMP Credits Cost</span>
                    <span className="text-yellow-400 font-medium">{parseInt(cpCost) || 0} COMP</span>
                  </div>
                </div>
              </div>

              {/* Send Button */}
              <Button
                className="w-full"
                size="lg"
                disabled={!targetPlayer || products.length === 0}
                isLoading={isLoading}
                onClick={handleSendItems}
              >
                <Send className="w-5 h-5" />
                Send {products.length} Product(s) to {targetPlayer || 'Player'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
