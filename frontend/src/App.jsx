import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, AlertCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [marketData, setMarketData] = useState([]);
  const [macroData, setMacroData] = useState({});
  const [marketMover, setMarketMover] = useState(null);
  const [moverHistory, setMoverHistory] = useState([]);
  const [sectorData, setSectorData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [marketResponse, macroResponse, moverResponse, historyResponse, sectorResponse] = await Promise.all([
          fetch('http://localhost:5000/api/market/data'),
          fetch('http://localhost:5000/api/market/macro'),
          fetch('http://localhost:5000/api/market/mover'),
          fetch('http://localhost:5000/api/market/mover-history'),
          fetch('http://localhost:5000/api/market/sectors')
        ]);

        const market = await marketResponse.json();
        const macro = await macroResponse.json();
        const mover = await moverResponse.json();
        const history = await historyResponse.json();
        const sectors = await sectorResponse.json();
        
        setMarketData(market);
        setMacroData(macro);
        setMarketMover(mover);
        setMoverHistory(history);
        setSectorData(sectors);
        setError(null);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  // Filter only main market indices
  const mainIndices = marketData.filter(data => 
    ['SPY', 'QQQ', 'DIA', 'IWM'].includes(data.symbol)
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Market Dashboard</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Market Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {mainIndices.map((data) => (
              <div key={data.symbol} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-gray-600 mb-2">{data.name || data.symbol}</h3>
                <p className="text-2xl font-bold">${data.close?.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {data.change_p >= 0 ? (
                    <ArrowUp className="text-green-500" size={20} />
                  ) : (
                    <ArrowDown className="text-red-500" size={20} />
                  )}
                  <span className={data.change_p >= 0 ? "text-green-500" : "text-red-500"}>
                    {data.change_p?.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Sector Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {sectorData.map((sector) => (
              <div key={sector.symbol} 
                   className="bg-white p-4 rounded-lg shadow"
                   style={{ borderLeft: `4px solid ${sector.color}` }}>
                <h3 className="text-gray-600 mb-2">{sector.name}</h3>
                <p className="text-2xl font-bold">${sector.close?.toFixed(2)}</p>
                <div className="flex items-center gap-1 mt-2">
                  {sector.change_p >= 0 ? (
                    <ArrowUp className="text-green-500" size={20} />
                  ) : (
                    <ArrowDown className="text-red-500" size={20} />
                  )}
                  <span className={sector.change_p >= 0 ? "text-green-500" : "text-red-500"}>
                    {sector.change_p?.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Macroeconomic Environment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 mb-2">Treasury Bonds (TLT)</h3>
              <p className="text-2xl font-bold">${macroData.tlt?.price?.toFixed(2) || '0.00'}</p>
              <div className="flex items-center gap-1 mt-2">
                {(macroData.tlt?.change || 0) >= 0 ? (
                  <ArrowUp className="text-green-500" size={20} />
                ) : (
                  <ArrowDown className="text-red-500" size={20} />
                )}
                <span className={(macroData.tlt?.change || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                  {(macroData.tlt?.change || 0).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 mb-2">US Dollar (UUP)</h3>
              <p className="text-2xl font-bold">${macroData.usdIndex?.price?.toFixed(2) || '0.00'}</p>
              <div className="flex items-center gap-1 mt-2">
                {(macroData.usdIndex?.change || 0) >= 0 ? (
                  <ArrowUp className="text-green-500" size={20} />
                ) : (
                  <ArrowDown className="text-red-500" size={20} />
                )}
                <span className={(macroData.usdIndex?.change || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                  {(macroData.usdIndex?.change || 0).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-gray-600 mb-2">Bitcoin ETF (IBIT)</h3>
              <p className="text-2xl font-bold">${macroData.bitcoin?.price?.toFixed(2) || '0.00'}</p>
              <div className="flex items-center gap-1 mt-2">
                {(macroData.bitcoin?.change || 0) >= 0 ? (
                  <ArrowUp className="text-green-500" size={20} />
                ) : (
                  <ArrowDown className="text-red-500" size={20} />
                )}
                <span className={(macroData.bitcoin?.change || 0) >= 0 ? "text-green-500" : "text-red-500"}>
                  {(macroData.bitcoin?.change || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {marketMover && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <TrendingUp className="text-blue-500" />
              Top Market Mover
            </h2>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-1">{marketMover.symbol}</h3>
                  <p className="text-2xl font-bold">${Number(marketMover.price).toFixed(2)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {Number(marketMover.changePercent) >= 0 ? (
                      <ArrowUp className="text-green-500" size={20} />
                    ) : (
                      <ArrowDown className="text-red-500" size={20} />
                    )}
                    <span className={Number(marketMover.changePercent) >= 0 ? "text-green-500" : "text-red-500"}>
                      {Number(marketMover.changePercent).toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="max-w-lg">
                  <p className="text-gray-600">{marketMover.reason}</p>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moverHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#2563eb" />
                    <Line type="monotone" dataKey="ma200" stroke="#dc2626" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;