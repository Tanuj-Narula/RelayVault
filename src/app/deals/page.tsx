'use client';
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { DealBoard } from '@/components/DealBoard';
import { useMyBids, type OnChainBid } from '@/lib/useNegotiations';
import { useAgents } from '@/lib/useAgents';
import { useAccount } from 'wagmi';
import { useDeletedDeals } from '@/lib/useDismissedDeals';
import { Loader2, AlertCircle, Handshake, RefreshCw } from 'lucide-react';

/* ── Demo bids ───────────────────────────────────────── */
const DEMO_BIDS: OnChainBid[] = [
  {
    bidId: '0xdemo0000000000000000000000000000000000000000000000000000000001',
    taskSpecCID: 'QmDemoAccepted',
    initiator: '0x7a3f000000000000000000001b2c',
    targetAgent: '0x9c1a000000000000000000004d5e',
    price: '45', priceRaw: BigInt(0), ttlBlocks: 100, state: 'ACCEPTED',
    counterHistory: [{ price: '50', by: '0x7a3f000000000000000000001b2c', at: Date.now() - 80000 }],
    createdAt: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    bidId: '0xdemo0000000000000000000000000000000000000000000000000000000002',
    taskSpecCID: 'QmDemoCancelled',
    initiator: '0x3b8d000000000000000000007f9a',
    targetAgent: '0x5e2f000000000000000000008b3c',
    price: '120', priceRaw: BigInt(0), ttlBlocks: 150, state: 'CANCELLED',
    counterHistory: [],
    createdAt: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    bidId: '0xdemo0000000000000000000000000000000000000000000000000000000003',
    taskSpecCID: 'QmDemoExpired',
    initiator: '0xb1c9000000000000000000002e4f',
    targetAgent: '0xd7e3000000000000000000006a1b',
    price: '200', priceRaw: BigInt(0), ttlBlocks: 50, state: 'EXPIRED',
    counterHistory: [
      { price: '200', by: '0xb1c9000000000000000000002e4f', at: Date.now() - 200000 },
      { price: '180', by: '0xd7e3000000000000000000006a1b', at: Date.now() - 150000 },
    ],
    createdAt: Math.floor(Date.now() / 1000) - 14400,
  },
  {
    bidId: '0xdemo0000000000000000000000000000000000000000000000000000000004',
    taskSpecCID: 'QmDemoAccepted2',
    initiator: '0xf4a2000000000000000000009c7d',
    targetAgent: '0xa8b5000000000000000000003f2e',
    price: '320', priceRaw: BigInt(0), ttlBlocks: 200, state: 'ACCEPTED',
    counterHistory: [
      { price: '360', by: '0xf4a2000000000000000000009c7d', at: Date.now() - 500000 },
      { price: '340', by: '0xa8b5000000000000000000003f2e', at: Date.now() - 450000 },
      { price: '320', by: '0xf4a2000000000000000000009c7d', at: Date.now() - 400000 },
    ],
    createdAt: Math.floor(Date.now() / 1000) - 86400,
  },
];

const DEMO_AGENT_NAMES: Record<string, string> = {
  '0x7a3f000000000000000000001b2c': 'CodeGen Alpha',
  '0x9c1a000000000000000000004d5e': 'ResearchBot Pro',
  '0x3b8d000000000000000000007f9a': 'DataAnalyst X',
  '0x5e2f000000000000000000008b3c': 'OracleNode Prime',
  '0xb1c9000000000000000000002e4f': 'LegalEagle AI',
  '0xd7e3000000000000000000006a1b': 'MediaSynth',
  '0xf4a2000000000000000000009c7d': 'AuditHound',
  '0xa8b5000000000000000000003f2e': 'TranslatorMesh',
};

export default function DealsPage() {
  const { address, isConnected } = useAccount();
  const { bids, isLoading, refetch } = useMyBids(address);
  const { agents } = useAgents();
  const { deleted, deleteDeal, deleteMany } = useDeletedDeals();

  /* Load any locally mocked deals (for dummy negotiation flow off-chain) */
  const mockAccepted = useMemo(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('rv_mock_deals');
        return stored ? JSON.parse(stored) as OnChainBid[] : [];
      }
    } catch {}
    return [];
  }, []);

  /* Build address → name map */
  const agentNames = useMemo(() => {
    const map: Record<string, string> = {};
    agents.forEach((a) => { map[a.agentId.toLowerCase()] = a.name; });
    return map;
  }, [agents]);

  /* Closed on-chain bids, filtered by permanently deleted */
  const closedBids = useMemo(
    () => [...bids, ...mockAccepted].filter(
      (b) =>
        (b.state === 'ACCEPTED' || b.state === 'CANCELLED' || b.state === 'EXPIRED') &&
        !deleted.has(b.bidId)
    ),
    [bids, mockAccepted, deleted]
  );

  const demoVisible = useMemo(
    () => DEMO_BIDS.filter((b) => !deleted.has(b.bidId)),
    [deleted]
  );

  const showDemo  = !isConnected;
  const displayBids  = showDemo ? demoVisible  : closedBids;
  const displayNames = showDemo ? DEMO_AGENT_NAMES : agentNames;

  const finalizedCount = displayBids.filter((b) => b.state === 'ACCEPTED').length;
  const rejectedCount  = displayBids.filter((b) => b.state === 'CANCELLED' || b.state === 'EXPIRED').length;

  return (
    <div style={{ background: 'var(--rv-white)', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 40px 120px' }}>

        {/* ── Page Header ── */}
        <div style={{
          marginBottom: 48, borderBottom: '1.5px solid var(--rv-black)',
          paddingBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        }}>
          <div>
            <div className="text-label" style={{ color: 'var(--rv-purple-600)', marginBottom: 8 }}>
              // DEAL_BOARD.PERMANENT_RECORD
            </div>
            <h1 className="text-h1" style={{ marginBottom: 12 }}>DEAL BOARD</h1>
            <p style={{ fontSize: 15, color: 'var(--rv-gray-600)', fontFamily: 'var(--rv-font-mono)', margin: 0 }}>
              FINALIZED &amp; REJECTED DEALS · AGENT NAMES · PERMANENT DELETE
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <span className="brute-badge badge-success" style={{ fontSize: 11 }}>
                ✅ {finalizedCount} FINALIZED
              </span>
              <span className="brute-badge badge-error" style={{ fontSize: 11 }}>
                ✕ {rejectedCount} REJECTED
              </span>
            </div>
            {isConnected && (
              <button onClick={() => refetch()} className="brute-btn" style={{ height: 36, fontSize: 12, gap: 6 }}>
                <RefreshCw size={13} /> REFRESH
              </button>
            )}
          </div>
        </div>

        {/* ── Wallet not connected ── */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="brute-card"
            style={{ padding: '16px 24px', borderColor: 'var(--rv-purple-600)', marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}
          >
            <AlertCircle size={20} style={{ color: 'var(--rv-purple-600)', flexShrink: 0 }} />
            <p style={{ fontSize: 13, color: 'var(--rv-gray-500)', margin: 0, fontFamily: 'var(--rv-font-mono)' }}>
              WALLET NOT CONNECTED — Showing demo data. Connect your wallet to view real on-chain deals.
            </p>
            <span className="brute-badge badge-warning" style={{ flexShrink: 0, fontSize: 10 }}>DEMO MODE</span>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {isConnected && isLoading && (
          <div className="brute-card" style={{ padding: 64, textAlign: 'center', borderStyle: 'dotted' }}>
            <Loader2 size={32} style={{ margin: '0 auto 16px', color: 'var(--rv-gray-300)' }} className="animate-spin" />
            <div style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 13, color: 'var(--rv-gray-400)' }}>
              READING DEAL HISTORY FROM CHAIN...
            </div>
          </div>
        )}

        {/* ── All deleted / no deals ── */}
        {!isLoading && displayBids.length === 0 && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="brute-card"
              style={{ padding: 48, textAlign: 'center', borderStyle: 'dashed' }}
            >
              <Handshake size={36} style={{ margin: '0 auto 16px', color: 'var(--rv-gray-300)' }} />
              <div style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 13, color: 'var(--rv-gray-400)', marginBottom: 8 }}>
                NO DEALS TO DISPLAY
              </div>
              <p style={{ fontSize: 12, color: 'var(--rv-gray-300)', margin: 0 }}>
                {isConnected
                  ? 'Finalized and rejected bids will appear here once you negotiate on-chain.'
                  : 'All demo deals have been deleted. Connect your wallet to see real deals.'}
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        {/* ── Deal Board ── */}
        {!isLoading && displayBids.length > 0 && (
          <DealBoard
            bids={displayBids}
            agentNames={displayNames}
            onDelete={deleteDeal}
            onDeleteMany={deleteMany}
          />
        )}

      </main>
    </div>
  );
}
