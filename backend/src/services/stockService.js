import fetch from 'node-fetch';

const EOD_API_KEY = '678aec6f82cd71.08686199';

export const getStockData = async (symbol) => {
    try {
        // Use the real-time quotes endpoint
        const url = `https://eodhistoricaldata.com/api/real-time/${symbol}.US?api_token=${EOD_API_KEY}&fmt=json`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.error(`API request failed for ${symbol} with status ${response.status}`);
            throw new Error(`API request failed for ${symbol}`);
        }

        const data = await response.json();
        console.log(`Raw data for ${symbol}:`, data); // Debug log

        return {
            symbol: symbol,
            price: {
                current: parseFloat(data.close || 0),
                change: parseFloat(data.change || 0),
                changePercent: parseFloat(data.change_p || 0),
                volume: parseInt(data.volume || 0, 10)
            },
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        throw new Error(`Failed to fetch stock data for ${symbol}`);
    }
};