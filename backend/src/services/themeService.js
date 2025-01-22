import { getStockData } from './stockService.js';

// Define market themes
const THEMES = [
    {
        id: 'ai',
        name: 'Artificial Intelligence',
        description: 'Companies leading in AI and machine learning',
        stocks: ['NVDA', 'MSFT', 'GOOGL'],
        color: 'blue'
    },
    {
        id: 'semiconductors',
        name: 'Semiconductors',
        description: 'Leading semiconductor manufacturers and designers',
        stocks: ['NVDA', 'AMD', 'INTC'],
        color: 'purple'
    },
    {
        id: 'financials',
        name: 'Financial Services',
        description: 'Major financial institutions and services',
        stocks: ['JPM', 'GS', 'MS'],
        color: 'green'
    },
    {
        id: 'energy',
        name: 'Energy Sector',
        description: 'Traditional and renewable energy companies',
        stocks: ['XLE', 'CVX', 'XOM'],
        color: 'yellow'
    }
];

export const getMarketThemes = async () => {
    try {
        // Process each theme
        const themePromises = THEMES.map(async (theme) => {
            try {
                // Get real-time data for each stock in the theme
                const stockPromises = theme.stocks.map(symbol => 
                    getStockData(symbol).catch(error => {
                        console.warn(`Error fetching ${symbol}:`, error);
                        return null;
                    })
                );

                const stocksData = await Promise.all(stockPromises);
                const validStocksData = stocksData.filter(Boolean);

                // Calculate theme performance
                const performance = calculateThemePerformance(validStocksData);

                return {
                    ...theme,
                    performance,
                    stocks: validStocksData.map(stock => ({
                        symbol: stock.symbol,
                        price: stock.price.current,
                        change: stock.price.change,
                        changePercent: stock.price.changePercent
                    }))
                };
            } catch (error) {
                console.error(`Error processing theme ${theme.name}:`, error);
                return null;
            }
        });

        const themes = await Promise.all(themePromises);
        return themes.filter(Boolean); // Remove any failed themes

    } catch (error) {
        console.error('Error fetching market themes:', error);
        throw new Error('Failed to fetch market themes');
    }
};

const calculateThemePerformance = (stocks) => {
    if (!stocks || stocks.length === 0) {
        return {
            daily: 0,
            trend: 'neutral',
            strength: 'weak'
        };
    }

    // Calculate average performance
    const totalChange = stocks.reduce((sum, stock) => {
        const change = parseFloat(stock.price.changePercent) || 0;
        return sum + change;
    }, 0);

    const avgChange = totalChange / stocks.length;

    // Determine trend and strength
    return {
        daily: avgChange,
        trend: avgChange >= 0 ? 'up' : 'down',
        strength: Math.abs(avgChange) >= 1 ? 'strong' : 'moderate'
    };
};