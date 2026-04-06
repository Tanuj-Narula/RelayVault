'use client';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Archive,
  Zap,
  Ban,
} from 'lucide-react';
import { type OnChainBid } from '@/lib/useNegotiations';

interface DealBoardProps {
  bids: OnChainBid[];
}

/* ─── Helpers ─────────────────────────────────────────── */
function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
function shortId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-5)}`;
}
function formatDate(ts: number) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString('en-US', {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ─── Single deal card ───────────────────────────────── */
function DealCard({
  bid,
  variant,
}: {
  bid: OnChainBid;
  variant: 'finalized' | 'rejected';
}) {
  const isFinalized = variant === 'finalized';

  const accentColor = isFinalized ? 'var(--rv-teal-600)' : 'var(--rv-coral-600)';
  const bgAccent   = isFinalized ? 'rgba(15,110,86,0.06)' : 'rgba(153,60,29,0.06)';
  const shadowColor= isFinalized ? 'var(--rv-shadow-teal)' : 'var(--rv-shadow-coral)';
  const Icon       = isFinalized ? CheckCircle2 : Ban;

  const finalPrice =
    bid.counterHistory.length > 0
      ? bid.counterHistory[bid.counterHistory.length - 1].price
      : bid.price;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={{
        border: `1.5px solid ${accentColor}`,
        background: bgAccent,
        boxShadow: shadowColor,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent strip */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 3,
          background: accentColor,
        }}
      />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon size={16} style={{ color: accentColor, flexShrink: 0 }} />
          <span
            style={{
              fontFamily: 'var(--rv-font-mono)',
              fontSize: 11,
              fontWeight: 700,
              color: accentColor,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {bid.state}
          </span>
        </div>
        <span
          style={{
            fontFamily: 'var(--rv-font-mono)',
            fontSize: 9,
            color: 'var(--rv-gray-400)',
            background: 'var(--rv-pure-white)',
            border: '1px solid var(--rv-gray-100)',
            padding: '2px 6px',
          }}
        >
          {shortId(bid.bidId)}
        </span>
      </div>

      {/* Parties */}
      <div
        style={{
          fontFamily: 'var(--rv-font-mono)',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginBottom: 10,
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 700, color: 'var(--rv-black)' }}>{shortAddr(bid.initiator)}</span>
        <span style={{ color: 'var(--rv-gray-400)' }}>→</span>
        <span style={{ fontWeight: 700, color: 'var(--rv-black)' }}>{shortAddr(bid.targetAgent)}</span>
      </div>

      {/* Price block */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          border: `1.5px solid ${accentColor}`,
          background: 'var(--rv-pure-white)',
          marginBottom: 12,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 9,
              fontFamily: 'var(--rv-font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--rv-gray-400)',
              marginBottom: 2,
            }}
          >
            {isFinalized ? 'Settled Price' : 'Last Price'}
          </div>
          <div
            style={{
              fontFamily: 'var(--rv-font-mono)',
              fontSize: 22,
              fontWeight: 900,
              color: isFinalized ? accentColor : 'var(--rv-black)',
              textDecoration: !isFinalized ? 'line-through' : 'none',
              textDecorationColor: 'var(--rv-coral-600)',
            }}
          >
            {finalPrice} MON
          </div>
        </div>
        {bid.counterHistory.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--rv-gray-400)' }}>
            <TrendingUp size={12} />
            <span style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 10 }}>
              {bid.counterHistory.length} counter{bid.counterHistory.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={10} style={{ color: 'var(--rv-gray-400)' }} />
          <span style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 10, color: 'var(--rv-gray-400)' }}>
            TTL_{bid.ttlBlocks}_BLOCKS
          </span>
        </div>
        {bid.createdAt > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Zap size={10} style={{ color: 'var(--rv-gray-400)' }} />
            <span style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 10, color: 'var(--rv-gray-400)' }}>
              {formatDate(bid.createdAt)}
            </span>
          </div>
        )}
      </div>

      {/* Finalized stamp */}
      {isFinalized && (
        <div
          style={{
            position: 'absolute',
            bottom: 12, right: 14,
            fontFamily: 'var(--rv-font-mono)',
            fontSize: 8,
            fontWeight: 900,
            color: accentColor,
            border: `1px solid ${accentColor}`,
            padding: '2px 6px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            opacity: 0.7,
          }}
        >
          ESCROW LOCKED
        </div>
      )}
    </motion.div>
  );
}

/* ─── Column header ────────────────────────────────────── */
function ColumnHeader({
  icon: Icon,
  label,
  count,
  color,
  subtitle,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        borderBottom: `2px solid ${color}`,
        paddingBottom: 12,
        marginBottom: 20,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Icon size={18} style={{ color }} />
          <span
            style={{
              fontFamily: 'var(--rv-font-sans)',
              fontSize: 15,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--rv-black)',
            }}
          >
            {label}
          </span>
        </div>
        <p
          style={{
            fontFamily: 'var(--rv-font-mono)',
            fontSize: 10,
            color: 'var(--rv-gray-400)',
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </div>
      <span
        style={{
          fontFamily: 'var(--rv-font-mono)',
          fontSize: 20,
          fontWeight: 900,
          color,
          lineHeight: 1,
        }}
      >
        {String(count).padStart(2, '0')}
      </span>
    </div>
  );
}

/* ─── Empty state ──────────────────────────────────────── */
function EmptySlot({ label }: { label: string }) {
  return (
    <div
      style={{
        border: '1.5px dashed var(--rv-gray-100)',
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <Archive size={24} style={{ color: 'var(--rv-gray-100)', margin: '0 auto 12px' }} />
      <p
        style={{
          fontFamily: 'var(--rv-font-mono)',
          fontSize: 12,
          color: 'var(--rv-gray-400)',
          margin: 0,
        }}
      >
        {label}
      </p>
    </div>
  );
}

/* ─── Main DealBoard ───────────────────────────────────── */
export function DealBoard({ bids }: DealBoardProps) {
  const finalized = bids.filter((b) => b.state === 'ACCEPTED');
  const rejected  = bids.filter((b) => b.state === 'CANCELLED' || b.state === 'EXPIRED');

  // Only render if there's at least one deal to show
  if (finalized.length === 0 && rejected.length === 0) return null;

  return (
    <div style={{ marginTop: 64 }}>
      {/* Section header */}
      <div
        style={{
          marginBottom: 32,
          borderBottom: '1.5px solid var(--rv-black)',
          paddingBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div
            className="text-label"
            style={{ color: 'var(--rv-purple-600)', marginBottom: 8 }}
          >
            // DEAL_BOARD.PERSISTENT_RECORD
          </div>
          <h2 className="text-h1" style={{ margin: 0 }}>
            DEAL BOARD
          </h2>
          <p
            style={{
              fontFamily: 'var(--rv-font-mono)',
              fontSize: 13,
              color: 'var(--rv-gray-400)',
              margin: '8px 0 0',
            }}
          >
            FINALIZED &amp; REJECTED DEALS · IMMUTABLE RECORD · NEVER REMOVED
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontFamily: 'var(--rv-font-mono)',
                fontSize: 11,
                color: 'var(--rv-gray-400)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Total Deals
            </div>
            <div
              style={{
                fontFamily: 'var(--rv-font-mono)',
                fontSize: 28,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {String(finalized.length + rejected.length).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Two-column split */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 40,
        }}
      >
        {/* ── Finalized Column ── */}
        <div>
          <ColumnHeader
            icon={CheckCircle2}
            label="Finalized Deals"
            count={finalized.length}
            color="var(--rv-teal-600)"
            subtitle="ACCEPTED · ESCROW SETTLED ON-CHAIN"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {finalized.length === 0 ? (
                <EmptySlot label="No finalized deals yet. Accepted bids will appear here." />
              ) : (
                finalized.map((bid) => (
                  <DealCard key={bid.bidId} bid={bid} variant="finalized" />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Rejected Column ── */}
        <div>
          <ColumnHeader
            icon={XCircle}
            label="Rejected / Expired"
            count={rejected.length}
            color="var(--rv-coral-600)"
            subtitle="CANCELLED OR EXPIRED · RETAINED FOR AUDIT"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {rejected.length === 0 ? (
                <EmptySlot label="No rejected deals. Cancelled or expired bids will remain here." />
              ) : (
                rejected.map((bid) => (
                  <DealCard key={bid.bidId} bid={bid} variant="rejected" />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
