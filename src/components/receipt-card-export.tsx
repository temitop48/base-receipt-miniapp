'use client';

import type { Receipt } from '@/types/receipt';
import { formatTxHash, formatTimestamp, formatGasCost } from '@/lib/transaction-utils';

interface ReceiptCardExportProps {
  receipt: Receipt;
  id: string;
}

/**
 * Export-optimized receipt card with fixed dimensions and inline SVGs
 * This component is designed specifically for html-to-image capture
 * All icons are converted to inline SVG for reliable rendering
 */
export function ReceiptCardExport({ receipt, id }: ReceiptCardExportProps) {
  const tagColors: Record<string, { bg: string; text: string }> = {
    'First time': { bg: '#D1FAE5', text: '#065F46' },
    'Milestone': { bg: '#DBEAFE', text: '#1E40AF' },
    'Win': { bg: '#FEF3C7', text: '#92400E' },
    'Loss': { bg: '#FFE4E6', text: '#9F1239' },
    'Chaos': { bg: '#F3E8FF', text: '#6B21A8' },
  };

  const tagColor = tagColors[receipt.tag] || { bg: '#F3F4F6', text: '#374151' };

  return (
    <div 
      id={id}
      style={{
        width: '800px',
        margin: '0',
        padding: '0',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 82, 255, 0.15)',
        position: 'relative',
      }}
    >
      {/* Subtle Base Logo Watermark - centered background */}
      <div style={{
        position: 'absolute',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
      }}>
        <svg 
          width="300" 
          height="300" 
          viewBox="0 0 111 111" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ opacity: 0.03 }}
        >
          <path 
            d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" 
            fill="#0052FF"
          />
        </svg>
      </div>

      {/* Header with Base official gradient */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #0052FF 0%, #0052FF 50%, #0047E0 100%)',
          padding: '48px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 10,
        }}
      >
        {/* Decorative frost elements */}
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          width: '128px',
          height: '128px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '50%',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '0',
          width: '96px',
          height: '96px',
          background: 'rgba(195, 232, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(40px)',
        }} />
        
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '32px' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <h2 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                margin: '0',
                color: '#ffffff',
              }}>
                Receipt
              </h2>
              {/* Base Logo Badge */}
              <div style={{
                backdropFilter: 'blur(8px)',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <svg width="16" height="16" viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" fill="white"/>
                </svg>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffffff' }}>Base</span>
              </div>
            </div>
            <div style={{
              textAlign: 'right',
              backdropFilter: 'blur(8px)',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 20px',
              borderRadius: '16px',
            }}>
              <p style={{ fontSize: '12px', opacity: 0.8, fontWeight: '500', margin: '0 0 4px 0', color: '#ffffff' }}>
                Chain
              </p>
              <p style={{ fontWeight: 'bold', fontSize: '20px', margin: '0', color: '#ffffff' }}>
                {receipt.chain}
              </p>
            </div>
          </div>
          <div style={{
            backdropFilter: 'blur(8px)',
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '16px',
          }}>
            <p style={{ fontSize: '12px', opacity: 0.8, fontWeight: '500', margin: '0 0 8px 0', color: '#ffffff' }}>
              Transaction Hash
            </p>
            <p style={{ 
              fontFamily: 'monospace', 
              fontSize: '14px', 
              fontWeight: '600', 
              margin: '0', 
              wordBreak: 'break-all',
              color: '#ffffff',
            }}>
              {formatTxHash(receipt.txHash)}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ 
        padding: '48px', 
        position: 'relative', 
        zIndex: 10, 
        background: '#ffffff' 
      }}>
        {/* Trust Badge - Verified on Base */}
        <div style={{
          background: 'linear-gradient(to right, #ECFDF5, #E0F2FE)',
          border: '2px solid #A7F3D0',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #10B981, #14B8A6)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              {/* ShieldCheck icon as inline SVG */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: '#065F46', margin: '0 0 4px 0' }}>
                Verified on Base
              </h4>
              <p style={{ fontSize: '14px', color: '#047857', fontWeight: '500', margin: '0' }}>
                Official onchain transaction receipt
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingTop: '16px',
            borderTop: '1px solid #A7F3D0',
            flexWrap: 'wrap',
          }}>
            {/* Clock icon as inline SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <p style={{ fontSize: '12px', color: '#047857', fontFamily: 'monospace', margin: '0' }}>
              {formatTimestamp(receipt.timestamp)}
            </p>
            <span style={{ fontSize: '12px', color: '#059669', marginLeft: 'auto' }}>
              Block #{receipt.blockNumber.toString()}
            </span>
          </div>
        </div>

        {/* Gas Cost Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '9999px',
            background: 'linear-gradient(to right, #EFF6FF, #DBEAFE)',
            border: '1px solid #BFDBFE',
          }}>
            {/* Flame icon as inline SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1D4ED8' }}>Gas:</span>
            <span style={{ fontSize: '13px', fontFamily: 'monospace', fontWeight: '600', color: '#1E40AF' }}>
              {formatGasCost(receipt.gasUsed, receipt.gasPrice)}
            </span>
          </div>
        </div>

        {/* BaseScan Verification Link */}
        <div style={{
          width: '100%',
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#1E40AF',
          fontWeight: '600',
          fontSize: '16px',
        }}>
          {/* ExternalLink icon as inline SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6"/>
            <path d="M10 14 21 3"/>
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          </svg>
          <span>Verify on BaseScan</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '24px',
          borderBottom: '1px solid #E5E7EB',
          marginBottom: '24px',
        }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Action</p>
            <p style={{
              fontWeight: 'bold',
              fontSize: '24px',
              textTransform: 'uppercase',
              background: 'linear-gradient(to right, #0052FF, #0066FF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: '0',
            }}>
              {receipt.actionType}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Protocol</p>
            <p style={{ fontWeight: 'bold', fontSize: '20px', color: '#111827', margin: '0' }}>
              {receipt.protocol}
            </p>
          </div>
        </div>

        {receipt.userNote && (
          <div style={{
            background: '#F9FAFB',
            padding: '24px',
            borderRadius: '20px',
            border: '1px solid #E5E7EB',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Personal Note</p>
            <p style={{ fontSize: '14px', fontStyle: 'italic', color: '#111827', margin: '0', lineHeight: 1.6 }}>
              &ldquo;{receipt.userNote}&rdquo;
            </p>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px', fontWeight: '500' }}>Receipt Tag</p>
            <div style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 'bold',
              display: 'inline-block',
              background: tagColor.bg,
              color: tagColor.text,
            }}>
              {receipt.tag}
            </div>
          </div>
        </div>

        {/* Base branding footer */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}>
          <svg width="14" height="14" style={{ opacity: 0.6 }} viewBox="0 0 111 111" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H3.9565e-07C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" fill="#0052FF"/>
          </svg>
          <p style={{
            fontSize: '13px',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, #0052FF, #0066FF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0',
          }}>
            Built on Base
          </p>
        </div>
      </div>
    </div>
  );
}
