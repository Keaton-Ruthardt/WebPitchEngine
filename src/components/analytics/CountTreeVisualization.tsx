
import { useEffect, useState } from "react";
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
    if (topScore >= 80) return '#5F8C6B'; // Green - Strongly Recommended
    if (topScore >= 60) return '#5E89A0'; // Blue - Recommended
    if (topScore >= 40) return '#C0954F'; // Yellow - Consider
    return '#B2604A'; // Red - Avoid
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Strongly Recommend';
    if (score >= 60) return 'Recommended';
    if (score >= 40) return 'Consider';
    return 'Avoid';
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
        <div className="font-semibold text-[#1A1915] border-b border-[#E7E2D6] pb-1">
          Count: {countData.count}
        </div>
        <div className="text-sm space-y-1">
          {countData.pitchRecommendations.slice(0, 3).map((rec, index) => (
            <div key={index} className={`border-l-2 pl-2 ${index === 0 ? 'border-[#5F8C6B]' : 'border-[#5E89A0]'}`}>
              <div className={`font-medium ${index === 0 ? 'text-[#5F8C6B]' : 'text-[#5E89A0]'}`}>
                {rec.pitch_type} {index === 0 && '(Best)'}
              </div>
              <div className="text-xs text-[#57544B]">
                PER: {rec.score.toFixed(1)} ({getScoreLabel(rec.score)})
              </div>
              {selectedMetrics.map(metric => {
                if (rec[metric] !== undefined) {
                  return (
                    <div key={metric} className="text-xs text-[#57544B]">
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
        <p className="text-[#6E6B61]">No count data available for visualization</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pitch Effectiveness Rating (PER) Description */}
        <Card className="bg-white border-[#E7E2D6] rounded-[14px] shadow-[0_2px_10px_rgba(40,38,30,0.04)]">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-[#1A1915]">Pitch Effectiveness Rating (PER)</h3>
              <p className="text-[#57544B] text-sm">
                Scores range from 0-100, indicating how effective each pitch type is for specific counts. 
                Higher scores suggest better pitch selection for that situation.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-xs">
                <div className="text-[#5F8C6B] font-medium">80-100: Strongly Recommend</div>
                <div className="text-[#5E89A0] font-medium">60-79: Recommended</div>
                <div className="text-[#C0954F] font-medium">40-59: Consider</div>
                <div className="text-[#B2604A] font-medium">0-39: Avoid</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Click hint */}
        <div className="flex items-center justify-center bg-[#F3ECE5] border border-[#E6DCCF] rounded-[9px] px-4 py-3">
          <span className="text-sm font-medium text-[#3A382F]">
            Click a count node to view its pitch recommendations.
          </span>
        </div>

        {/* Count Tree Grid */}
        <div className="relative bg-[#FBFAF6] border border-[#ECE7DC] rounded-lg p-6" style={{ minHeight: '700px' }}>
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
                        stroke="#DCD5C6"
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
                        stroke="#DCD5C6"
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
                
                const isSelected = selectedCount === count;
                return (
                  <g
                    key={count}
                    className="cursor-pointer focus:outline-none"
                    style={{ outline: 'none' }}
                    onClick={() => setSelectedCount(isSelected ? null : count)}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r="0.4"
                      fill={color}
                      stroke={isSelected ? '#1A1915' : '#fff'}
                      strokeWidth={isSelected ? '0.08' : '0.05'}
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
                );
              })}
            </svg>
          </div>
        </div>

        {/* Raw Data Table */}
        {selectedCount && (
          <Card className="bg-white border-[#E7E2D6] rounded-[14px] shadow-[0_2px_10px_rgba(40,38,30,0.04)]">
            <CardHeader>
              <CardTitle className="text-[#1A1915]">
                Raw Data for Count: {selectedCount}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[#57544B]">Pitch Type</TableHead>
                    <TableHead className="text-[#57544B]">PER</TableHead>
                    <TableHead className="text-[#57544B]">Pitches</TableHead>
                    {selectedMetrics.map(metric => (
                      <TableHead key={metric} className="text-[#57544B]">
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
                        <TableCell className="text-[#1A1915] font-medium">
                          {rec.pitch_type}
                        </TableCell>
                        <TableCell className="text-[#5E89A0] font-semibold">
                          {rec.score.toFixed(1)} ({getScoreLabel(rec.score)})
                        </TableCell>
                        <TableCell className="text-[#57544B]">
                          {rec.pitches}
                        </TableCell>
                        {selectedMetrics.map(metric => (
                          <TableCell key={metric} className="text-[#57544B]">
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
        <div className="flex justify-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#5F8C6B]" />
            <span className="text-[#57544B]">Strongly Recommend (80-100)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#5E89A0]" />
            <span className="text-[#57544B]">Recommended (60-79)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#C0954F]" />
            <span className="text-[#57544B]">Consider (40-59)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#B2604A]" />
            <span className="text-[#57544B]">Avoid (0-39)</span>
          </div>
        </div>
      </div>
  );
};

export default CountTreeVisualization;
