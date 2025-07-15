
import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
    count?: string;
  }>;
}

interface CountTreeVisualizationProps {
  reportData: any;
  selectedMetrics: string[];
}

const CountTreeVisualization = ({ reportData, selectedMetrics }: CountTreeVisualizationProps) => {
  const [processedData, setProcessedData] = useState<CountTreeData[]>([]);
  const [selectedCount, setSelectedCount] = useState<string | null>(null);

  // Updated node layout for seamless top-down tree structure with better spacing
  const nodeLayout: { [key: string]: [number, number] } = {
    // Root level (0-0)
    '0-0': [0, 0],
    
    // First level - balls or strikes
    '1-0': [-2, 1.5], '0-1': [2, 1.5],
    
    // Second level - combinations
    '2-0': [-3, 3], '1-1': [0, 3], '0-2': [3, 3],
    
    // Third level - more combinations
    '3-0': [-4, 4.5], '2-1': [-1.5, 4.5], '1-2': [1.5, 4.5],
    
    // Fourth level - final combinations
    '3-1': [-3, 6], '2-2': [0, 6],
    
    // Final level - 3-2 (more spaced out)
    '3-2': [0, 7.5]
  };

  useEffect(() => {
    if (!reportData?.pitchRecommendations) return;

    // Group recommendations by count (simulating your Python logic)
    const countGroups: { [key: string]: any[] } = {};
    
    // For demo purposes, distribute the pitch recommendations across different counts
    // In real implementation, this would come from your backend with count-specific data
    const counts = ['0-0', '0-1', '1-0', '1-1', '0-2', '2-0', '2-1', '1-2', '2-2', '3-0', '3-1', '3-2'];
    
    counts.forEach((count, index) => {
      // Get recommendations for this specific count from the backend data
      const countRecommendations = reportData.pitchRecommendations.filter((rec: any) => rec.count === count);
      
      if (countRecommendations.length > 0) {
        // Sort recommendations by score (highest first) and add count
        const sortedRecommendations = countRecommendations
          .map((rec: any) => ({
            ...rec,
            count: count
          }))
          .sort((a: any, b: any) => b.score - a.score);
        
        countGroups[count] = sortedRecommendations;
      } else {
        // Fallback: simulate data if no specific count data exists
        const startIndex = index % reportData.pitchRecommendations.length;
        const recommendations = reportData.pitchRecommendations.slice(startIndex, startIndex + 3);
        
        if (recommendations.length > 0) {
          // Remove duplicates based on pitch_type and count
          const uniqueRecommendations = recommendations
            .map((rec: any) => ({
              ...rec,
              count: count
            }))
            .filter((rec: any, index: number, arr: any[]) => 
              arr.findIndex(r => r.pitch_type === rec.pitch_type && r.count === rec.count) === index
            )
            .sort((a: any, b: any) => b.score - a.score);
          
          countGroups[count] = uniqueRecommendations;
        }
      }
    });

    const processed = Object.entries(countGroups).map(([count, recs]) => ({
      count,
      pitchRecommendations: recs
    }));

    // Debug: Log the processed data to see what's happening
    console.log('Processed count data:', processed);

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

  const createHoverContent = (countData: CountTreeData) => {
    return (
      <div className="p-2 space-y-2">
        <div className="font-semibold text-white border-b border-slate-600 pb-1">
          Count: {countData.count}
        </div>
        <div className="text-sm space-y-1">
          {countData.pitchRecommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className={`border-l-2 pl-2 ${index === 0 ? 'border-green-400' : 'border-blue-400'}`}>
              <div className={`font-medium ${index === 0 ? 'text-green-300' : 'text-blue-300'}`}>
                {rec.pitch_type} {index === 0 && '(Best)'}
              </div>
              <div className="text-xs text-slate-300">
                Score: {rec.score.toFixed(1)}
              </div>
              {selectedMetrics.map(metric => {
                if (rec[metric] !== undefined) {
                  return (
                    <div key={metric} className="text-xs text-slate-300">
                      {metricDisplayMap[metric]}: {formatMetricValue(rec[metric], metric)}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (processedData.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No count data available for visualization</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Count Tree Grid */}
        <div className="relative bg-slate-700/20 rounded-lg p-6" style={{ minHeight: '700px' }}>
          <div className="absolute inset-0 p-6">
            <svg viewBox="-5 -1 10 9" className="w-full h-full">
              {/* Draw connections between counts */}
              {processedData.map(({ count }) => {
                const [balls, strikes] = count.split('-').map(Number);
                const [x, y] = nodeLayout[count];
                const connections = [];
                
                // Ball connections (going down and left)
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
                
                // Strike connections (going down and right)
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
              
              {/* Draw count nodes with tooltips */}
              {processedData.map(({ count, pitchRecommendations }) => {
                const [x, y] = nodeLayout[count];
                const topScore = pitchRecommendations[0]?.score || 0;
                const color = getNodeColor(topScore);
                
                return (
                  <Tooltip key={count}>
                    <TooltipTrigger asChild>
                      <g
                        className="cursor-pointer"
                        onClick={() => setSelectedCount(selectedCount === count ? null : count)}
                      >
                        <circle
                          cx={x}
                          cy={y}
                          r="0.4"
                          fill={color}
                          stroke="#fff"
                          strokeWidth="0.05"
                          className="hover:opacity-80 transition-opacity"
                        />
                        <text
                          x={x}
                          y={y + 0.1}
                          textAnchor="middle"
                          fill="white"
                          fontSize="0.3"
                          fontWeight="bold"
                          pointerEvents="none"
                        >
                          {count}
                        </text>
                      </g>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm">
                      {createHoverContent({ count, pitchRecommendations })}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Raw Data Table */}
        {selectedCount && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">
                Raw Data for Count: {selectedCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">Pitch Type</TableHead>
                    <TableHead className="text-slate-300">Score</TableHead>
                    <TableHead className="text-slate-300">Pitches</TableHead>
                    {selectedMetrics.map(metric => (
                      <TableHead key={metric} className="text-slate-300">
                        {metricDisplayMap[metric]}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedData
                    .find(d => d.count === selectedCount)
                    ?.pitchRecommendations.map((rec, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-white font-medium">
                          {rec.pitch_type}
                        </TableCell>
                        <TableCell className="text-blue-400 font-semibold">
                          {rec.score.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {rec.pitches}
                        </TableCell>
                        {selectedMetrics.map(metric => (
                          <TableCell key={metric} className="text-slate-300">
                            {rec[metric] !== undefined ? formatMetricValue(rec[metric], metric) : 'N/A'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

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
            <span className="text-slate-300">Poor (&lt;3.5)</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default CountTreeVisualization;
