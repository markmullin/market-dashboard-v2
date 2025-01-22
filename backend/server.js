import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();
app.use(cors());
app.use(express.json());

const EOD_API_KEY = "678aec6f82cd71.08686199";

// Market Data endpoint
app.get('/api/market-data', async (req, res) => {
    try {
        const symbols = ['QQQ', 'SPY', 'DIA'];
        const requests = symbols.map(symbol => 
            axios.get(`https://eodhistoricaldata.com/api/real-time/${symbol}.US?api_token=${EOD_API_KEY}&fmt=json`)
        );
        
        const responses = await Promise.all(requests);
        const marketData = {};
        
        responses.forEach((response, index) => {
            const data = response.data;
            marketData[symbols[index]] = {
                ...data,
                change_p: data.change_p === 'NA' ? 
                    ((data.close - data.previousClose) / data.previousClose * 100) : 
                    Number(data.change_p)
            };
        });
        
        res.json(marketData);
    } catch (error) {
        console.error('Market data error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Macro Data endpoint
app.get('/api/macro-data', async (req, res) => {
    try {
        const [treasuryResponse, uupResponse, ibitResponse] = await Promise.all([
            axios.get(`https://eodhistoricaldata.com/api/real-time/TNX.INDX?api_token=${EOD_API_KEY}&fmt=json`),
            axios.get(`https://eodhistoricaldata.com/api/real-time/UUP.US?api_token=${EOD_API_KEY}&fmt=json`),
            axios.get(`https://eodhistoricaldata.com/api/real-time/IBIT.US?api_token=${EOD_API_KEY}&fmt=json`)
        ]);

        const macroData = {
            treasury10Y: Number(treasuryResponse.data.close === 'NA' ? treasuryResponse.data.previousClose : treasuryResponse.data.close),
            usdIndex: {
                price: Number(uupResponse.data.close === 'NA' ? uupResponse.data.previousClose : uupResponse.data.close),
                change: Number(uupResponse.data.change_p === 'NA' ? 
                    ((uupResponse.data.close - uupResponse.data.previousClose) / uupResponse.data.previousClose * 100) : 
                    uupResponse.data.change_p)
            },
            bitcoin: {
                price: Number(ibitResponse.data.close === 'NA' ? ibitResponse.data.previousClose : ibitResponse.data.close),
                change: Number(ibitResponse.data.change_p === 'NA' ? 
                    ((ibitResponse.data.close - ibitResponse.data.previousClose) / ibitResponse.data.previousClose * 100) : 
                    ibitResponse.data.change_p)
            }
        };

        res.json(macroData);
    } catch (error) {
        console.error('Macro data error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Market Mover endpoint
app.get('/api/market-mover', async (req, res) => {
    try {
        const stocks = ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'NVDA', 'JPM', 'V', 'XOM'];
        const requests = stocks.map(symbol => 
            axios.get(`https://eodhistoricaldata.com/api/real-time/${symbol}.US?api_token=${EOD_API_KEY}&fmt=json`)
        );

        const responses = await Promise.all(requests);
        const stocksData = responses.map((response, index) => ({
            symbol: stocks[index],
            data: response.data
        }));

        const mover = stocksData
            .map(stock => ({
                symbol: stock.symbol,
                price: Number(stock.data.close === 'NA' ? stock.data.previousClose : stock.data.close),
                change: Number(stock.data.change),
                changePercent: Number(stock.data.change_p === 'NA' ? 
                    ((stock.data.close - stock.data.previousClose) / stock.data.previousClose * 100) : 
                    stock.data.change_p)
            }))
            .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))[0];

        res.json(mover);
    } catch (error) {
        console.error('Market mover error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));