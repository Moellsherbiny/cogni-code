import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal } from "lucide-react";

export function LeaderboardPodium({ topThree }: { topThree: any[] }) {
  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-400";
    if (index === 1) return "text-slate-400";
    return "text-amber-600";
  };

  return (
    <div className="flex flex-wrap items-end justify-center gap-4 py-8 md:gap-8">
      {topThree.map((entry, index) => {
        // Reorder for visual podium: [2, 1, 3]
        const order = [2, 1, 3][index];
        const isFirst = index === 0;

        return (
          <div 
            key={entry.id} 
            className={`flex flex-col items-center gap-2 ${isFirst ? "order-2 mb-4" : index === 1 ? "order-1" : "order-3"}`}
          >
            <div className="relative">
              <Avatar className={`${isFirst ? "h-24 w-24 border-4 border-yellow-400" : "h-16 w-16 border-2"}`}>
                <AvatarImage src={entry.student.image} />
                <AvatarFallback>{entry.student.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                {isFirst ? (
                  <Trophy className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                ) : (
                  <Medal className={`h-6 w-6 ${getMedalColor(index)} fill-current`} />
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm md:text-base">{entry.student.name}</p>
              <p className="text-xl font-black text-primary">{entry.score.toLocaleString()}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {entry.student.level}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}