
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Target, Activity } from "lucide-react";

interface VisualizationPanelProps {
  reportData: any;
  isGenerating: boolean;
}

const VisualizationPanel = ({ reportData, isGenerating }: VisualizationPanelProps) => {
  if (isGenerating) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Generating analytics report...</p>
            <p className="text-slate-400 text-sm mt-2">Processing data and creating visualizations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-[600px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="bg-slate-700/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate Report</h3>
            <p className="text-slate-400">Configure your filters and click "Generate Report" to view analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pitchColors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pitch-recommendations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
            <TabsTrigger value="pitch-recommendations" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Pitch Recommendations
            </TabsTrigger>
            <TabsTrigger value="batter-zones" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
              Batter Hot Zones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pitch-recommendations" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Pitch Recommendation Tree</h3>
            </div>
            
            <div className="bg-slate-700/30 rounded-lg p-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={reportData.pitchRecommendations} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis 
                    dataKey="pitch" 
                    stroke="#CBD5E1"
                    tick={{ fill: '#CBD5E1' }}
                  />
                  <YAxis 
                    stroke="#CBD5E1"
                    tick={{ fill: '#CBD5E1' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#334155', 
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#F1F5F9'
                    }}
                    formatter={(value, name) => [
                      name === 'probability' ? `${(value * 100).toFixed(1)}%` : value,
                      name === 'probability' ? 'Recommendation' : 'Count'
                    ]}
                  />
                  <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
                    {reportData.pitchRecommendations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pitchColors[index % pitchColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {reportData.pitchRecommendations.map((pitch, index) => (
                <div key={pitch.pitch} className="bg-slate-700/30 rounded-lg p-4 text-center">
                  <div 
                    className="w-4 h-4 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: pitchColors[index % pitchColors.length] }}
                  ></div>
                  <p className="text-slate-300 text-sm font-medium">{pitch.pitch}</p>
                  <p className="text-white text-lg font-bold">{(pitch.probability * 100).toFixed(1)}%</p>
                  <p className="text-slate-400 text-xs">{pitch.count} pitches</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="batter-zones" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-semibold text-white">Batter Hot Zone Analysis</h3>
            </div>
            
            <div className="bg-slate-700/30 rounded-lg p-6">
              {/* Strike Zone Grid */}
              <div className="max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-4 rounded-lg border-2 border-slate-600">
                  {reportData.batterHotZone.zones.map((zone, index) => {
                    const heatIntensity = zone.ops > 0.850 ? 'hot' : zone.ops > 0.750 ? 'warm' : 'cool';
                    const bgColor = heatIntensity === 'hot' ? 'bg-red-600' : 
                                   heatIntensity === 'warm' ? 'bg-yellow-600' : 'bg-blue-600';
                    
                    return (
                      <div 
                        key={zone.zone}
                        className={`${bgColor} aspect-square rounded-lg flex flex-col items-center justify-center text-white text-sm font-bold p-2`}
                      >
                        <div className="text-xs opacity-75">Zone {zone.zone}</div>
                        <div>{zone.avg.toFixed(3)}</div>
                        <div className="text-xs">{zone.ops.toFixed(3)} OPS</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-4 flex justify-center space-x-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span className="text-slate-300">Hot Zone (OPS > .850)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                    <span className="text-slate-300">Warm (.750 - .850)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-slate-300">Cool (< .750)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <h4 className="text-emerald-400 font-semibold mb-2">Hot Zones</h4>
                <p className="text-white text-2xl font-bold">
                  {reportData.batterHotZone.zones.filter(z => z.ops > 0.850).length}
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <h4 className="text-yellow-400 font-semibold mb-2">Warm Zones</h4>
                <p className="text-white text-2xl font-bold">
                  {reportData.batterHotZone.zones.filter(z => z.ops > 0.750 && z.ops <= 0.850).length}
                </p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <h4 className="text-blue-400 font-semibold mb-2">Cool Zones</h4>
                <p className="text-white text-2xl font-bold">
                  {reportData.batterHotZone.zones.filter(z => z.ops <= 0.750).length}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VisualizationPanel;
