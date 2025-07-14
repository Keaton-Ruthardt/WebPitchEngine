
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

interface PitcherSelectionProps {
  league: string;
  pitcher: string;
  onPitcherChange: (value: string) => void;
}

const PitcherSelection = ({ league, pitcher, onPitcherChange }: PitcherSelectionProps) => {
  // Push Performance Pitchers data from your Python backend
  const pushPerformancePitchers = {
    mlb: [
      { name: "Garrett Crochet", id: "676979" },
      { name: "Logan Webb", id: "657277" },
      { name: "Bailey Falter", id: "663559" },
      { name: "Kevin Gausman", id: "592332" },
      { name: "Erick Fedde", id: "607200" },
      { name: "Luke Little", id: "681432" },
      { name: "Tylor Megill", id: "656731" }
    ],
    milb: [
      { name: "Jack O'Loughlin", id: "681026" },
      { name: "Alek Jacob", id: "676951" },
      { name: "Gabriel Hughes", id: "693331" },
      { name: "Kevin Gowdy", id: "656484" },
      { name: "Nolan Hoffman", id: "687834" }
    ]
  };

  const pitchers = pushPerformancePitchers[league as keyof typeof pushPerformancePitchers] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
        <h3 className="text-lg font-semibold text-white">Pitcher Selection</h3>
        <Target className="h-4 w-4 text-purple-400" />
      </div>
      
      <div className="ml-10">
        <Label className="text-slate-300 mb-2 block">Pitcher</Label>
        <Select value={pitcher} onValueChange={onPitcherChange} disabled={!league}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
            <SelectValue placeholder={league ? "Select Pitcher" : "Select league first"} />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            {pitchers.map((pitcher) => (
              <SelectItem key={pitcher.id} value={pitcher.id}>
                {pitcher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default PitcherSelection;
