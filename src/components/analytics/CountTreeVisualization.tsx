
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CountTreeData {
  count: string;
  pitchRecommendations: Array<{
    pitch_type: string;
    score: number;
    whiff_rate: number;
    hard_hit_rate: number;
    called_strike_rate: number;
    weak_contact_rate?: number;
    chase_rate?: number;
    pitches: number;
  }>;
}

interface CountTreeVisualizationProps {
  reportData: any;
  selectedMetrics: string[];
}

const CountTreeVisualization = ({ reportData, selectedMetrics }: CountTreeVisualizationProps) => {
  const [processedData, setProcessedData] = useState<CountTreeData[]>([]);

  // Node layout positions for count tree (same as your Python version)
  const nodeLayout: { [key: string]: [number, number] } = {
    '0-0': [0, 5],
    '1-0': [-2, 4],
    '0-1': [2, 4],
    '2-0': [-3, 3],
    '1-1': [0, 3],
    '0-2': [3, 3],
    '3-0': [-4, 2],
    '2-1': [-1.5, 2],
    '1-2': [1.5, 2],
    '3-1': [-3, 1],
    '2-2': [0, 1],
    '3-2': [-1.5, 0]
  };

  useEffect(() => {
    if (!reportData?.pitchRecommendations) return;

    // Group recommendations by count (simulating your Python logic)
    const countGroups: { [key: string]: any[] } = {};
    
    // For demo purposes, distribute the pitch recommendations across different counts
    // In real implementation, this would come from your backend with count-specific data
    const counts = ['0-0', '0-1', '1-0', '1-1', '0-2', '2-0', '2-1', '1-2', '2-2'];
    
    counts.forEach((count, index) => {
      // Simulate count-specific data by taking different slices of recommendations
      const startIndex = index % reportData.pitchRecommendations.length;
      const recommendations = reportData.pitchRecommendations.slice(startIndex, startIndex + 3);
      
      if (recommendations.length > 0) {
        countGroups[count] = recommendations.map(rec => ({
          ...rec,
          count: count
        }));
      }
    });

    const processed = Object.entries(countGroups).map(([count, recs]) => ({
      count,
      pitchRecommendations: recs
    }));

    setProcessedData(processed);
  }, [reportData]);

  const getNodeColor = (topScore: number) => {
    if (topScore >= 7.5) return '#28a745'; // Green
    if (topScore < 3.5) return '#dc3545';  // Red
    return '#ffc107'; // Yellow
  };

  const formatMetricValue = (value: number, metric: string) => {
    if (metric.includes('rate')) {
      return `${(value * 100).toFixed(1)}%`;
    }
    return value.toFixed(3);
  };

  const metricDisplayMap: { [key: string]: string } = {
    'whiff_rate': 'Whiff %',
    'chase_rate': 'Chase %',
    'weak_contact_rate': 'Weak Contact %',
    'hard_hit_rate': 'Hard Hit %',
    'called_strike_rate': 'Called Strike %'
  };

  if (processedData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No count data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Count Tree Grid */}
      <div className="relative bg-slate-700/20 rounded-lg p-6" style={{ minHeight: '500px' }}>
        <div className="absolute inset-0 p-6">
          <svg viewBox="-5 -1 10 7" className="w-full h-full">
            {/* Draw connections between counts */}
            {processedData.map(({ count }) => {
              const [balls, strikes] = count.split('-').map(Number);
              const [x, y] = nodeLayout[count];
              const connections = [];
              
              // Ball connections
              if (balls < 3) {
                const nextCount = `${balls + 1}-${strikes}`;
                if (nodeLayout[nextCount]) {
                  const [nextX, nextY] = nodeLayout[nextCount];
                  connections.push(
                    <line
                      key={`${count}-ball`}
                      x1={x}
                      y1={y}
                      x2={nextX}
                      y2={nextY}
                      stroke="#30363d"
                      strokeWidth="0.1"
                    />
                  );
                }
              }
              
              // Strike connections
              if (strikes < 2) {
                const nextCount = `${balls}-${strikes + 1}`;
                if (nodeLayout[nextCount]) {
                  const [nextX, nextY] = nodeLayout[nextCount];
                  connections.push(
                    <line
                      key={`${count}-strike`}
                      x1={x}
                      y1={y}
                      x2={nextX}
                      y2={nextY}
                      stroke="#30363d"
                      strokeWidth="0.1"
                    />
                  );
                }
              }
              
              return connections;
            })}
            
            {/* Draw count nodes */}
            {processedData.map(({ count, pitchRecommendations }) => {
              const [x, y] = nodeLayout[count];
              const topScore = pitchRecommendations[0]?.score || 0;
              const color = getNodeColor(topScore);
              
              return (
                <g key={count}>
                  <circle
                    cx={x}
                    cy={y}
                    r="0.4"
                    fill={color}
                    stroke="#fff"
                    strokeWidth="0.05"
                    className="cursor-pointer hover:opacity-80"
                  />
                  <text
                    x={x}
                    y={y + 0.1}
                    textAnchor="middle"
                    fill="white"
                    fontSize="0.3"
                    fontWeight="bold"
                  >
                    {count}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Count Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processedData.map(({ count, pitchRecommendations }) => (
          <div key={count} className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-semibold">Count: {count}</h4>
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: getNodeColor(pitchRecommendations[0]?.score || 0) }}
              />
            </div>
            
            <div className="space-y-2">
              {pitchRecommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="bg-slate-600/50 rounded p-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white font-medium">{rec.pitch_type}</span>
                    <span className="text-blue-400 font-semibold">
                      {rec.score.toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-slate-300 space-y-1">
                    {selectedMetrics.map(metric => {
                      if (rec[metric] !== undefined) {
                        return (
                          <div key={metric} className="flex justify-between">
                            <span>{metricDisplayMap[metric]}:</span>
                            <span>{formatMetricValue(rec[metric], metric)}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                    <div className="flex justify-between">
                      <span>Pitches:</span>
                      <span>{rec.pitches || rec.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-slate-300">Good (7.5+)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500" />
          <span className="text-slate-300">Average (3.5-7.5)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-slate-300">Poor (<3.5)</span>
        </div>
      </div>
    </div>
  );
};

export default CountTreeVisualization;
