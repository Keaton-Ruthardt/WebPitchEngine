
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
        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
        <h3 className="text-lg font-semibold text-white">League Selection</h3>
        <Users className="h-4 w-4 text-blue-400" />
      </div>
      
      <div className="ml-10">
        <Label className="text-slate-300 mb-2 block">League</Label>
        <Select value={league} onValueChange={onLeagueChange}>
          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
            <SelectValue placeholder="Select League" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            <SelectItem value="mlb">🏆 Major League (MLB)</SelectItem>
            <SelectItem value="milb">⚾ Minor League (MiLB)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default LeagueSelection;
