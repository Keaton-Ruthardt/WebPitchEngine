
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import LeagueSelection from "./filters/LeagueSelection";
import YearSelection from "./filters/YearSelection";
import PitcherSelection from "./filters/PitcherSelection";
import OpponentSelection from "./filters/OpponentSelection";
import MetricsSelection from "./filters/MetricsSelection";
import MiLBUpload from "./MiLBUpload";
import { apiService } from "@/services/api";

interface FilterPanelProps {
  filters: any;
  setFilters: (filters: any) => void;
  onGenerateReport: () => void;
  isGenerating: boolean;
}

const FilterPanel = ({ filters, setFilters, onGenerateReport, isGenerating }: FilterPanelProps) => {
  const [pitcherOptions, setPitcherOptions] = useState<any[]>([]);
  const [selectedPitcherName, setSelectedPitcherName] = useState<string>("");

  const updateFilter = (section: string, field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const toggleYear = (year: string) => {
    const currentYears = filters.yearSelection.years;
    if (currentYears.includes(year)) {
      updateFilter("yearSelection", "years", currentYears.filter(y => y !== year));
    } else if (currentYears.length < 2) {
      updateFilter("yearSelection", "years", [...currentYears, year]);
    }
  };

  const toggleMetric = (metric: string) => {
    const currentMetrics = filters.metricsSelection.selectedMetrics;
    if (currentMetrics.includes(metric)) {
      updateFilter("metricsSelection", "selectedMetrics", currentMetrics.filter(m => m !== metric));
    } else {
      updateFilter("metricsSelection", "selectedMetrics", [...currentMetrics, metric]);
    }
  };

  // Load pitcher options when league changes
  useEffect(() => {
    const loadPitchers = async () => {
      try {
        const options = await apiService.getPitchers(filters.leagueSelection.league);
        setPitcherOptions(options);
      } catch (error) {
        console.error('Failed to load pitchers:', error);
        setPitcherOptions([]);
      }
    };

    if (filters.leagueSelection.league) {
      loadPitchers();
    }
  }, [filters.leagueSelection.league]);

  // Update pitcher name when pitcher selection changes
  useEffect(() => {
    if (filters.pitcherSelection.pitcher) {
      const selectedPitcher = pitcherOptions.find(p => p.value.toString() === filters.pitcherSelection.pitcher);
      setSelectedPitcherName(selectedPitcher?.label || "");
    } else {
      setSelectedPitcherName("");
    }
  }, [filters.pitcherSelection.pitcher, pitcherOptions]);

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Pitch Recommendation Engine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          <LeagueSelection
            league={filters.leagueSelection.league}
            onLeagueChange={(value) => updateFilter("leagueSelection", "league", value)}
          />

          <YearSelection
            selectedYears={filters.yearSelection.years}
            onYearToggle={toggleYear}
          />

          <PitcherSelection
            league={filters.leagueSelection.league}
            pitcher={filters.pitcherSelection.pitcher}
            onPitcherChange={(value) => updateFilter("pitcherSelection", "pitcher", value)}
            pitcherOptions={pitcherOptions}
          />

          <OpponentSelection
            opponentType={filters.opponentSelection.type}
            batterName={filters.opponentSelection.batterName}
            handedness={filters.opponentSelection.handedness}
            hotZoneMetric={filters.opponentSelection.hotZoneMetric}
            onOpponentTypeChange={(value) => updateFilter("opponentSelection", "type", value)}
            onBatterNameChange={(value) => updateFilter("opponentSelection", "batterName", value)}
            onHandednessChange={(value) => updateFilter("opponentSelection", "handedness", value)}
            onHotZoneMetricChange={(value) => updateFilter("opponentSelection", "hotZoneMetric", value)}
          />

          <MetricsSelection
            selectedMetrics={filters.metricsSelection.selectedMetrics}
            minPitches={filters.metricsSelection.minPitches}
            onMetricToggle={toggleMetric}
            onMinPitchesChange={(value) => updateFilter("metricsSelection", "minPitches", value)}
          />

          <div className="pt-6 border-t border-slate-600">
            <Button 
              onClick={onGenerateReport}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white py-3 text-lg font-semibold"
            >
              {isGenerating ? "Generating Report..." : "Generate Pitch Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MiLB Upload Section - Only show for MiLB pitchers */}
      {filters.leagueSelection.league === 'milb' && filters.pitcherSelection.pitcher && selectedPitcherName && (
        <MiLBUpload
          pitcherId={filters.pitcherSelection.pitcher}
          pitcherName={selectedPitcherName}
        />
      )}
    </div>
  );
};

export default FilterPanel;
