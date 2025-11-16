import { Box, Flex, Text, Badge, Tooltip, Icon } from '@chakra-ui/react';
import { CheckCircle, TrendingUp, Zap, AlertTriangle, Info } from 'react-feather';
import styled from 'styled-components';
import type { AlphaRouteComparison as ComparisonType, AlphaRoutingInfo, AlphaRouteSummary, AlphaRouteImpact } from '../Aggregator/adapters/alphaRouter/types';
import { formattedNum } from '~/utils';

interface Props {
	comparison: ComparisonType[];
	routing: AlphaRoutingInfo;
	summary: AlphaRouteSummary;
	impact: AlphaRouteImpact;
	amountOut: string;
	toTokenSymbol: string;
	toTokenDecimals: number;
}

const ComparisonCard = styled(Box)`
	background: linear-gradient(135deg, rgba(0, 82, 255, 0.1) 0%, rgba(0, 82, 255, 0.05) 100%);
	border: 1px solid rgba(0, 82, 255, 0.3);
	border-radius: 12px;
	padding: 16px;
	margin-top: 12px;
`;

const ComparisonRow = styled(Flex)`
	padding: 8px 12px;
	border-radius: 8px;
	background: rgba(255, 255, 255, 0.02);
	margin-bottom: 6px;

	&:last-child {
		margin-bottom: 0;
	}

	&.winner {
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
	}

	&.loser {
		opacity: 0.7;
	}
`;

const SavingsBadge = styled(Badge)`
	background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
	color: white;
	font-weight: 600;
	padding: 4px 12px;
	border-radius: 20px;
	font-size: 14px;
`;

const GABadge = styled(Badge)`
	background: linear-gradient(135deg, #0052ff 0%, #3b82f6 100%);
	color: white;
	font-weight: 600;
	padding: 2px 8px;
	border-radius: 12px;
	font-size: 11px;
`;

export const AlphaRouteComparison = ({
	comparison,
	routing,
	summary,
	impact,
	amountOut,
	toTokenSymbol,
	toTokenDecimals
}: Props) => {
	const formattedAmountOut = Number(amountOut) / 10 ** toTokenDecimals;
	const hasSavings = summary.savingsPercent > 0;

	return (
		<ComparisonCard>
			{/* Header with savings highlight */}
			<Flex justifyContent="space-between" alignItems="center" mb={4}>
				<Flex alignItems="center" gap={2}>
					<Icon as={TrendingUp} color="#0052ff" boxSize={5} />
					<Text fontWeight="700" fontSize="16px" color="#FAFAFA">
						Route Comparison
					</Text>
					<GABadge>GA Optimized</GABadge>
				</Flex>
				{hasSavings && (
					<SavingsBadge>
						Save {summary.savings} ({(summary.savingsPercent * 100).toFixed(2)}%)
					</SavingsBadge>
				)}
			</Flex>

			{/* Alpha Router - Best Route */}
			<ComparisonRow className="winner" justifyContent="space-between" alignItems="center">
				<Flex alignItems="center" gap={2}>
					<Icon as={CheckCircle} color="#22c55e" boxSize={4} />
					<Text fontWeight="600" color="#22c55e">
						Alpha Router
					</Text>
					<Tooltip label="Genetic algorithm finds optimal path across all DEXs" placement="top">
						<Badge colorScheme="blue" fontSize="10px" cursor="help">
							BEST
						</Badge>
					</Tooltip>
				</Flex>
				<Flex alignItems="center" gap={3}>
					<Text fontWeight="700" color="#22c55e">
						{formattedNum(formattedAmountOut)} {toTokenSymbol}
					</Text>
				</Flex>
			</ComparisonRow>

			{/* Competitor comparisons */}
			{comparison.map((comp) => {
				const compAmountOut = Number(comp.amountOut) / 10 ** toTokenDecimals;
				const percentWorse = (comp.percentDifference * 100).toFixed(2);
				const isAvailable = comp.available;

				return (
					<ComparisonRow key={comp.name} className="loser" justifyContent="space-between" alignItems="center">
						<Flex alignItems="center" gap={2}>
							<Text color="#A0A0A0" fontWeight="500">
								{comp.name}
							</Text>
							{!isAvailable && (
								<Tooltip label="Quote not available for this pair" placement="top">
									<Icon as={AlertTriangle} color="#ef4444" boxSize={3} />
								</Tooltip>
							)}
						</Flex>
						<Flex alignItems="center" gap={3}>
							{isAvailable ? (
								<>
									<Text color="#A0A0A0">
										{formattedNum(compAmountOut)} {toTokenSymbol}
									</Text>
									<Badge colorScheme="red" fontSize="10px">
										-{percentWorse}%
									</Badge>
								</>
							) : (
								<Text color="#666" fontSize="12px">
									N/A
								</Text>
							)}
						</Flex>
					</ComparisonRow>
				);
			})}

			{/* Route details */}
			<Box mt={4} pt={3} borderTop="1px solid rgba(255,255,255,0.1)">
				<Flex justifyContent="space-between" mb={2}>
					<Flex alignItems="center" gap={1}>
						<Icon as={Zap} color="#f59e0b" boxSize={3} />
						<Text fontSize="12px" color="#A0A0A0">
							Route Complexity
						</Text>
					</Flex>
					<Text fontSize="12px" color="#FAFAFA">
						{routing.hops} hop{routing.hops > 1 ? 's' : ''} via {routing.bestSource}
					</Text>
				</Flex>

				{routing.isSplit && (
					<Flex justifyContent="space-between" mb={2}>
						<Text fontSize="12px" color="#A0A0A0">
							Split Route
						</Text>
						<Badge colorScheme="purple" fontSize="10px">
							Optimized Split
						</Badge>
					</Flex>
				)}

				<Flex justifyContent="space-between" mb={2}>
					<Text fontSize="12px" color="#A0A0A0">
						Price Impact
					</Text>
					<Text
						fontSize="12px"
						color={impact.priceImpactPercent > 5 ? '#ef4444' : impact.priceImpactPercent > 1 ? '#f59e0b' : '#22c55e'}
					>
						{impact.priceImpactPercent.toFixed(3)}%
					</Text>
				</Flex>

				<Flex justifyContent="space-between">
					<Flex alignItems="center" gap={1}>
						<Text fontSize="12px" color="#A0A0A0">
							MEV Risk
						</Text>
						<Tooltip label="Risk of MEV extraction affecting your swap" placement="top">
							<Icon as={Info} color="#666" boxSize={3} cursor="help" />
						</Tooltip>
					</Flex>
					<Badge
						colorScheme={impact.mevRisk === 'low' ? 'green' : impact.mevRisk === 'medium' ? 'yellow' : 'red'}
						fontSize="10px"
					>
						{impact.mevRisk.toUpperCase()}
					</Badge>
				</Flex>
			</Box>

			{/* Execution time */}
			<Flex justifyContent="flex-end" mt={2}>
				<Text fontSize="10px" color="#666">
					Quote fetched in {summary.executionTime}
				</Text>
			</Flex>
		</ComparisonCard>
	);
};

export default AlphaRouteComparison;
