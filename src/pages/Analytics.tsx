
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FilterPanel from "@/components/analytics/FilterPanel";
import VisualizationPanel from "@/components/analytics/VisualizationPanel";
import { useToast } from "@/hooks/use-toast";

// Count weights based on your Python backend logic
const COUNT_WEIGHTS = {
  '0-0': { is_hard_hit: 0.745, is_called_strike: 0.101, is_weak_contact: 0.078, is_whiff: 0.067, is_chase: 0.009 },
  '0-1': { is_hard_hit: 0.877, is_called_strike: 0.053, is_chase: 0.027, is_whiff: 0.023, is_weak_contact: 0.019 },
  '0-2': { is_hard_hit: 0.529, is_whiff: 0.349, is_called_strike: 0.119, is_chase: 0.002, is_weak_contact: 0.001 },
  '1-0': { is_hard_hit: 0.693, is_weak_contact: 0.124, is_called_strike: 0.087, is_whiff: 0.083, is_chase: 0.013 },
  '1-1': { is_hard_hit: 0.858, is_called_strike: 0.049, is_weak_contact: 0.032, is_chase: 0.031, is_whiff: 0.030 },
  '1-2': { is_hard_hit: 0.511, is_whiff: 0.350, is_called_strike: 0.126, is_weak_contact: 0.011, is_chase: 0.003 },
  '2-0': { is_hard_hit: 0.418, is_weak_contact: 0.248, is_called_strike: 0.185, is_whiff: 0.120, is_chase: 0.030 },
  '2-1': { is_hard_hit: 0.655, is_weak_contact: 0.127, is_called_strike: 0.107, is_whiff: 0.082, is_chase: 0.029 },
  '2-2': { is_whiff: 0.478, is_hard_hit: 0.310, is_called_strike: 0.164, is_weak_contact: 0.043, is_chase: 0.006 },
  '3-0': { is_called_strike: 0.759, is_weak_contact: 0.146, is_whiff: 0.053, is_hard_hit: 0.033, is_chase: 0.009 },
  '3-1': { is_weak_contact: 0.433, is_called_strike: 0.249, is_whiff: 0.199, is_chase: 0.064, is_hard_hit: 0.054 },
  '3-2': { is_whiff: 0.485, is_called_strike: 0.294, is_weak_contact: 0.169, is_chase: 0.029, is_hard_hit: 0.022 }
};

const COUNT_DIFFICULTY_MODIFIER = {
  '0-0': 0.85, '0-1': 0.8, '0-2': 0.95,
  '1-0': 0.85, '1-1': 0.8, '1-2': 0.95,
  '2-0': 0.9, '2-1': 0.85, '2-2': 1.0,
  '3-0': 1.0, '3-1': 1.0, '3-2': 1.0
};

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

  const generateCountSpecificData = (basePitchRecommendations: any[]) => {
    // Simulate count-specific analysis like your Python backend
    const counts = Object.keys(COUNT_WEIGHTS);
    const countSpecificData: any = {};

    counts.forEach(count => {
      const weights = COUNT_WEIGHTS[count as keyof typeof COUNT_WEIGHTS];
      const modifier = COUNT_DIFFICULTY_MODIFIER[count as keyof typeof COUNT_DIFFICULTY_MODIFIER];
      
      // Apply count-specific scoring to each pitch type
      const countPitches = basePitchRecommendations.map(pitch => {
        // Recalculate score based on count weights
        const rawScore = (
          (pitch.whiff_rate * weights.is_whiff) +
          (pitch.chase_rate || 0.1 * weights.is_chase) +
          (pitch.weak_contact_rate || 0.1 * weights.is_weak_contact) +
          (pitch.called_strike_rate * weights.is_called_strike) -
          (pitch.hard_hit_rate * weights.is_hard_hit)
        );
        
        // Apply scaling and modifier
        const scaledScore = Math.max(1, Math.min(10, rawScore * 10)) * modifier;
        
        return {
          ...pitch,
          count: count,
          score: scaledScore,
          // Add some count-specific variation to make it realistic
          whiff_rate: Math.max(0, Math.min(1, pitch.whiff_rate + (Math.random() - 0.5) * 0.1)),
          hard_hit_rate: Math.max(0, Math.min(1, pitch.hard_hit_rate + (Math.random() - 0.5) * 0.05)),
          called_strike_rate: Math.max(0, Math.min(1, pitch.called_strike_rate + (Math.random() - 0.5) * 0.05))
        };
      });

      // Sort by score and take top 3
      countSpecificData[count] = countPitches
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
    });

    return countSpecificData;
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

    setIsGenerating(true);
    
    // Simulate API call to your Flask backend
    setTimeout(() => {
      // Enhanced mock data based on your Python backend structure
      const basePitchRecommendations = [
        { 
          pitch_type: "4-Seam Fastball", 
          probability: 0.42, 
          count: 187,
          whiff_rate: 0.234,
          hard_hit_rate: 0.156,
          called_strike_rate: 0.089,
          weak_contact_rate: 0.078,
          chase_rate: 0.045,
          score: 8.2
        },
        { 
          pitch_type: "Slider", 
          probability: 0.31, 
          count: 134,
          whiff_rate: 0.389,
          hard_hit_rate: 0.098,
          called_strike_rate: 0.045,
          weak_contact_rate: 0.067,
          chase_rate: 0.156,
          score: 7.8
        },
        { 
          pitch_type: "Changeup", 
          probability: 0.18, 
          count: 78,
          whiff_rate: 0.312,
          hard_hit_rate: 0.123,
          called_strike_rate: 0.067,
          weak_contact_rate: 0.089,
          chase_rate: 0.098,
          score: 6.9
        },
        { 
          pitch_type: "Curveball", 
          probability: 0.09, 
          count: 39,
          whiff_rate: 0.441,
          hard_hit_rate: 0.087,
          called_strike_rate: 0.078,
          weak_contact_rate: 0.056,
          chase_rate: 0.123,
          score: 6.1
        }
      ];

      // Generate count-specific data
      const countSpecificRecommendations = generateCountSpecificData(basePitchRecommendations);
      
      // Flatten for the visualization component
      const flattenedRecommendations = Object.entries(countSpecificRecommendations)
        .flatMap(([count, pitches]) => (pitches as any[]).map(pitch => ({ ...pitch, count })));

      const mockData = {
        pitchRecommendations: flattenedRecommendations,
        countSpecificData: countSpecificRecommendations,
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
        description: `Generated count tree analysis for ${mockData.analysisMetadata.totalPitches} pitches`,
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
