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
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { type OnChainBid } from '@/lib/useNegotiations';

export interface DealBoardProps {
  bids: OnChainBid[];
  /** address → display name lookup (e.g. "CodeGen Alpha" or "0x1234…5678") */
  agentNames?: Record<string, string>;
  /** Called when user clicks the dismiss (×) button on a single card */
  onDismiss?: (bidId: string) => void;
  /** Called when user clicks "Clear All" for a column */
  onDismissMany?: (bidIds: string[]) => void;
}

/* ─── Helpers ─────────────────────────────────────────── */
function resolveName(addr: string, agentNames?: Record<string, string>): string {
  if (!addr) return '—';
  const key = addr.toLowerCase();
  return agentNames?.[key] ?? `${addr.slice(0, 6)}…${addr.slice(-4)}`;
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
  agentNames,
  onDismiss,
}: {
  bid: OnChainBid;
  variant: 'finalized' | 'rejected';
  agentNames?: Record<string, string>;
  onDismiss?: (bidId: string) => void;
}) {
  const isFinalized = variant === 'finalized';
  const accentColor = isFinalized ? 'var(--rv-teal-600)' : 'var(--rv-coral-600)';
  const bgAccent    = isFinalized ? 'rgba(15,110,86,0.06)' : 'rgba(153,60,29,0.06)';
  const shadowVar   = isFinalized ? 'var(--rv-shadow-teal)' : 'var(--rv-shadow-coral)';
  const StatusIcon  = isFinalized ? CheckCircle2 : Ban;

  const finalPrice =
    bid.counterHistory.length > 0
      ? bid.counterHistory[bid.counterHistory.length - 1].price
      : bid.price;

  const initiatorName = resolveName(bid.initiator, agentNames);
  const targetName    = resolveName(bid.targetAgent, agentNames);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={{
        border: `1.5px solid ${accentColor}`,
        background: bgAccent,
        boxShadow: shadowVar,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent strip */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor }} />

      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusIcon size={16} style={{ color: accentColor, flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--rv-font-mono)', fontSize: 11, fontWeight: 700,
            color: accentColor, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {bid.state}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontFamily: 'var(--rv-font-mono)', fontSize: 9,
            color: 'var(--rv-gray-400)', background: 'var(--rv-pure-white)',
            border: '1px solid var(--rv-gray-100)', padding: '2px 6px',
          }}>
            {shortId(bid.bidId)}
          </span>
          {/* Dismiss button */}
          {onDismiss && (
            <button
              onClick={() => onDismiss(bid.bidId)}
              title="Remove from view"
              style={{
                width: 22, height: 22, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--rv-pure-white)',
                border: '1px solid var(--rv-gray-100)', cursor: 'pointer',
                color: 'var(--rv-gray-400)', flexShrink: 0,
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--rv-coral-50)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--rv-coral-600)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--rv-coral-600)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--rv-pure-white)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--rv-gray-400)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--rv-gray-100)';
              }}
            >
              <Trash2 size={11} />
            </button>
          )}
        </div>
      </div>

      {/* Agent names */}
      <div style={{ marginBottom: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
          fontFamily: 'var(--rv-font-sans)', fontSize: 13, fontWeight: 700,
        }}>
          <span style={{ color: 'var(--rv-black)' }}>{initiatorName}</span>
          <span style={{ color: 'var(--rv-gray-400)', fontSize: 11 }}>→</span>
          <span style={{ color: 'var(--rv-black)' }}>{targetName}</span>
        </div>
        {/* Addresses as subtitle */}
        <div style={{
          fontFamily: 'var(--rv-font-mono)', fontSize: 9, color: 'var(--rv-gray-300)',
          marginTop: 2,
        }}>
          {bid.initiator.slice(0, 8)}… · {bid.targetAgent.slice(0, 8)}…
        </div>
      </div>

      {/* Price block */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', border: `1.5px solid ${accentColor}`,
        background: 'var(--rv-pure-white)', marginBottom: 12,
      }}>
        <div>
          <div style={{
            fontSize: 9, fontFamily: 'var(--rv-font-mono)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            color: 'var(--rv-gray-400)', marginBottom: 2,
          }}>
            {isFinalized ? 'Settled Price' : 'Last Price'}
          </div>
          <div style={{
            fontFamily: 'var(--rv-font-mono)', fontSize: 22, fontWeight: 900,
            color: isFinalized ? accentColor : 'var(--rv-black)',
            textDecoration: !isFinalized ? 'line-through' : 'none',
            textDecorationColor: 'var(--rv-coral-600)',
          }}>
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
        <div style={{
          position: 'absolute', bottom: 12, right: 14,
          fontFamily: 'var(--rv-font-mono)', fontSize: 8, fontWeight: 900,
          color: accentColor, border: `1px solid ${accentColor}`,
          padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.7,
        }}>
          ESCROW LOCKED
        </div>
      )}
    </motion.div>
  );
}

/* ─── Column header ────────────────────────────────────── */
function ColumnHeader({
  icon: Icon, label, count, color, subtitle, onClearAll, hasBids,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  subtitle: string;
  onClearAll?: () => void;
  hasBids: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      borderBottom: `2px solid ${color}`, paddingBottom: 12, marginBottom: 20,
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Icon size={18} style={{ color }} />
          <span style={{
            fontFamily: 'var(--rv-font-sans)', fontSize: 15, fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--rv-black)',
          }}>
            {label}
          </span>
        </div>
        <p style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 10, color: 'var(--rv-gray-400)', margin: 0 }}>
          {subtitle}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {onClearAll && hasBids && (
          <button
            onClick={onClearAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: 'var(--rv-font-mono)', fontSize: 10, fontWeight: 700,
              color: 'var(--rv-gray-400)', background: 'none', border: '1px solid var(--rv-gray-100)',
              padding: '3px 8px', cursor: 'pointer', textTransform: 'uppercase',
              letterSpacing: '0.06em', transition: 'all 0.1s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--rv-coral-600)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--rv-coral-600)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--rv-gray-400)';
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--rv-gray-100)';
            }}
          >
            <Trash2 size={10} /> Clear All
          </button>
        )}
        <span style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>
          {String(count).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
}

/* ─── Empty state ──────────────────────────────────────── */
function EmptySlot({ label, onRestore }: { label: string; onRestore?: () => void }) {
  return (
    <div style={{ border: '1.5px dashed var(--rv-gray-100)', padding: '32px 24px', textAlign: 'center' }}>
      <Archive size={24} style={{ color: 'var(--rv-gray-100)', margin: '0 auto 12px' }} />
      <p style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 12, color: 'var(--rv-gray-400)', margin: '0 0 10px' }}>
        {label}
      </p>
      {onRestore && (
        <button
          onClick={onRestore}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontFamily: 'var(--rv-font-mono)', fontSize: 10, fontWeight: 700,
            color: 'var(--rv-purple-600)', background: 'none',
            border: '1px solid var(--rv-purple-200)', padding: '4px 10px', cursor: 'pointer',
          }}
        >
          <RotateCcw size={10} /> Restore Dismissed
        </button>
      )}
    </div>
  );
}

/* ─── Main DealBoard ───────────────────────────────────── */
export function DealBoard({ bids, agentNames, onDismiss, onDismissMany }: DealBoardProps) {
  const finalized = bids.filter((b) => b.state === 'ACCEPTED');
  const rejected  = bids.filter((b) => b.state === 'CANCELLED' || b.state === 'EXPIRED');

  if (finalized.length === 0 && rejected.length === 0) return null;

  return (
    <div>
      {/* Two-column split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>

        {/* ── Finalized Column ── */}
        <div>
          <ColumnHeader
            icon={CheckCircle2}
            label="Finalized Deals"
            count={finalized.length}
            color="var(--rv-teal-600)"
            subtitle="ACCEPTED · ESCROW SETTLED ON-CHAIN"
            hasBids={finalized.length > 0}
            onClearAll={onDismissMany ? () => onDismissMany(finalized.map((b) => b.bidId)) : undefined}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {finalized.length === 0 ? (
                <EmptySlot label="No finalized deals visible. Accepted bids appear here." />
              ) : (
                finalized.map((bid) => (
                  <DealCard
                    key={bid.bidId}
                    bid={bid}
                    variant="finalized"
                    agentNames={agentNames}
                    onDismiss={onDismiss}
                  />
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
            hasBids={rejected.length > 0}
            onClearAll={onDismissMany ? () => onDismissMany(rejected.map((b) => b.bidId)) : undefined}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AnimatePresence>
              {rejected.length === 0 ? (
                <EmptySlot label="No rejected deals visible. Cancelled or expired bids appear here." />
              ) : (
                rejected.map((bid) => (
                  <DealCard
                    key={bid.bidId}
                    bid={bid}
                    variant="rejected"
                    agentNames={agentNames}
                    onDismiss={onDismiss}
                  />
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
