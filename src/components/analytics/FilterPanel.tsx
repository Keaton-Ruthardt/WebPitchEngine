
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { BarChart3, Users, Clock, Target } from "lucide-react";

interface FilterPanelProps {
  filters: any;
  setFilters: (filters: any) => void;
  onGenerateReport: () => void;
  isGenerating: boolean;
}

const FilterPanel = ({ filters, setFilters, onGenerateReport, isGenerating }: FilterPanelProps) => {
  const updateFilter = (step: string, field: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [step]: {
        ...prev[step],
        [field]: value
      }
    }));
  };

  const toggleArrayValue = (step: string, field: string, value: string) => {
    setFilters(prev => {
      const currentArray = prev[step][field] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        [step]: {
          ...prev[step],
          [field]: newArray
        }
      };
    });
  };

  const years = ["2024", "2023", "2022", "2021", "2020"];
  const innings = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10+"];

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Filter Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        
        {/* STEP 1: League & Pitcher Selection */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">1</div>
            <h3 className="text-lg font-semibold text-white">League & Pitcher Selection</h3>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          
          <div className="space-y-3 ml-10">
            <div>
              <Label className="text-slate-300 mb-2 block">League</Label>
              <Select 
                value={filters.step1.league} 
                onValueChange={(value) => updateFilter("step1", "league", value)}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select League" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="mlb">MLB</SelectItem>
                  <SelectItem value="aaa">Triple-A</SelectItem>
                  <SelectItem value="aa">Double-A</SelectItem>
                  <SelectItem value="high-a">High-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">Pitcher</Label>
              <Select 
                value={filters.step1.pitcher} 
                onValueChange={(value) => updateFilter("step1", "pitcher", value)}
                disabled={!filters.step1.league}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select Pitcher" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="gerrit-cole">Gerrit Cole</SelectItem>
                  <SelectItem value="jacob-degrom">Jacob deGrom</SelectItem>
                  <SelectItem value="shane-bieber">Shane Bieber</SelectItem>
                  <SelectItem value="spencer-strider">Spencer Strider</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* STEP 2: Batter & Time Period */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">2</div>
            <h3 className="text-lg font-semibold text-white">Batter & Time Period</h3>
            <Target className="h-4 w-4 text-emerald-400" />
          </div>
          
          <div className="space-y-3 ml-10">
            <div>
              <Label className="text-slate-300 mb-2 block">Batter</Label>
              <Select 
                value={filters.step2.batter} 
                onValueChange={(value) => updateFilter("step2", "batter", value)}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select Batter" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="ronald-acuna">Ronald Acuña Jr.</SelectItem>
                  <SelectItem value="mookie-betts">Mookie Betts</SelectItem>
                  <SelectItem value="aaron-judge">Aaron Judge</SelectItem>
                  <SelectItem value="freddie-freeman">Freddie Freeman</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-slate-300 mb-3 block">Years (Select Multiple)</Label>
              <div className="grid grid-cols-2 gap-2">
                {years.map((year) => (
                  <div key={year} className="flex items-center space-x-2">
                    <Checkbox
                      id={`year-${year}`}
                      checked={filters.step2.years.includes(year)}
                      onCheckedChange={() => toggleArrayValue("step2", "years", year)}
                      className="border-slate-500 data-[state=checked]:bg-emerald-600"
                    />
                    <Label htmlFor={`year-${year}`} className="text-slate-300">{year}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: Count Situation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">3</div>
            <h3 className="text-lg font-semibold text-white">Count Situation</h3>
            <Clock className="h-4 w-4 text-purple-400" />
          </div>
          
          <div className="space-y-4 ml-10">
            <div>
              <Label className="text-slate-300 mb-3 block">Innings (Select Multiple)</Label>
              <div className="grid grid-cols-3 gap-2">
                {innings.map((inning) => (
                  <div key={inning} className="flex items-center space-x-2">
                    <Checkbox
                      id={`inning-${inning}`}
                      checked={filters.step3.innings.includes(inning)}
                      onCheckedChange={() => toggleArrayValue("step3", "innings", inning)}
                      className="border-slate-500 data-[state=checked]:bg-purple-600"
                    />
                    <Label htmlFor={`inning-${inning}`} className="text-slate-300 text-sm">{inning}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block">Balls</Label>
                <RadioGroup 
                  value={filters.step3.balls} 
                  onValueChange={(value) => updateFilter("step3", "balls", value)}
                  className="space-y-1"
                >
                  {["0", "1", "2", "3"].map((count) => (
                    <div key={count} className="flex items-center space-x-2">
                      <RadioGroupItem value={count} id={`balls-${count}`} className="border-slate-500" />
                      <Label htmlFor={`balls-${count}`} className="text-slate-300 text-sm">{count}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-slate-300 mb-2 block">Strikes</Label>
                <RadioGroup 
                  value={filters.step3.strikes} 
                  onValueChange={(value) => updateFilter("step3", "strikes", value)}
                  className="space-y-1"
                >
                  {["0", "1", "2"].map((count) => (
                    <div key={count} className="flex items-center space-x-2">
                      <RadioGroupItem value={count} id={`strikes-${count}`} className="border-slate-500" />
                      <Label htmlFor={`strikes-${count}`} className="text-slate-300 text-sm">{count}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <div>
                <Label className="text-slate-300 mb-2 block">Outs</Label>
                <RadioGroup 
                  value={filters.step3.outs} 
                  onValueChange={(value) => updateFilter("step3", "outs", value)}
                  className="space-y-1"
                >
                  {["0", "1", "2"].map((count) => (
                    <div key={count} className="flex items-center space-x-2">
                      <RadioGroupItem value={count} id={`outs-${count}`} className="border-slate-500" />
                      <Label htmlFor={`outs-${count}`} className="text-slate-300 text-sm">{count}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 4: Game Situation */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">4</div>
            <h3 className="text-lg font-semibold text-white">Game Situation</h3>
            <Target className="h-4 w-4 text-orange-400" />
          </div>
          
          <div className="space-y-4 ml-10">
            <div>
              <Label className="text-slate-300 mb-3 block">Runners on Base</Label>
              <div className="grid grid-cols-2 gap-2">
                {["1st", "2nd", "3rd", "Bases Empty"].map((base) => (
                  <div key={base} className="flex items-center space-x-2">
                    <Checkbox
                      id={`runner-${base}`}
                      checked={filters.step4.runners.includes(base)}
                      onCheckedChange={() => toggleArrayValue("step4", "runners", base)}
                      className="border-slate-500 data-[state=checked]:bg-orange-600"
                    />
                    <Label htmlFor={`runner-${base}`} className="text-slate-300 text-sm">{base}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">Score Differential</Label>
              <RadioGroup 
                value={filters.step4.scoreDiff} 
                onValueChange={(value) => updateFilter("step4", "scoreDiff", value)}
                className="space-y-2"
              >
                {[
                  { value: "down-big", label: "Down by 4+" },
                  { value: "down-close", label: "Down by 1-3" },
                  { value: "tied", label: "Tied" },
                  { value: "up-close", label: "Up by 1-3" },
                  { value: "up-big", label: "Up by 4+" }
                ].map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={option.value} id={`score-${option.value}`} className="border-slate-500" />
                    <Label htmlFor={`score-${option.value}`} className="text-slate-300 text-sm">{option.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        {/* Generate Report Button */}
        <div className="pt-6 border-t border-slate-600">
          <Button 
            onClick={onGenerateReport}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white py-3 text-lg font-semibold"
          >
            {isGenerating ? "Generating Report..." : "Generate Report"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
