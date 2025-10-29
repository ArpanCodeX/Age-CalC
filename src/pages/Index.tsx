import { useState, useEffect } from "react";
import { format, differenceInYears, differenceInMonths, differenceInDays } from "date-fns";
import { Calendar as CalendarIcon, Cake, PartyPopper, Github, Linkedin, Globe, History } from "lucide-react";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AgeResult {
  years: number;
  months: number;
  days: number;
}

interface HistoryEntry {
  birthDate: string;
  years: number;
  months: number;
  days: number;
  calculatedAt: string;
}

const Index = () => {
  const [birthDate, setBirthDate] = useState<Date>();
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ageHistory");
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to read history from localStorage", e);
    }
  }, []);

  const calculateAge = () => {
    if (!birthDate) return;

    const today = new Date();
    const years = differenceInYears(today, birthDate);
    
    // Calculate remaining months after years
    const yearsPassed = new Date(birthDate);
    yearsPassed.setFullYear(yearsPassed.getFullYear() + years);
    const months = differenceInMonths(today, yearsPassed);
    
    // Calculate remaining days after months
    const monthsPassed = new Date(yearsPassed);
    monthsPassed.setMonth(monthsPassed.getMonth() + months);
    const days = differenceInDays(today, monthsPassed);

    setAgeResult({ years, months, days });
    setShowResult(true);

    // Save to history
    try {
      const entry = {
        birthDate: birthDate.toISOString(),
        years,
        months,
        days,
        calculatedAt: new Date().toISOString(),
      };
      const updated = [entry, ...history].slice(0, 50); // keep latest 50
      setHistory(updated);
      localStorage.setItem("ageHistory", JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save history", e);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Header */}
        <div className="relative text-center space-y-2">
          {/* History button top-right */}
          <div className="absolute right-0 top-0">
            <Dialog>
              <DialogTrigger asChild>
                <button
                  className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-accent/50 text-muted-foreground"
                  aria-label="Open history"
                >
                  <History className="w-5 h-5" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogTitle>Calculation History</DialogTitle>
                <DialogDescription>
                  Your previous age calculations are saved locally in your browser.
                </DialogDescription>
                <div className="mt-4 space-y-3 max-h-72 overflow-auto">
                  {history.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No history yet.</div>
                  ) : (
                    history.map((h, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-card/60">
                        <div>
                          <div className="text-sm font-medium">{format(new Date(h.birthDate), "PPP")}</div>
                          <div className="text-xs text-muted-foreground">Calculated: {format(new Date(h.calculatedAt), "PPP p")}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{h.years}y {h.months}m {h.days}d</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button
                    className="px-3 py-1 rounded-md text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive"
                    onClick={() => {
                      localStorage.removeItem("ageHistory");
                      setHistory([]);
                    }}
                  >
                    Clear
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Cake className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            Age Calculator
          </h1>
          <p className="text-muted-foreground">
            Discover your exact age in years, months, and days
          </p>
        </div>

        {/* Main Card */}
        <div 
          className="bg-card rounded-3xl p-8 shadow-[var(--shadow-soft)] space-y-6 transition-all duration-300 hover:shadow-[var(--shadow-hover)]"
          style={{ background: 'var(--gradient-card)' }}
        >
          {/* Date Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Date of Birth
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-14 rounded-2xl border-2 transition-all",
                    !birthDate && "text-muted-foreground",
                    "hover:border-primary hover:bg-accent"
                  )}
                >
                  <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                  {birthDate ? (
                    format(birthDate, "PPP")
                  ) : (
                    <span>Pick your date of birth</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-2xl" align="start">
                <Calendar
                  mode="single"
                  selected={birthDate}
                  onSelect={setBirthDate}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className="rounded-2xl pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Calculate Button */}
          <Button
            onClick={calculateAge}
            disabled={!birthDate}
            className="w-full h-14 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
            style={{
              background: birthDate ? 'var(--gradient-primary)' : undefined,
            }}
          >
            Calculate Age
            <PartyPopper className="ml-2 h-5 w-5" />
          </Button>

          {/* Result Display */}
          {showResult && ageResult && (
            <div className="animate-scale-in space-y-4 pt-4 border-t-2 border-border">
              <div className="text-center">
                <h2 className="text-lg font-medium text-muted-foreground mb-4">
                  Your Age
                </h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-primary/5 rounded-2xl p-4 space-y-1">
                    <div className="text-3xl font-bold text-primary">
                      {ageResult.years}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ageResult.years === 1 ? "Year" : "Years"}
                    </div>
                  </div>
                  <div className="bg-accent rounded-2xl p-4 space-y-1">
                    <div className="text-3xl font-bold text-accent-foreground">
                      {ageResult.months}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ageResult.months === 1 ? "Month" : "Months"}
                    </div>
                  </div>
                  <div className="bg-secondary rounded-2xl p-4 space-y-1">
                    <div className="text-3xl font-bold text-secondary-foreground">
                      {ageResult.days}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {ageResult.days === 1 ? "Day" : "Days"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center text-sm text-muted-foreground space-y-2">
  <div className="flex items-center space-x-3">
    <span>
      Made by <span className="font-medium text-foreground">Arpan Khan</span>
    </span>
    <a
      href="https://github.com/arpancodex"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub Profile"
      className="text-muted-foreground hover:text-primary transition-colors"
    >
      <Github className="w-5 h-5" />
    </a>
    <a
      href="https://www.linkedin.com/in/arpankhan/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="LinkedIn Profile"
      className="text-muted-foreground hover:text-primary transition-colors"
    >
      <Linkedin className="w-5 h-5" />
    </a>
    <a
      href="https://www.arpankhan.tech"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Personal Portfolio"
      className="text-muted-foreground hover:text-primary transition-colors"
    >
      <Globe className="w-5 h-5" />
    </a>
  </div>

  <div className="text-center">
    <span className="text-xs">
      © {new Date().getFullYear()} <span className="font-medium">Arpan Khan</span>. All rights reserved.
    </span>
  </div>
</div>
  </div>
      </div>
    
  );
};

export default Index;
