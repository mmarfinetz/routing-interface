// Alpha Router API Types

export interface AlphaRouteStep {
	dex: string;
	poolAddress: string;
	amountOut: string;
	gasEstimate: string;
	priceImpact: string;
	path: string[];
	poolType: string;
}

export interface AlphaRouteFees {
	dexFees: Array<{ dex: string; amount: string; percent: number }>;
	totalDexFees: string;
	gasCost: string;
	gasCostUSD: number;
	ourFee: string;
	ourFeePercent: number;
	totalFees: string;
}

export interface AlphaRouteImpact {
	priceImpact: string;
	priceImpactPercent: number;
	effectivePrice: string;
	mevRisk: string;
	expectedSlippage: number;
}

export interface AlphaRouteSimulation {
	simulated: boolean;
	success: boolean;
}

export interface AlphaRouteComparison {
	name: string;
	amountOut: string;
	difference: string;
	percentDifference: number;
	reason: string;
	available: boolean;
}

export interface AlphaRoutingInfo {
	isSplit: boolean;
	hops: number;
	complexity: string;
	bestSource: string;
}

export interface AlphaRouteSummary {
	youGet: string;
	youPay: string;
	rate: string;
	savings: string;
	savingsPercent: number;
	executionTime: string;
}

export interface AlphaQuote {
	amountIn: string;
	amountOut: string;
	route: AlphaRouteStep[];
	fees: AlphaRouteFees;
	impact: AlphaRouteImpact;
	simulation: AlphaRouteSimulation;
	comparison: AlphaRouteComparison[];
	routing: AlphaRoutingInfo;
	summary: AlphaRouteSummary;
}

export interface AlphaQuoteResponse {
	success: boolean;
	quote: AlphaQuote;
}

export interface AlphaSwapRequest {
	chain: string;
	fromToken: string;
	toToken: string;
	amountIn: string;
	userAddress?: string;
	slippage?: number;
}
