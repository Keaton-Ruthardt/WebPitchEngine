
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Target } from "lucide-react";

interface PitcherOption {
  label: string;
  value: number;
}

interface PitcherSelectionProps {
  league: string;
  pitcher: string;
  onPitcherChange: (value: string) => void;
  pitcherOptions?: PitcherOption[];
}

const PitcherSelection = ({ league, pitcher, onPitcherChange, pitcherOptions = [] }: PitcherSelectionProps) => {
  // Fallback data if API is not available
  const fallbackPitchers = {
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

  // Use API data if available, otherwise use fallback
  const pitchers = pitcherOptions.length > 0 
    ? pitcherOptions.map(p => ({ name: p.label, id: p.value.toString() }))
    : fallbackPitchers[league as keyof typeof fallbackPitchers] || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-[#F3ECE5] text-[#C26F4F] rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">3</div>
        <h3 className="text-lg font-semibold text-[#1A1915]">Pitcher Selection</h3>
        <Target className="h-4 w-4 text-[#C26F4F]" />
      </div>
      
      <div className="ml-10">
        <Label className="text-[#57544B] mb-2 block">Pitcher</Label>
        <Select value={pitcher} onValueChange={onPitcherChange} disabled={!league}>
          <SelectTrigger className="bg-[#FBFAF6] border-[#E0DACE] text-[#1A1915]">
            <SelectValue placeholder={league ? "Select Pitcher" : "Select league first"} />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E7E2D6]">
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
