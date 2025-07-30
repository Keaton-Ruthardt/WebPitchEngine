
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity } from "lucide-react";

interface OpponentSelectionProps {
  opponentType: string;
  batterName: string;
  handedness: string;
  hotZoneMetric: string;
  onOpponentTypeChange: (value: string) => void;
  onBatterNameChange: (value: string) => void;
  onHandednessChange: (value: string) => void;
  onHotZoneMetricChange: (value: string) => void;
}

const OpponentSelection = ({
  opponentType,
  batterName,
  handedness,
  hotZoneMetric,
  onOpponentTypeChange,
  onBatterNameChange,
  onHandednessChange,
  onHotZoneMetricChange
}: OpponentSelectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
        <h3 className="text-lg font-semibold text-white">Opponent Selection</h3>
        <Activity className="h-4 w-4 text-orange-400" />
      </div>
      
      <div className="ml-10 space-y-4">
        <div>
          <Label className="text-slate-300 mb-3 block">Opponent Type</Label>
          <RadioGroup value={opponentType} onValueChange={onOpponentTypeChange} className="space-y-2">
            <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
              <RadioGroupItem value="specific" id="specific" className="border-slate-500" disabled />
              <Label htmlFor="specific" className="text-slate-300">Specific Batter <span className="text-sm text-slate-400">(Coming Soon)</span></Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="average" id="average" className="border-slate-500" />
              <Label htmlFor="average" className="text-slate-300">Hitter Handedness</Label>
            </div>
          </RadioGroup>
        </div>

        {opponentType === "specific" && (
          <div className="space-y-3">
            <div>
              <Label className="text-slate-300 mb-2 block">Batter Name</Label>
              <Input
                value={batterName}
                onChange={(e) => onBatterNameChange(e.target.value)}
                placeholder="e.g., Aaron Judge"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div>
              <Label className="text-slate-300 mb-2 block">Hot Zone Metric</Label>
              <Select value={hotZoneMetric} onValueChange={onHotZoneMetricChange}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="woba">wOBA</SelectItem>
                  <SelectItem value="slugging">Slugging %</SelectItem>
                  <SelectItem value="whiff_rate">Whiff %</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {opponentType === "average" && (
          <div>
            <Label className="text-slate-300 mb-2 block">Handedness</Label>
            <RadioGroup value={handedness} onValueChange={onHandednessChange} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="L" id="left" className="border-slate-500" />
                <Label htmlFor="left" className="text-slate-300">vs. Left-Handed Hitter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="R" id="right" className="border-slate-500" />
                <Label htmlFor="right" className="text-slate-300">vs. Right-Handed Hitter</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpponentSelection;
