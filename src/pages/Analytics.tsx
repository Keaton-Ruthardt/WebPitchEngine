
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
    step1: {
      league: "",
      pitcher: ""
    },
    step2: {
      batter: "",
      years: []
    },
    step3: {
      innings: [],
      balls: "",
      strikes: "",
      outs: ""
    },
    step4: {
      runners: [],
      scoreDiff: ""
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
    setIsGenerating(true);
    
    // Simulate API call to backend
    setTimeout(() => {
      // Mock data for demonstration
      const mockData = {
        pitchRecommendations: [
          { pitch: "4-Seam Fastball", probability: 0.35, count: 145 },
          { pitch: "Slider", probability: 0.28, count: 112 },
          { pitch: "Changeup", probability: 0.22, count: 89 },
          { pitch: "Curveball", probability: 0.15, count: 61 }
        ],
        batterHotZone: {
          zones: [
            { zone: 1, avg: 0.325, ops: 0.892 },
            { zone: 2, avg: 0.298, ops: 0.814 },
            { zone: 3, avg: 0.276, ops: 0.743 },
            { zone: 4, avg: 0.301, ops: 0.831 },
            { zone: 5, avg: 0.289, ops: 0.798 },
            { zone: 6, avg: 0.267, ops: 0.721 },
            { zone: 7, avg: 0.312, ops: 0.856 },
            { zone: 8, avg: 0.294, ops: 0.809 },
            { zone: 9, avg: 0.271, ops: 0.738 }
          ]
        }
      };
      
      setReportData(mockData);
      setIsGenerating(false);
      
      toast({
        title: "Report Generated",
        description: "Analytics data has been processed successfully",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Analytics Hub</h1>
            <p className="text-slate-300 text-lg">Pitch Recommendation Engine & Performance Analytics</p>
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
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
