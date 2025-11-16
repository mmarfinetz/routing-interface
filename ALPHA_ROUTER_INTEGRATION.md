# Alpha Router Integration for Base

## Overview

This document describes the Alpha Router integration into the LlamaSwap interface. Alpha Router uses genetic algorithm optimization to find the best swap paths across multiple DEXs on Base chain.

## What's Implemented

### 1. Alpha Router Adapter (`src/components/Aggregator/adapters/alphaRouter/`)

- **Type definitions** (`types.ts`): Complete TypeScript types for the Alpha Router API response
- **Adapter implementation** (`index.ts`): Full adapter following LlamaSwap's pattern
  - Quote fetching from Alpha Router API
  - Support for Base chain (chainId: 8453)
  - Transaction building structure (needs deployed contract)
  - Comparison data access utilities

### 2. Route Comparison UI (`src/components/AlphaRouteComparison/`)

- Visual comparison of Alpha Router vs competitors (1inch, Uniswap, etc.)
- Displays savings percentage and amounts
- Shows route complexity, MEV risk, and price impact
- Professional styling with GA optimization badges

### 3. Integration Points

- Alpha Router added as first adapter in `src/components/Aggregator/list.ts`
- Environment variables configured in `.env.local` and `.env.example`
- Page title updated to "Alpha Router - GA-Optimized DEX Aggregator"

## Critical Requirements for Production

### 1. API Access (HIGHEST PRIORITY)

The Alpha Router API at `https://alpha-router-base-production.up.railway.app/api/quote` is returning 403 Forbidden. This needs to be resolved:

- **Option A**: Configure CORS to allow requests from the frontend domain
- **Option B**: Add API key/authentication that can be passed in headers
- **Option C**: Whitelist the deployment domain

**Test the API directly:**
```bash
curl -X POST "https://alpha-router-base-production.up.railway.app/api/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "chain": "base",
    "fromToken": "0x4200000000000000000000000000000000000006",
    "toToken": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "amountIn": "1000000000000000000"
  }'
```

### 2. Smart Contract Deployment (CRITICAL)

The Alpha Router needs a deployed smart contract on Base mainnet to execute swaps. Currently, a placeholder address is used:

```typescript
// In src/components/Aggregator/adapters/alphaRouter/index.ts
const ALPHA_ROUTER_CONTRACT = '0x0000000000000000000000000000000000000000';
```

**Required contract functionality:**
- Accept token approval for spending
- Execute multi-hop swaps based on route data
- Handle split routes if applicable
- Apply slippage protection
- Return output tokens to user

**Deployment steps:**
1. Deploy Alpha Router contract to Base mainnet
2. Update `ALPHA_ROUTER_CONTRACT` address in the adapter
3. Implement proper `buildSwapTransaction()` function with correct ABI encoding

### 3. Transaction Data Generation

The current implementation builds a placeholder transaction. You need to:

1. Define the exact swap function signature on your contract
2. Encode the route data properly using viem's `encodeFunctionData`
3. Handle native ETH swaps (wrapping/unwrapping)
4. Calculate proper gas limits

**Example implementation needed:**
```typescript
function buildSwapTransaction(quote: AlphaQuote, userAddress: string, slippage: number) {
  const amountOutMin = BigInt(quote.amountOut) * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;

  const data = encodeFunctionData({
    abi: ALPHA_ROUTER_ABI,
    functionName: 'swap',
    args: [
      quote.route, // route steps
      amountOutMin,
      deadline
    ]
  });

  return {
    from: userAddress,
    to: ALPHA_ROUTER_CONTRACT,
    data,
    value: isNativeTokenSwap ? amount : '0'
  };
}
```

## Integration Checklist

### Before Testing
- [ ] API returns 200 OK with valid quote data
- [ ] Router contract deployed on Base
- [ ] Contract address updated in adapter
- [ ] Transaction encoding implemented correctly

### Before Production
- [ ] Full end-to-end swap tested on Base mainnet
- [ ] Gas estimates accurate
- [ ] Slippage protection verified
- [ ] Error handling for failed swaps
- [ ] Mobile responsiveness tested
- [ ] Analytics/monitoring configured

## File Structure

```
src/
├── components/
│   ├── Aggregator/
│   │   ├── adapters/
│   │   │   └── alphaRouter/
│   │   │       ├── index.ts       # Main adapter
│   │   │       └── types.ts       # TypeScript types
│   │   └── list.ts               # Alpha Router added to adapter list
│   └── AlphaRouteComparison/
│       └── index.tsx             # Comparison UI component
└── pages/
    └── index.tsx                 # Updated title branding
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_ALPHA_ROUTER_URL=https://alpha-router-base-production.up.railway.app

# Optional - for other aggregator comparisons
OX_API_KEY=your_0x_api_key
INCH_API_KEY=your_1inch_api_key
```

## Next Steps

1. **Resolve API access** - Most critical blocker
2. **Deploy router contract** - Required for actual swaps
3. **Test quote fetching** - Verify API integration works
4. **Implement transaction encoding** - With real contract ABI
5. **Add comparison UI rendering** - Integrate into main Aggregator component
6. **Test full swap flow** - End-to-end on Base mainnet
7. **Deploy to production** - Vercel/Railway with custom domain

## Questions to Resolve

1. Does the Alpha Router API require authentication? If so, what headers?
2. Is there a deployed Alpha Router contract on Base? What's the address and ABI?
3. Does the API return transaction calldata directly, or just route information?
4. Should we support split routes (multiple paths for single swap)?
5. What's the fee structure for using Alpha Router?

## Support

- API Issues: Check Alpha Router backend logs
- Smart Contract: Verify contract deployment and ABI
- Frontend: Standard Next.js debugging
