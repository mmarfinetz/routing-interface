import { Chain } from 'viem';
import { chainIconUrl } from '../Aggregator/nativeTokens';
import * as wagmiChains from 'viem/chains';

const base = {
	...wagmiChains.base,
	network: 'base',
	iconUrl: chainIconUrl('Base'),
	iconBackground: '#000'
};

interface IChain extends Chain {
	network: string;
	iconUrl: string;
	iconBackground: string;
}

// Alpha Router only supports Base chain
export const allChains: Array<IChain> = [base];
