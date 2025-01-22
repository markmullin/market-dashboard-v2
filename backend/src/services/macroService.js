import { getStockData } from './stockService.js';

export const getMacroMetrics = async () => {
    try {
        // Get indicator data using stock service
        const [spy, tlt, gld, vix] = await Promise.all([
            getStockData('SPY'),
            getStockData('TLT'),
            getStockData('GLD'),
            getStockData('VIX')
        ]);

        // Calculate metrics using real market data
        const metrics = {
            growthAndHealth: {
                score: calculateGrowthScore(spy.price.changePercent),
                grade: getGradeFromScore(calculateGrowthScore(spy.price.changePercent)),
                components: {
                    market: { 
                        score: calculateGrowthScore(spy.price.changePercent),
                        grade: getGradeFromScore(calculateGrowthScore(spy.price.changePercent))
                    }
                },
                description: 'Market growth metrics',
                impact: 'Current market conditions',
                context: `SPY Change: ${spy.price.changePercent.toFixed(2)}%`
            },
            monetaryPolicy: {
                score: calculateMonetaryScore(tlt.price.changePercent),
                grade: getGradeFromScore(calculateMonetaryScore(tlt.price.changePercent)),
                components: {
                    rates: {
                        score: calculateMonetaryScore(tlt.price.changePercent),
                        grade: getGradeFromScore(calculateMonetaryScore(tlt.price.changePercent))
                    }
                },
                description: 'Bond market indicators',
                impact: 'Interest rate environment',
                context: `TLT Change: ${tlt.price.changePercent.toFixed(2)}%`
            },
            inflationMetrics: {
                score: calculateInflationScore(gld.price.changePercent),
                grade: getGradeFromScore(calculateInflationScore(gld.price.changePercent)),
                components: {
                    gold: {
                        score: calculateInflationScore(gld.price.changePercent),
                        grade: getGradeFromScore(calculateInflationScore(gld.price.changePercent))
                    }
                },
                description: 'Inflation indicators',
                impact: 'Price stability measures',
                context: `GLD Change: ${gld.price.changePercent.toFixed(2)}%`
            },
            globalMarkets: {
                score: calculateVolatilityScore(vix.price.current || 20),
                grade: getGradeFromScore(calculateVolatilityScore(vix.price.current || 20)),
                components: {
                    volatility: {
                        score: calculateVolatilityScore(vix.price.current || 20),
                        grade: getGradeFromScore(calculateVolatilityScore(vix.price.current || 20))
                    }
                },
                description: 'Global market conditions',
                impact: 'Market stability assessment',
                context: `VIX Level: ${vix.price.current?.toFixed(2) || 'N/A'}`
            }
        };

        return metrics;
    } catch (error) {
        console.error('Error fetching macro metrics:', error);
        throw error;
    }
};

const calculateGrowthScore = (spyChange) => {
    // Map market change to growth score
    const baseScore = 50 + (spyChange * 10);
    return Math.min(100, Math.max(0, baseScore));
};

const calculateMonetaryScore = (tltChange) => {
    // Map bond change to monetary score (inverse)
    const baseScore = 50 - (tltChange * 10);
    return Math.min(100, Math.max(0, baseScore));
};

const calculateInflationScore = (gldChange) => {
    // Map gold change to inflation score (inverse)
    const baseScore = 50 - (gldChange * 10);
    return Math.min(100, Math.max(0, baseScore));
};

const calculateVolatilityScore = (vixLevel) => {
    // Lower VIX is better
    if (!vixLevel || isNaN(vixLevel)) return 50;
    
    // Score based on VIX ranges
    if (vixLevel <= 15) return 90;
    if (vixLevel <= 20) return 75;
    if (vixLevel <= 25) return 60;
    if (vixLevel <= 30) return 45;
    if (vixLevel <= 35) return 30;
    return 15;
};

const getGradeFromScore = (score) => {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'A-';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'B-';
    if (score >= 65) return 'C+';
    if (score >= 60) return 'C';
    if (score >= 55) return 'C-';
    if (score >= 50) return 'D+';
    if (score >= 45) return 'D';
    if (score >= 40) return 'D-';
    return 'F';
};