'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { DealBoard } from '@/components/DealBoard';
import { useMyBids } from '@/lib/useNegotiations';
import { useAccount } from 'wagmi';
import { type OnChainBid } from '@/lib/useNegotiations';
import { Loader2, AlertCircle, Handshake, RefreshCw } from 'lucide-react';

/* ── Demo bids for disconnected / empty state ─────────── */
const DEMO_BIDS: OnChainBid[] = [
  {
    bidId: '0xdemo0000000000000000000000000000000000000000000000000000000001',
    taskSpecCID: 'QmDemoAccepted',
    initiator: '0x7a3f000000000000000000001b2c',
    targetAgent: '0x9c1a000000000000000000004d5e',
    price: 45,
    priceRaw: BigInt(0),
    ttlBlocks: 100,
    state: 'ACCEPTED',
    counterHistory: [{ price: 50, by: '0x7a3f000000000000000000001b2c', at: Date.now() - 80000 }],
    createdAt: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    bidId: '0xdemo0000000000000000000000000000000000000000000000000000000002',
    taskSpecCID: 'QmDemoCancelled',
    initiator: '0x3b8d000000000000000000007f9a',
    targetAgent: '0x5e2f000000000000000000008b3c',
    price: 120,
    priceRaw: BigInt(0),
    ttlBlocks: 150,
    state: 'CANCELLED',
    counterHistory: [],
    createdAt: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    bidId: '0xdemo0000000000000000000000000000000000000000000000000000000003',
    taskSpecCID: 'QmDemoExpired',
    initiator: '0xb1c9000000000000000000002e4f',
    targetAgent: '0xd7e3000000000000000000006a1b',
    price: 200,
    priceRaw: BigInt(0),
    ttlBlocks: 50,
    state: 'EXPIRED',
    counterHistory: [
      { price: 200, by: '0xb1c9000000000000000000002e4f', at: Date.now() - 200000 },
      { price: 180, by: '0xd7e3000000000000000000006a1b', at: Date.now() - 150000 },
    ],
    createdAt: Math.floor(Date.now() / 1000) - 14400,
  },
  {
    bidId: '0xdemo0000000000000000000000000000000000000000000000000000000004',
    taskSpecCID: 'QmDemoAccepted2',
    initiator: '0xf4a2000000000000000000009c7d',
    targetAgent: '0xa8b5000000000000000000003f2e',
    price: 320,
    priceRaw: BigInt(0),
    ttlBlocks: 200,
    state: 'ACCEPTED',
    counterHistory: [
      { price: 360, by: '0xf4a2000000000000000000009c7d', at: Date.now() - 500000 },
      { price: 340, by: '0xa8b5000000000000000000003f2e', at: Date.now() - 450000 },
      { price: 320, by: '0xf4a2000000000000000000009c7d', at: Date.now() - 400000 },
    ],
    createdAt: Math.floor(Date.now() / 1000) - 86400,
  },
];

export default function DealsPage() {
  const { address, isConnected } = useAccount();
  const { bids, isLoading, refetch } = useMyBids(address);
  const [showDemo, setShowDemo] = useState(false);

  /* Merge on-chain finalized/rejected with demo if opted-in */
  const closedBids = bids.filter(
    (b) => b.state === 'ACCEPTED' || b.state === 'CANCELLED' || b.state === 'EXPIRED'
  );
  const displayBids = showDemo ? DEMO_BIDS : closedBids;

  const finalizedCount = displayBids.filter((b) => b.state === 'ACCEPTED').length;
  const rejectedCount  = displayBids.filter((b) => b.state === 'CANCELLED' || b.state === 'EXPIRED').length;

  return (
    <div style={{ background: 'var(--rv-white)', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px 120px' }}>

        {/* ── Page Header ── */}
        <div style={{
          marginBottom: 48,
          borderBottom: '1.5px solid var(--rv-black)',
          paddingBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}>
          <div>
            <div className="text-label" style={{ color: 'var(--rv-purple-600)', marginBottom: 8 }}>
              // DEAL_BOARD.PERSISTENT_RECORD
            </div>
            <h1 className="text-h1" style={{ marginBottom: 12 }}>DEAL BOARD</h1>
            <p style={{ fontSize: 15, color: 'var(--rv-gray-600)', fontFamily: 'var(--rv-font-mono)', margin: 0 }}>
              FINALIZED &amp; REJECTED DEALS · IMMUTABLE RECORD · NEVER REMOVED
            </p>
          </div>

          {/* Stats + actions */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>

            {/* Summary badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="brute-badge badge-success" style={{ fontSize: 11 }}>
                  ✅ {finalizedCount} FINALIZED
                </span>
                <span className="brute-badge badge-error" style={{ fontSize: 11 }}>
                  ✕ {rejectedCount} REJECTED
                </span>
              </div>
            </div>

            {!isConnected && (
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="brute-btn"
                style={{
                  background: showDemo ? 'var(--rv-black)' : 'var(--rv-pure-white)',
                  color: showDemo ? 'var(--rv-white)' : 'var(--rv-black)',
                  fontSize: 12,
                }}
              >
                <Handshake size={14} /> {showDemo ? 'HIDE DEMO' : 'VIEW DEMO'}
              </button>
            )}

            {isConnected && (
              <button onClick={() => refetch()} className="brute-btn" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw size={14} /> REFRESH
              </button>
            )}
          </div>
        </div>

        {/* ── Wallet warning ── */}
        {!isConnected && !showDemo && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="brute-card"
            style={{
              padding: 32,
              borderColor: 'var(--rv-purple-600)',
              marginBottom: 40,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <AlertCircle size={28} style={{ color: 'var(--rv-purple-600)', flexShrink: 0 }} />
            <div>
              <div className="text-label" style={{ marginBottom: 6 }}>WALLET NOT CONNECTED</div>
              <p style={{ fontSize: 13, color: 'var(--rv-gray-400)', margin: 0, fontFamily: 'var(--rv-font-mono)' }}>
                Connect your wallet to view your on-chain finalized and rejected deals.
                Or click <strong>VIEW DEMO</strong> above to preview the board with sample data.
              </p>
            </div>
            <button
              onClick={() => setShowDemo(true)}
              className="brute-btn brute-btn-purple"
              style={{ flexShrink: 0, marginLeft: 'auto' }}
            >
              <Handshake size={14} /> VIEW DEMO
            </button>
          </motion.div>
        )}

        {/* ── Loading state ── */}
        {isConnected && isLoading && (
          <div className="brute-card" style={{ padding: 64, textAlign: 'center', borderStyle: 'dotted' }}>
            <Loader2 size={32} style={{ margin: '0 auto 16px', color: 'var(--rv-gray-300)' }} className="animate-spin" />
            <div style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 13, color: 'var(--rv-gray-400)' }}>
              READING DEAL HISTORY FROM CHAIN...
            </div>
          </div>
        )}

        {/* ── No deals yet (connected but empty) ── */}
        {isConnected && !isLoading && closedBids.length === 0 && (
          <div style={{ marginBottom: 40 }}>
            <div className="brute-card" style={{ padding: 48, textAlign: 'center', borderStyle: 'dashed', marginBottom: 24 }}>
              <Handshake size={36} style={{ margin: '0 auto 16px', color: 'var(--rv-gray-300)' }} />
              <div style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 13, color: 'var(--rv-gray-400)', marginBottom: 8 }}>
                NO CLOSED DEALS ON-CHAIN YET
              </div>
              <p style={{ fontSize: 12, color: 'var(--rv-gray-300)', margin: '0 0 20px' }}>
                Finalized and rejected bids will appear here once you negotiate on-chain.
              </p>
              <button
                onClick={() => setShowDemo(true)}
                className="brute-btn"
              >
                <Handshake size={14} /> PREVIEW WITH DEMO DATA
              </button>
            </div>
          </div>
        )}

        {/* ── Deal Board ── */}
        {(!isLoading && displayBids.length > 0) && (
          <>
            {showDemo && (
              <div className="brute-badge badge-warning" style={{ display: 'inline-flex', marginBottom: 20, fontSize: 11, height: 'auto', padding: '6px 12px' }}>
                ⚠ DEMO DATA — Connect wallet to view your real on-chain deals
              </div>
            )}
            <DealBoard bids={displayBids} />
          </>
        )}

      </main>
    </div>
  );
}
