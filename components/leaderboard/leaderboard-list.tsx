import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function LeaderboardList({ entries, currentUserId }: { entries: any[], currentUserId?: string }) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Rank</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Level</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry, index) => (
            <TableRow 
              key={entry.id}
              className={entry.studentId === currentUserId ? "bg-primary/5" : ""}
            >
              <TableCell className="font-bold text-muted-foreground">
                #{index + 4}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.student.image} />
                    <AvatarFallback>{entry.student.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{entry.student.name}</span>
                  {entry.studentId === currentUserId && (
                    <Badge variant="outline" className="ml-2 text-[10px]">You</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[10px]">
                  {entry.student.level}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono font-bold">
                {entry.score.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}