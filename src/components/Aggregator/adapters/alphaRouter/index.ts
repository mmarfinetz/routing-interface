// Alpha Router - Genetic Algorithm Optimized DEX Aggregator for Base
// Uses GA routing to find optimal swap paths

import { sendTx } from '../../utils/sendTx';
import { estimateGas } from 'wagmi/actions';
import { config } from '../../../WalletProvider';
import { zeroAddress } from 'viem';
import { getTxs } from '../../utils/getTxs';
import type { AlphaQuoteResponse, AlphaQuote } from './types';

// Alpha Router only supports Base chain
export const chainToId = {
	base: 8453
};

// Alpha Router contract address on Base - this would be your deployed router contract
// TODO: Replace with actual deployed contract address
const ALPHA_ROUTER_CONTRACT = '0x0000000000000000000000000000000000000000';

export const name = 'Alpha Router';
export const token = 'ALPHA';
export const referral = false;
export const isOutputAvailable = false; // We only support exact input swaps for now

// API endpoint for Alpha Router
const API_BASE_URL = process.env.NEXT_PUBLIC_ALPHA_ROUTER_URL || 'https://alpha-router-base-production.up.railway.app';

export function approvalAddress(_chain: string) {
	// Users approve the Alpha Router contract to spend their tokens
	return ALPHA_ROUTER_CONTRACT;
}

const WETH_BASE = '0x4200000000000000000000000000000000000006';

export async function getQuote(chain: string, from: string, to: string, amount: string, extra: {
	userAddress?: string;
	slippage?: number;
	gasPriceData?: { gasPrice: number };
}) {
	if (chain !== 'base') {
		throw new Error('Alpha Router only supports Base chain');
	}

	// Convert native token address to WETH for the API
	const tokenFrom = from === zeroAddress ? WETH_BASE : from;
	const tokenTo = to === zeroAddress ? WETH_BASE : to;

	try {
		const response = await fetch(`${API_BASE_URL}/api/quote`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				chain: 'base',
				fromToken: tokenFrom,
				toToken: tokenTo,
				amountIn: amount,
				userAddress: extra.userAddress !== zeroAddress ? extra.userAddress : undefined,
				slippage: extra.slippage
			})
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Alpha Router API error: ${response.status} - ${errorText}`);
		}

		const data: AlphaQuoteResponse = await response.json();

		if (!data.success || !data.quote) {
			throw new Error('Alpha Router: No valid quote returned');
		}

		const quote = data.quote;

		// Calculate total gas estimate from route steps
		const estimatedGas = quote.route.reduce((total, step) => {
			return total + (parseInt(step.gasEstimate) || 0);
		}, 0);

		// Build the raw quote object that will be used for swap execution
		const rawQuote = {
			...quote,
			// Include transaction data if we have user address
			tx: extra.userAddress && extra.userAddress !== zeroAddress ? buildSwapTransaction(quote, extra.userAddress, extra.slippage || 0.5) : null
		};

		return {
			amountReturned: quote.amountOut,
			estimatedGas: estimatedGas || 150000, // Default gas estimate
			tokenApprovalAddress: ALPHA_ROUTER_CONTRACT,
			rawQuote,
			logo: 'https://raw.githubusercontent.com/base-org/brand-kit/main/logo/symbol/Base_Symbol_Blue.svg',
			// Include comparison data for UI display
			comparison: quote.comparison,
			routing: quote.routing,
			fees: quote.fees,
			impact: quote.impact,
			summary: quote.summary
		};
	} catch (error) {
		console.error('Alpha Router quote fetch error:', error);
		throw error;
	}
}

// Build swap transaction data from route
function buildSwapTransaction(quote: AlphaQuote, userAddress: string, slippage: number) {
	// Calculate minimum output with slippage
	const amountOutMin = BigInt(quote.amountOut) * BigInt(Math.floor((100 - slippage) * 100)) / 10000n;

	// For now, we'll create a placeholder transaction structure
	// This would be replaced with actual router contract interaction
	// The actual implementation depends on the deployed Alpha Router smart contract

	return {
		from: userAddress,
		to: ALPHA_ROUTER_CONTRACT,
		data: '0x', // Would contain encoded swap call
		value: '0',
		gasLimit: quote.route.reduce((total, step) => total + parseInt(step.gasEstimate || '0'), 0).toString(),
		// Include route data for potential multi-hop execution
		route: quote.route,
		amountOutMin: amountOutMin.toString()
	};
}

export async function swap({ tokens, fromAmount, rawQuote, eip5792, chain }) {
	if (!rawQuote?.tx) {
		throw new Error('Alpha Router: No transaction data available. Please refresh quote.');
	}

	const txs = getTxs({
		fromAddress: rawQuote.tx.from,
		routerAddress: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value,
		fromTokenAddress: tokens.fromToken.address,
		fromAmount,
		eip5792,
		tokenApprovalAddress: ALPHA_ROUTER_CONTRACT
	});

	const gasPrediction = await estimateGas(config, txs[txs.length - 1]).catch(() => null);

	const finalTxObj = {
		...txs[txs.length - 1],
		// Increase gas by 20% for safety margin
		...(gasPrediction ? { gas: (gasPrediction * 12n) / 10n + 86000n } : {})
	};

	const tx = await sendTx(txs.slice(0, -1).concat([finalTxObj]));

	return tx;
}

export const getTxData = ({ rawQuote }) => rawQuote?.tx?.data;

export const getTx = ({ rawQuote }) => {
	if (!rawQuote?.tx) {
		return {};
	}
	return {
		from: rawQuote.tx.from,
		to: rawQuote.tx.to,
		data: rawQuote.tx.data,
		value: rawQuote.tx.value || '0'
	};
};

// Export comparison utilities for UI components
export const getComparison = (rawQuote: { comparison?: AlphaQuote['comparison'] }) => {
	return rawQuote?.comparison || [];
};

export const getRoutingInfo = (rawQuote: { routing?: AlphaQuote['routing'] }) => {
	return rawQuote?.routing || null;
};

export const getSavings = (rawQuote: { summary?: AlphaQuote['summary'] }) => {
	return rawQuote?.summary ? {
		amount: rawQuote.summary.savings,
		percent: rawQuote.summary.savingsPercent
	} : null;
};
