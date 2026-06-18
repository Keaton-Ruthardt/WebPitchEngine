
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Users } from "lucide-react";

interface LeagueSelectionProps {
  league: string;
  onLeagueChange: (value: string) => void;
}

const LeagueSelection = ({ league, onLeagueChange }: LeagueSelectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-[#F3ECE5] text-[#C26F4F] rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">1</div>
        <h3 className="text-lg font-semibold text-[#1A1915]">League Selection</h3>
        <Users className="h-4 w-4 text-[#C26F4F]" />
      </div>
      
      <div className="ml-10">
        <Label className="text-[#57544B] mb-2 block">League</Label>
        <Select value={league} onValueChange={onLeagueChange}>
          <SelectTrigger className="bg-[#FBFAF6] border-[#E0DACE] text-[#1A1915]">
            <SelectValue placeholder="Select League" />
          </SelectTrigger>
          <SelectContent className="bg-white border-[#E7E2D6]">
            <SelectItem value="mlb">🏆 Major League (MLB)</SelectItem>
            <SelectItem value="milb">⚾ Minor League (MiLB)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LeagueSelection;
