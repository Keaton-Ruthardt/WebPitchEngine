
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { BarChart3 } from "lucide-react";

interface MetricsSelectionProps {
  selectedMetrics: string[];
  minPitches: number;
  onMetricToggle: (metric: string) => void;
  onMinPitchesChange: (value: number) => void;
}

const MetricsSelection = ({
  selectedMetrics,
  minPitches,
  onMetricToggle,
  onMinPitchesChange
}: MetricsSelectionProps) => {
  const metrics = [
    { id: "whiff_rate", label: "Whiff %" },
    { id: "hard_hit_rate", label: "Hard Hit %" },
    { id: "called_strike_rate", label: "Called Strike %" },
    { id: "weak_contact_rate", label: "Weak Contact %" },
    { id: "chase_rate", label: "Chase %" }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">5</div>
        <h3 className="text-lg font-semibold text-white">Display Settings</h3>
        <BarChart3 className="h-4 w-4 text-indigo-400" />
      </div>
      
      <div className="ml-10 space-y-4">
        <div>
          <Label className="text-slate-300 mb-3 block">Metrics to Display in Hover</Label>
          <div className="grid grid-cols-1 gap-2">
            {metrics.map((metric) => (
              <div key={metric.id} className="flex items-center space-x-2">
                <Checkbox
                  id={metric.id}
                  checked={selectedMetrics.includes(metric.id)}
                  onCheckedChange={() => onMetricToggle(metric.id)}
                  className="border-slate-500 data-[state=checked]:bg-indigo-600"
                />
                <Label htmlFor={metric.id} className="text-slate-300 text-sm">{metric.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-slate-300 mb-2 block">Minimum Pitches per Count</Label>
          <Input
            type="number"
            value={minPitches}
            onChange={(e) => onMinPitchesChange(parseInt(e.target.value) || 10)}
            min={1}
            className="bg-slate-700/50 border-slate-600 text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default MetricsSelection;
