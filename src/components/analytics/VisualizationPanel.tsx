
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
      <Card className="bg-white border-[#E7E2D6] rounded-[14px] shadow-[0_2px_10px_rgba(40,38,30,0.04)] h-[700px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#C26F4F] mx-auto mb-4"></div>
            <p className="text-[#57544B] text-lg">Analyzing pitch data...</p>
            <p className="text-[#6E6B61] text-sm mt-2">Processing Statcast data and generating count tree analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reportData) {
    return (
      <Card className="bg-white border-[#E7E2D6] rounded-[14px] shadow-[0_2px_10px_rgba(40,38,30,0.04)] h-[700px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="bg-[#F3ECE5] w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-12 w-12 text-[#6E6B61]" />
            </div>
            <h3 className="text-xl font-semibold text-[#1A1915] mb-2">Ready to Generate Count Tree Analysis</h3>
            <p className="text-[#6E6B61]">Configure your filters and click "Generate Pitch Report" to view count-specific recommendations</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-[#E7E2D6] rounded-[14px] shadow-[0_2px_10px_rgba(40,38,30,0.04)]">
      <CardHeader>
        <CardTitle className="text-[#1A1915] flex items-center gap-2">
          <Award className="h-5 w-5 text-[#C26F4F]" />
          Count Tree Analysis
        </CardTitle>
        {reportData.analysisMetadata && (
          <div className="text-[#57544B] text-sm space-y-1">
            <p>Pitcher: <span className="text-[#1A1915] font-medium">{reportData.analysisMetadata.pitcher}</span></p>
            <p>vs. <span className="text-[#1A1915] font-medium">{reportData.analysisMetadata.opponent}</span></p>
            <p>Years: {reportData.analysisMetadata.years} | League: {reportData.analysisMetadata.league}</p>
            <p>Total Pitches: <span className="text-[#1A1915] font-medium">{reportData.analysisMetadata.totalPitches}</span></p>
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
