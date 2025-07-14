
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FilterPanel from "@/components/analytics/FilterPanel";
import VisualizationPanel from "@/components/analytics/VisualizationPanel";
import { useToast } from "@/hooks/use-toast";

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
      type: "average",
      batterName: "",
      handedness: "R",
      hotZoneMetric: "woba"
    },
    metricsSelection: {
      selectedMetrics: ["whiff_rate", "hard_hit_rate"],
      minPitches: 10
    }
  });

  const [reportData, setReportData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

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
    }
  }, [navigate, toast]);

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

    setIsGenerating(true);
    
    // Simulate API call to your Flask backend
    setTimeout(() => {
      // Enhanced mock data based on your Python backend structure
      const mockData = {
        pitchRecommendations: [
          { 
            pitch: "4-Seam Fastball", 
            probability: 0.42, 
            count: 187,
            whiff_rate: 0.234,
            hard_hit_rate: 0.156,
            called_strike_rate: 0.089,
            score: 8.2
          },
          { 
            pitch: "Slider", 
            probability: 0.31, 
            count: 134,
            whiff_rate: 0.389,
            hard_hit_rate: 0.098,
            called_strike_rate: 0.045,
            score: 7.8
          },
          { 
            pitch: "Changeup", 
            probability: 0.18, 
            count: 78,
            whiff_rate: 0.312,
            hard_hit_rate: 0.123,
            called_strike_rate: 0.067,
            score: 6.9
          },
          { 
            pitch: "Curveball", 
            probability: 0.09, 
            count: 39,
            whiff_rate: 0.441,
            hard_hit_rate: 0.087,
            called_strike_rate: 0.078,
            score: 6.1
          }
        ],
        batterHotZone: filters.opponentSelection.type === "specific" ? {
          zones: [
            { zone: 1, avg: 0.325, ops: 0.892, woba: 0.398 },
            { zone: 2, avg: 0.298, ops: 0.814, woba: 0.356 },
            { zone: 3, avg: 0.276, ops: 0.743, woba: 0.298 },
            { zone: 4, avg: 0.301, ops: 0.831, woba: 0.367 },
            { zone: 5, avg: 0.289, ops: 0.798, woba: 0.341 },
            { zone: 6, avg: 0.267, ops: 0.721, woba: 0.287 },
            { zone: 7, avg: 0.312, ops: 0.856, woba: 0.378 },
            { zone: 8, avg: 0.294, ops: 0.809, woba: 0.349 },
            { zone: 9, avg: 0.271, ops: 0.738, woba: 0.291 }
          ]
        } : null,
        analysisMetadata: {
          pitcher: filters.pitcherSelection.pitcher,
          opponent: filters.opponentSelection.type === "specific" 
            ? filters.opponentSelection.batterName 
            : `${filters.opponentSelection.handedness}HH Batter`,
          years: filters.yearSelection.years.join(", "),
          league: filters.leagueSelection.league.toUpperCase(),
          totalPitches: 612
        }
      };
      
      setReportData(mockData);
      setIsGenerating(false);
      
      toast({
        title: "Analysis Complete",
        description: `Generated pitch recommendations for ${mockData.analysisMetadata.totalPitches} pitches`,
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Pitch Recommendation Engine</h1>
            <p className="text-slate-300 text-lg">Data-driven pitch recommendations and performance analytics</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Filter Panel */}
            <div className="lg:col-span-1">
              <FilterPanel 
                filters={filters}
                setFilters={setFilters}
                onGenerateReport={handleGenerateReport}
                isGenerating={isGenerating}
              />
            </div>
            
            {/* Visualization Panel */}
            <div className="lg:col-span-2">
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
