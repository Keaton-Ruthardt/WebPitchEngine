
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
        <div className="bg-[#F3ECE5] text-[#C26F4F] rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">4</div>
        <h3 className="text-lg font-semibold text-[#1A1915]">Opponent Selection</h3>
        <Activity className="h-4 w-4 text-[#C26F4F]" />
      </div>
      
      <div className="ml-10 space-y-4">
        <div>
          <Label className="text-[#57544B] mb-3 block">Opponent Type</Label>
          <RadioGroup value={opponentType} onValueChange={onOpponentTypeChange} className="space-y-2">
            <div className="flex items-center space-x-2 opacity-50 cursor-not-allowed">
              <RadioGroupItem value="specific" id="specific" className="border-[#C26F4F]" disabled />
              <Label htmlFor="specific" className="text-[#57544B]">Specific Batter <span className="text-sm text-[#6E6B61]">(Coming Soon)</span></Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="average" id="average" className="border-[#C26F4F]" />
              <Label htmlFor="average" className="text-[#57544B]">Hitter Handedness</Label>
            </div>
          </RadioGroup>
        </div>

        {opponentType === "specific" && (
          <div className="space-y-3">
            <div>
              <Label className="text-[#57544B] mb-2 block">Batter Name</Label>
              <Input
                value={batterName}
                onChange={(e) => onBatterNameChange(e.target.value)}
                placeholder="e.g., Aaron Judge"
                className="bg-[#FBFAF6] border-[#E0DACE] text-[#1A1915]"
              />
            </div>
            <div>
              <Label className="text-[#57544B] mb-2 block">Hot Zone Metric</Label>
              <Select value={hotZoneMetric} onValueChange={onHotZoneMetricChange}>
                <SelectTrigger className="bg-[#FBFAF6] border-[#E0DACE] text-[#1A1915]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-[#E7E2D6]">
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
            <Label className="text-[#57544B] mb-2 block">Handedness</Label>
            <RadioGroup value={handedness} onValueChange={onHandednessChange} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="L" id="left" className="border-[#C26F4F]" />
                <Label htmlFor="left" className="text-[#57544B]">vs. Left-Handed Hitter</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="R" id="right" className="border-[#C26F4F]" />
                <Label htmlFor="right" className="text-[#57544B]">vs. Right-Handed Hitter</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>
    </div>
  );
};

export default OpponentSelection;
