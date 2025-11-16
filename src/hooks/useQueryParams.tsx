import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { zeroAddress } from 'viem';

export function useQueryParams() {
	const router = useRouter();

	const urlParams = new URLSearchParams(window.location.search);
	const toToken = urlParams.get('to');
	const fromToken = urlParams.get('from');
	const chainOnURL = urlParams.get('chain');

	const query = router.query;

	// Base Router is Base-only, always default to Base
	const chainName = 'base';
	const fromTokenAddress = typeof fromToken === 'string' ? fromToken.toLowerCase() : null;
	const toTokenAddress = typeof toToken === 'string' ? toToken.toLowerCase() : null;

	useEffect(() => {
		if (router.isReady && chainOnURL !== 'base') {
			// Always redirect to Base chain for Base Router
			router.push(
				{
					pathname: '/',
					query: { ...query, chain: 'base', from: zeroAddress, tab: 'swap' }
				},
				undefined,
				{ shallow: true }
			);
		}
	}, [chainOnURL, router]);

	return { chainName, fromTokenAddress, toTokenAddress };
}
