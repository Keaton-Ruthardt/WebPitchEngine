
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface YearSelectionProps {
  selectedYears: string[];
  onYearToggle: (year: string) => void;
}

const YearSelection = ({ selectedYears, onYearToggle }: YearSelectionProps) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => (currentYear - i).toString());

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://your-backend-service.onrender.com/api'
      : 'http://localhost:5000/api');

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="bg-[#F3ECE5] text-[#C26F4F] rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold">2</div>
        <h3 className="text-lg font-semibold text-[#1A1915]">Year Selection (Max 2)</h3>
        <Clock className="h-4 w-4 text-[#C26F4F]" />
      </div>
      
      <div className="ml-10">
        <Label className="text-[#57544B] mb-3 block">Years</Label>
        <div className="grid grid-cols-2 gap-2">
          {years.map((year) => (
            <div key={year} className="flex items-center space-x-2">
              <Checkbox
                id={`year-${year}`}
                checked={selectedYears.includes(year)}
                onCheckedChange={() => onYearToggle(year)}
                className="border-[#C26F4F] data-[state=checked]:bg-[#C26F4F] data-[state=checked]:border-[#C26F4F]"
                disabled={!selectedYears.includes(year) && selectedYears.length >= 2}
              />
              <Label htmlFor={`year-${year}`} className="text-[#57544B]">{year}</Label>
            </div>
          ))}
        </div>
        {selectedYears.length >= 2 && (
          <p className="text-[#B07A2E] text-sm mt-2">Maximum 2 years selected</p>
        )}
      </div>
    </div>
  );
};

export default YearSelection;
