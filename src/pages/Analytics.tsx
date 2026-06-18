
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FilterPanel from "@/components/analytics/FilterPanel";
import VisualizationPanel from "@/components/analytics/VisualizationPanel";
import { useToast } from "@/hooks/use-toast";
import { apiService, AnalysisRequest, AnalysisResponse } from "@/services/api";

const Analytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    leagueSelection: {
      league: "mlb"
    },
    yearSelection: {
      years: [new Date().getFullYear() - 1].map(String)
    },
    pitcherSelection: {
      pitcher: ""
    },
    opponentSelection: {
      type: "average" as 'specific' | 'average',
      batterName: "",
      handedness: "R",
      hotZoneMetric: "woba"
    },
    metricsSelection: {
      selectedMetrics: ["whiff_rate", "hard_hit_rate", "called_strike_rate", "weak_contact_rate", "chase_rate"],
      minPitches: 10
    }
  });

  const [reportData, setReportData] = useState<AnalysisResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{
    connected: boolean;
    pybaseball_available: boolean;
  }>({ connected: false, pybaseball_available: false });

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      toast({
        title: "Access Denied",
        description: "Please log in to access the analytics platform",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // Check backend health
    checkBackendHealth();
  }, [navigate, toast]);

  const checkBackendHealth = async () => {
    try {
      const health = await apiService.healthCheck();
      setBackendStatus({
        connected: true,
        pybaseball_available: health.pybaseball_available
      });
      
      if (!health.pybaseball_available) {
        toast({
          title: "Warning",
          description: "pybaseball not available. MLB data may not be accessible.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setBackendStatus({ connected: false, pybaseball_available: false });
      toast({
        title: "Backend Connection Failed",
        description: "Unable to connect to the analysis server. Please ensure the backend is running.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = async () => {
    // Validation
    if (!filters.pitcherSelection.pitcher) {
      toast({
        title: "Missing Selection",
        description: "Please select a pitcher to generate the report",
        variant: "destructive",
      });
      return;
    }

    if (filters.yearSelection.years.length === 0) {
      toast({
        title: "Missing Selection", 
        description: "Please select at least one year",
        variant: "destructive",
      });
      return;
    }

    if (filters.opponentSelection.type === "specific" && !filters.opponentSelection.batterName) {
      toast({
        title: "Missing Selection",
        description: "Please enter a batter's name",
        variant: "destructive",
      });
      return;
    }

    if (!backendStatus.connected) {
      toast({
        title: "Backend Not Connected",
        description: "Please ensure the analysis server is running",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const request: AnalysisRequest = {
        pitcher_id: parseInt(filters.pitcherSelection.pitcher),
        years: filters.yearSelection.years,
        opponent_type: filters.opponentSelection.type,
        batter_name: filters.opponentSelection.type === 'specific' ? filters.opponentSelection.batterName : undefined,
        handedness: filters.opponentSelection.type === 'average' ? filters.opponentSelection.handedness : undefined,
        min_pitches: filters.metricsSelection.minPitches
      };

      const response = await apiService.analyzePitcher(request);
      
      // Transform the response to match the expected format
      const transformedData = {
        pitchRecommendations: response.recommendations,
        analysisMetadata: {
          pitcher: response.pitcher_name,
          opponent: response.opponent_name,
          years: response.years.join(", "),
          league: response.league.toUpperCase(),
          totalPitches: response.total_pitches
        }
      };
      
      setReportData(transformedData);
      
      toast({
        title: "Analysis Complete",
        description: `Generated count tree analysis for ${response.total_pitches} pitches`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4EE]">
      <Navbar />

      <div className="pt-11 px-7 pb-16">
        <div className="max-w-[1280px] mx-auto">
          <div className="mb-8">
            <h1 className="font-display text-[38px] font-medium tracking-[-0.015em] text-[#1A1915] mb-2">Pitch Recommendation Engine</h1>
            <p className="text-[#6E6B61] text-[17px]">Data-driven pitch recommendations and performance analytics.</p>

            {/* Backend Status Indicator */}
            <div className="mt-4 flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div
                  className={`w-[9px] h-[9px] rounded-full ${
                    backendStatus.connected ? 'bg-[#6F9A78]' : 'bg-[#B2604A]'
                  }`}
                />
                <span className="text-[13px] text-[#6E6B61]">
                  Backend: {backendStatus.connected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {backendStatus.connected && (
                <div className="flex items-center gap-2">
                  <div
                    className={`w-[9px] h-[9px] rounded-full ${
                      backendStatus.pybaseball_available ? 'bg-[#6F9A78]' : 'bg-[#C0954F]'
                    }`}
                  />
                  <span className="text-[13px] text-[#6E6B61]">
                    MLB Data: {backendStatus.pybaseball_available ? 'Available' : 'Limited'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onGenerateReport={handleGenerateReport}
                isGenerating={isGenerating}
              />
            </div>
            
            <div className="lg:col-span-3">
              <VisualizationPanel
                reportData={reportData}
                isGenerating={isGenerating}
                filters={filters}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
