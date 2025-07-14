
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import CountTreeVisualization from "./CountTreeVisualization";

interface VisualizationPanelProps {
  reportData: any;
  isGenerating: boolean;
  filters: any;
}

const VisualizationPanel = ({ reportData, isGenerating, filters }: VisualizationPanelProps) => {
  if (isGenerating) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-[700px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300 text-lg">Analyzing pitch data...</p>
            <p className="text-slate-400 text-sm mt-2">Processing Statcast data and generating count tree analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm h-[700px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="bg-slate-700/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Ready to Generate Count Tree Analysis</h3>
            <p className="text-slate-400">Configure your filters and click "Generate Pitch Report" to view count-specific recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="h-5 w-5 text-purple-400" />
          Count Tree Analysis
        </CardTitle>
        {reportData.analysisMetadata && (
          <div className="text-slate-300 text-sm space-y-1">
            <p>Pitcher: <span className="text-white font-medium">{reportData.analysisMetadata.pitcher}</span></p>
            <p>vs. <span className="text-white font-medium">{reportData.analysisMetadata.opponent}</span></p>
            <p>Years: {reportData.analysisMetadata.years} | League: {reportData.analysisMetadata.league}</p>
            <p>Total Pitches: <span className="text-white font-medium">{reportData.analysisMetadata.totalPitches}</span></p>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <CountTreeVisualization 
          reportData={reportData}
          selectedMetrics={filters.metricsSelection.selectedMetrics}
        />
      </CardContent>
    </Card>
  );
};

export default VisualizationPanel;
