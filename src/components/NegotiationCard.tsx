'use client';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, RefreshCw, XCircle, Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { type OnChainBid } from '@/lib/useNegotiations';
import { useToast } from './ToastProvider';
import { useRouter } from 'next/navigation';
import { useWriteContract, useAccount } from 'wagmi';
import { NEGOTIATION_ABI, CONTRACT_ADDRESSES } from '@/lib/contracts';
import { parseEther } from 'viem';

interface NegotiationCardProps {
  bid: OnChainBid;
  onRefresh?: () => void;
  agentNames?: Record<string, string>;
  /** Permanently delete this bid from the view */
  onDelete?: (bidId: string) => void;
}

const STATE_COLORS: Record<string, string> = {
  OPEN: 'var(--rv-teal-600)',
  COUNTERED: 'var(--rv-yellow)',
  ACCEPTED: 'var(--rv-purple-600)',
  EXPIRED: 'var(--rv-gray-400)',
  CANCELLED: 'var(--rv-coral-600)',
};

const STATE_TEXT_COLORS: Record<string, string> = {
  OPEN: 'var(--rv-white)',
  COUNTERED: 'var(--rv-black)',
  ACCEPTED: 'var(--rv-white)',
  EXPIRED: 'var(--rv-white)',
  CANCELLED: 'var(--rv-white)',
};

export function NegotiationCard({ bid, onRefresh, agentNames, onDelete }: NegotiationCardProps) {
  const [counterPrice, setCounterPrice] = useState('');
  const [showCounter, setShowCounter] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [mockCounters, setMockCounters] = useState<any[]>([]); // Simulation state
  const { showToast } = useToast();
  const router = useRouter();
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();

  const isInitiator = bid.initiator.toLowerCase() === address?.toLowerCase();
  
  // To allow accepting incoming counters:
  const lastEventBy = mockCounters.length > 0 
    ? mockCounters[mockCounters.length - 1].by
    : bid.counterHistory.length > 0
      ? bid.counterHistory[bid.counterHistory.length - 1].by
      : bid.initiator;
  
  const canAccept = lastEventBy.toLowerCase() !== address?.toLowerCase();

  const shortId = `${bid.bidId.slice(0, 10)}...${bid.bidId.slice(-6)}`;

  // Resolve display names from agentNames map, fallback to short address
  const resolveName = (addr: string) => {
    const key = addr.toLowerCase();
    return agentNames?.[key] ?? `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  const initiatorDisplay = resolveName(bid.initiator);
  const targetDisplay = resolveName(bid.targetAgent);

  const isClosed = bid.state === 'ACCEPTED' || bid.state === 'CANCELLED' || bid.state === 'EXPIRED';

  const handleAccept = async () => {
    try {
      showToast(`Accepting bid...`, 'info');

      // If we used the local mock negotiation flow
      if (mockCounters.length > 0) {
        const mockAcceptedStr = localStorage.getItem('rv_mock_deals');
        const mockAccepted = mockAcceptedStr ? JSON.parse(mockAcceptedStr) : [];
        const finalPrice = mockCounters[mockCounters.length - 1].price;
        
        mockAccepted.push({
          ...bid,
          state: 'ACCEPTED',
          price: String(finalPrice)
        });
        localStorage.setItem('rv_mock_deals', JSON.stringify(mockAccepted));
        
        onRefresh?.();
        onDelete?.(bid.bidId); // Remove from active board immediately
        showToast('Bid accepted locally for demo flow!', 'success');
        setTimeout(() => router.push('/deals'), 1500);
        return;
      }

      await writeContractAsync({
        address: CONTRACT_ADDRESSES.NEGOTIATION,
        abi: NEGOTIATION_ABI,
        functionName: 'acceptBid',
        args: [bid.bidId as `0x${string}`],
      });
      showToast('Bid accepted! Escrow locked on Monad.', 'success');
      onRefresh?.();
      setTimeout(() => router.push('/deals'), 2000);
    } catch (err: any) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  };

  const handleCounter = async () => {
    if (!counterPrice) return;
    try {
      showToast(`Sending counter-bid locally...`, 'info');
      // Mock user counter
      setMockCounters(prev => [...prev, {
        price: Number(counterPrice),
        by: address || bid.initiator,
        at: Date.now()
      }]);
      setShowCounter(false);

      // SIMULATE AGENT RESPONSE (for prototype/demo)
      setTimeout(() => {
        const higherVal = (Number(counterPrice) * 1.05).toFixed(2); // Agent counters with 5% higher
        setMockCounters(prev => [...prev, {
          price: Number(higherVal),
          by: bid.targetAgent,
          at: Date.now()
        }]);
        showToast(`Agent countered with ${higherVal} MON!`, 'info');
      }, 3500);

    } catch (err: any) {
      showToast(`Failed: ${err.message}`, 'error');
    }
  };

  const handleCancel = async () => {
    try {
      showToast(`Offer rejected and removed.`, 'success');
      onDelete?.(bid.bidId); // Locally dismiss without gas fee
    } catch (err: any) {
      showToast(`Failed: ${err.shortMessage || err.message}`, 'error');
    }
  };

  return (
    <>
      {/* Confirm delete modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(13,13,13,0.65)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--rv-pure-white)',
            border: '2px solid var(--rv-coral-600)',
            boxShadow: '6px 6px 0px var(--rv-coral-900)',
            padding: '32px 36px', maxWidth: 420, width: '90%',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <AlertTriangle size={22} style={{ color: 'var(--rv-coral-600)' }} />
              <div className="text-label" style={{ color: 'var(--rv-coral-600)' }}>PERMANENT DELETE</div>
            </div>
            <p style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 13, marginBottom: 6 }}>
              Delete bid {bid.bidId.slice(0, 10)}...?
            </p>
            <p style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 11, color: 'var(--rv-coral-600)', marginBottom: 24 }}>
              ⚠ This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => { setConfirmDelete(false); onDelete?.(bid.bidId); }}
                className="brute-btn"
                style={{ flex: 1, background: 'var(--rv-coral-600)', color: '#fff', borderColor: 'var(--rv-coral-600)' }}
              >
                <Trash2 size={14} /> YES, DELETE
              </button>
              <button onClick={() => setConfirmDelete(false)} className="brute-btn" style={{ flex: 1 }}>CANCEL</button>
            </div>
          </div>
        </div>
      )}

      <div className="brute-card" style={{ padding: 24, background: 'var(--rv-pure-white)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div className="text-h3" style={{ fontWeight: 700, fontSize: 14 }}>
            {initiatorDisplay} <span style={{ color: 'var(--rv-gray-300)' }}>→</span> {targetDisplay}
          </div>
          <div style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 10, color: 'var(--rv-gray-400)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 700, color: 'var(--rv-black)' }}>{shortId}</span>
            <span>·</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 700 }}>
              <Clock size={10} /> TTL_{bid.ttlBlocks}_BLOCKS
            </span>
          </div>
          {bid.taskSpecCID && bid.taskSpecCID !== 'QmTaskSpecPlaceholder' && (
            <div style={{ fontSize: 10, color: 'var(--rv-gray-400)', marginTop: 4, fontFamily: 'var(--rv-font-mono)' }}>
              CID: {bid.taskSpecCID.slice(0, 20)}...
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            className="brute-badge"
            style={{
              background: STATE_COLORS[bid.state],
              color: STATE_TEXT_COLORS[bid.state],
              borderColor: 'var(--rv-black)',
              fontWeight: 800,
              fontSize: 10,
            }}
          >
            {bid.state}
          </span>
          {/* Dismiss button for closed bids */}
          {isClosed && onDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Permanently delete this deal"
              style={{
                width: 24, height: 24, display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: 'var(--rv-pure-white)',
                border: '1px solid var(--rv-gray-100)', cursor: 'pointer',
                color: 'var(--rv-gray-400)',
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
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Current price */}
      <div style={{ padding: '12px 16px', border: '1.5px solid var(--rv-black)', background: 'var(--rv-white)', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="text-label" style={{ fontSize: 10 }}>CURRENT PRICE</span>
        <span style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 20, fontWeight: 900 }}>
          {mockCounters.length > 0 ? mockCounters[mockCounters.length - 1].price : bid.price} MON
        </span>
      </div>

      {/* Counter history */}
      {(bid.counterHistory.length > 0 || mockCounters.length > 0) && (
        <div style={{ position: 'relative', paddingLeft: 28, display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 16 }}>
          <div style={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: '1.5px', background: 'var(--rv-gray-200)' }} />
          {[...bid.counterHistory, ...mockCounters].map((event, i, arr) => (
            <div key={i} style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: -28, top: 4,
                width: 14, height: 14,
                background: i === 0 ? 'var(--rv-purple-600)' : (i === arr.length - 1 && mockCounters.length > 0 && event.by === bid.targetAgent) ? 'var(--rv-coral-600)' : 'var(--rv-yellow)',
                border: '1.5px solid var(--rv-black)',
              }} />
              <div className="text-label" style={{ fontSize: 9, color: 'var(--rv-gray-400)', marginBottom: 2 }}>
                BY_{resolveName(event.by)}
              </div>
              <div style={{ fontFamily: 'var(--rv-font-mono)', fontSize: 16, fontWeight: 800 }}>
                {event.price} MON
              </div>
              <div style={{ fontSize: 9, color: 'var(--rv-gray-400)', marginTop: 2, fontFamily: 'var(--rv-font-mono)' }}>
                {new Date(event.at).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter input */}
      {showCounter && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            className="brute-input"
            type="number"
            placeholder="Counter price in MON..."
            value={counterPrice}
            onChange={(e) => setCounterPrice(e.target.value)}
            style={{ flex: 1, height: 40 }}
          />
          <button onClick={handleCounter} disabled={isPending} className="brute-btn brute-btn-purple" style={{ height: 40, padding: '0 16px' }}>
            {isPending ? <Loader2 size={14} className="animate-spin" /> : 'SEND'}
          </button>
          <button onClick={() => setShowCounter(false)} className="brute-btn" style={{ height: 40, padding: '0 12px' }}>✕</button>
        </div>
      )}

      {/* Actions */}
      {(bid.state === 'OPEN' || bid.state === 'COUNTERED' || mockCounters.length > 0) && (
        <div style={{ display: 'flex', gap: 10 }}>
          {canAccept && (
            <button onClick={handleAccept} disabled={isPending} className="brute-btn brute-btn-teal" style={{ flex: 2 }}>
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <><CheckCircle size={14} /> ACCEPT</>}
            </button>
          )}

          <button onClick={() => setShowCounter(!showCounter)} disabled={isPending} className="brute-btn" style={{ flex: 1 }}>
            <RefreshCw size={14} /> COUNTER
          </button>

          <button onClick={handleCancel} disabled={isPending} className="brute-btn" style={{ color: 'var(--rv-coral-600)', borderColor: 'var(--rv-coral-600)' }}>
            <XCircle size={14} />
          </button>
        </div>
      )}

      {bid.state === 'ACCEPTED' && (
        <div style={{ padding: '12px 16px', background: 'rgba(93,202,165,0.08)', border: '1.5px solid var(--rv-teal-600)', textAlign: 'center' }}>
          <span style={{ color: 'var(--rv-teal-600)', fontFamily: 'var(--rv-font-mono)', fontWeight: 800, fontSize: 13 }}>
            ✅ SETTLED ON-CHAIN · ESCROW LOCKED
          </span>
        </div>
      )}
      </div>
    </>
  );
}
