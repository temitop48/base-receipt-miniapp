import { NextResponse } from 'next/server';
import type { Receipt, ReceiptMetadata, SerializableReceipt } from '@/types/receipt';

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body: { receipt: Receipt | SerializableReceipt } = await request.json();
    const { receipt } = body;

    if (!receipt || !receipt.txHash) {
      return NextResponse.json(
        { error: 'Invalid receipt data' },
        { status: 400 }
      );
    }

    const metadata: ReceiptMetadata = {
      name: `Base Receipt: ${receipt.actionType}`,
      description: receipt.userNote || `A ${receipt.actionType} transaction on ${receipt.chain}`,
      image: generateReceiptImage(receipt),
      attributes: [
        {
          trait_type: 'Transaction Hash',
          value: receipt.txHash,
        },
        {
          trait_type: 'Action Type',
          value: receipt.actionType,
        },
        {
          trait_type: 'Protocol',
          value: receipt.protocol,
        },
        {
          trait_type: 'Chain',
          value: receipt.chain,
        },
        {
          trait_type: 'Tag',
          value: receipt.tag,
        },
        {
          trait_type: 'Block Number',
          value: typeof receipt.blockNumber === 'bigint' 
            ? receipt.blockNumber.toString() 
            : receipt.blockNumber,
        },
        {
          trait_type: 'Timestamp',
          value: receipt.timestamp,
        },
      ],
    };

    const metadataJSON = JSON.stringify(metadata);
    const base64Metadata = Buffer.from(metadataJSON).toString('base64');
    const metadataURI = `data:application/json;base64,${base64Metadata}`;

    return NextResponse.json({ metadataURI });
  } catch (error) {
    console.error('Metadata creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create metadata' },
      { status: 500 }
    );
  }
}

function generateReceiptImage(receipt: Receipt): string {
  const svg = `
    <svg width="400" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
        </linearGradient>
      </defs>
      
      <!-- Background -->
      <rect width="400" height="500" fill="#ffffff"/>
      
      <!-- Header -->
      <rect width="400" height="120" fill="url(#headerGrad)"/>
      <text x="20" y="40" font-family="Arial" font-size="24" font-weight="bold" fill="#ffffff">
        Receipt
      </text>
      <text x="20" y="70" font-family="monospace" font-size="12" fill="#ffffff" opacity="0.9">
        ${receipt.txHash.slice(0, 10)}...${receipt.txHash.slice(-8)}
      </text>
      <text x="20" y="100" font-family="Arial" font-size="10" fill="#ffffff" opacity="0.8">
        ${receipt.chain}
      </text>
      
      <!-- Content -->
      <text x="20" y="160" font-family="Arial" font-size="12" fill="#6b7280">
        Action
      </text>
      <text x="20" y="185" font-family="Arial" font-size="18" font-weight="bold" fill="#000000">
        ${receipt.actionType.toUpperCase()}
      </text>
      
      <text x="20" y="230" font-family="Arial" font-size="12" fill="#6b7280">
        Protocol
      </text>
      <text x="20" y="255" font-family="Arial" font-size="16" font-weight="600" fill="#000000">
        ${receipt.protocol}
      </text>
      
      ${receipt.userNote ? `
        <rect x="20" y="280" width="360" height="60" rx="8" fill="#f3f4f6"/>
        <text x="30" y="300" font-family="Arial" font-size="10" fill="#6b7280">
          Note
        </text>
        <text x="30" y="320" font-family="Arial" font-size="12" fill="#000000" style="font-style:italic">
          ${receipt.userNote.slice(0, 50)}${receipt.userNote.length > 50 ? '...' : ''}
        </text>
      ` : ''}
      
      <!-- Tag -->
      <rect x="20" y="370" width="100" height="30" rx="15" fill="#dbeafe"/>
      <text x="70" y="390" font-family="Arial" font-size="12" font-weight="600" fill="#1e40af" text-anchor="middle">
        ${receipt.tag}
      </text>
      
      <!-- Footer -->
      <text x="200" y="460" font-family="Arial" font-size="10" fill="#9ca3af" text-anchor="middle">
        Built on Base
      </text>
    </svg>
  `;

  const base64SVG = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64SVG}`;
}
