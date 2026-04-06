'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, XCircle, Clock, TrendingUp,
  Archive, Zap, Ban, Trash2, AlertTriangle,
} from 'lucide-react';
import { type OnChainBid } from '@/lib/useNegotiations';

export interface DealBoardProps {
  bids: OnChainBid[];
  agentNames?: Record<string, string>;
  onDelete?: (bidId: string) => void;
  onDeleteMany?: (bidIds: string[]) => void;
}

/* ─── Confirm Modal ───────────────────────────────────── */
function ConfirmDeleteModal({
  label,
  onConfirm,
  onCancel,
}: {
  label: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(13,13,13,0.65)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: 'var(--rv-pure-white)',
          border: '2px solid var(--rv-coral-600)',
          boxShadow: '6px 6px 0px var(--rv-coral-600)',
          padding: '32px 36px',
          maxWidth: 420, width: '90%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <AlertTriangle size={22} style={{ color: 'var(--rv-coral-600)', flexShrink: 0 }} />
          <div className="text-label" style={{ color: 'var(--rv-coral-600)' }}>
            PERMANENT DELETE
          </div>
        </div>
        <p style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 13, color: 'var(--rv-black)', marginBottom: 8 }}>
          {label}
        </p>
        <p style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 11, color: 'var(--rv-coral-600)', marginBottom: 24 }}>
          ⚠ This cannot be undone. The deal will be permanently removed from your view.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onConfirm}
            className="brute-btn"
            style={{
              flex: 1, background: 'var(--rv-coral-600)', color: '#fff',
              borderColor: 'var(--rv-coral-600)', boxShadow: '3px 3px 0px var(--rv-coral-900)',
            }}
          >
            <Trash2 size={14} /> YES, DELETE
          </button>
          <button onClick={onCancel} className="brute-btn" style={{ flex: 1 }}>
            CANCEL
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────── */
function resolveName(addr: string, agentNames?: Record<string, string>): string {
  if (!addr) return '—';
  return agentNames?.[addr.toLowerCase()] ?? `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
function shortId(id: string) {
  return `${id.slice(0, 8)}…${id.slice(-5)}`;
}
function formatDate(ts: number) {
  if (!ts) return '—';
  return new Date(ts * 1000).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

/* ─── Single deal card ───────────────────────────────── */
function DealCard({
  bid, variant, agentNames, onDelete,
}: {
  bid: OnChainBid;
  variant: 'finalized' | 'rejected';
  agentNames?: Record<string, string>;
  onDelete?: (bidId: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isFinalized = variant === 'finalized';
  const accentColor = isFinalized ? 'var(--rv-teal-600)' : 'var(--rv-coral-600)';
  const bgAccent    = isFinalized ? 'rgba(15,110,86,0.06)' : 'rgba(153,60,29,0.06)';
  const shadowVar   = isFinalized ? 'var(--rv-shadow-teal)' : 'var(--rv-shadow-coral)';
  const StatusIcon  = isFinalized ? CheckCircle2 : Ban;

  const finalPrice =
    bid.counterHistory.length > 0
      ? bid.counterHistory[bid.counterHistory.length - 1].price
      : bid.price;

  return (
    <>
      <AnimatePresence>
        {confirmOpen && (
          <ConfirmDeleteModal
            label={`Delete deal ${shortId(bid.bidId)}?`}
            onConfirm={() => { setConfirmOpen(false); onDelete?.(bid.bidId); }}
            onCancel={() => setConfirmOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: -50, scale: 0.93, transition: { duration: 0.22 } }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        style={{
          border: `1.5px solid ${accentColor}`,
          background: bgAccent, boxShadow: shadowVar,
          padding: '18px 20px', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Top strip */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: accentColor }} />

        {/* Header */}
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
              fontFamily: 'var(--rv-font-mono)', fontSize: 9, color: 'var(--rv-gray-400)',
              background: 'var(--rv-pure-white)', border: '1px solid var(--rv-gray-100)', padding: '2px 6px',
            }}>
              {shortId(bid.bidId)}
            </span>
            {onDelete && (
              <button
                onClick={() => setConfirmOpen(true)}
                title="Permanently delete this deal"
                style={{
                  width: 24, height: 24, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', background: 'var(--rv-pure-white)',
                  border: '1.5px solid var(--rv-gray-100)', cursor: 'pointer',
                  color: 'var(--rv-gray-400)', transition: 'all 0.1s',
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget;
                  b.style.background = 'var(--rv-coral-50)';
                  b.style.color = 'var(--rv-coral-600)';
                  b.style.borderColor = 'var(--rv-coral-600)';
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget;
                  b.style.background = 'var(--rv-pure-white)';
                  b.style.color = 'var(--rv-gray-400)';
                  b.style.borderColor = 'var(--rv-gray-100)';
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
            <span style={{ color: 'var(--rv-black)' }}>{resolveName(bid.initiator, agentNames)}</span>
            <span style={{ color: 'var(--rv-gray-400)', fontSize: 11 }}>→</span>
            <span style={{ color: 'var(--rv-black)' }}>{resolveName(bid.targetAgent, agentNames)}</span>
          </div>
          <div style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 9, color: 'var(--rv-gray-300)', marginTop: 2 }}>
            {bid.initiator.slice(0, 10)}… · {bid.targetAgent.slice(0, 10)}…
          </div>
        </div>

        {/* Price */}
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

        {/* Meta */}
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
    </>
  );
}

/* ─── Column header ────────────────────────────────────── */
function ColumnHeader({
  icon: Icon, label, count, color, subtitle, onDeleteAll, hasBids,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  subtitle: string;
  onDeleteAll?: () => void;
  hasBids: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {confirmOpen && (
          <ConfirmDeleteModal
            label={`Permanently delete all ${label.toLowerCase()}?`}
            onConfirm={() => { setConfirmOpen(false); onDeleteAll?.(); }}
            onCancel={() => setConfirmOpen(false)}
          />
        )}
      </AnimatePresence>

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
          {onDeleteAll && hasBids && (
            <button
              onClick={() => setConfirmOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--rv-font-mono)', fontSize: 10, fontWeight: 700,
                color: 'var(--rv-gray-400)', background: 'none',
                border: '1px solid var(--rv-gray-100)', padding: '3px 8px',
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
                transition: 'all 0.1s',
              }}
              onMouseEnter={(e) => {
                const b = e.currentTarget; b.style.color = 'var(--rv-coral-600)'; b.style.borderColor = 'var(--rv-coral-600)';
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget; b.style.color = 'var(--rv-gray-400)'; b.style.borderColor = 'var(--rv-gray-100)';
              }}
            >
              <Trash2 size={10} /> Delete All
            </button>
          )}
          <span style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 20, fontWeight: 900, color, lineHeight: 1 }}>
            {String(count).padStart(2, '0')}
          </span>
        </div>
      </div>
    </>
  );
}

/* ─── Empty state ──────────────────────────────────────── */
function EmptySlot({ label }: { label: string }) {
  return (
    <div style={{ border: '1.5px dashed var(--rv-gray-100)', padding: '32px 24px', textAlign: 'center' }}>
      <Archive size={24} style={{ color: 'var(--rv-gray-100)', margin: '0 auto 12px' }} />
      <p style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 12, color: 'var(--rv-gray-400)', margin: 0 }}>
        {label}
      </p>
    </div>
  );
}

/* ─── Main DealBoard ───────────────────────────────────── */
export function DealBoard({ bids, agentNames, onDelete, onDeleteMany }: DealBoardProps) {
  const finalized = bids.filter((b) => b.state === 'ACCEPTED');
  const rejected  = bids.filter((b) => b.state === 'CANCELLED' || b.state === 'EXPIRED');

  if (finalized.length === 0 && rejected.length === 0) return null;

  return (
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
          onDeleteAll={onDeleteMany ? () => onDeleteMany(finalized.map((b) => b.bidId)) : undefined}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence>
            {finalized.length === 0
              ? <EmptySlot label="No finalized deals. Accepted bids appear here." />
              : finalized.map((bid) => (
                  <DealCard key={bid.bidId} bid={bid} variant="finalized" agentNames={agentNames} onDelete={onDelete} />
                ))
            }
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
          subtitle="CANCELLED OR EXPIRED · PERMANENT RECORD"
          hasBids={rejected.length > 0}
          onDeleteAll={onDeleteMany ? () => onDeleteMany(rejected.map((b) => b.bidId)) : undefined}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <AnimatePresence>
            {rejected.length === 0
              ? <EmptySlot label="No rejected deals. Cancelled or expired bids appear here." />
              : rejected.map((bid) => (
                  <DealCard key={bid.bidId} bid={bid} variant="rejected" agentNames={agentNames} onDelete={onDelete} />
                ))
            }
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
