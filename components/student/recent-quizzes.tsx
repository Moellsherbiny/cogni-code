import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RecentQuizzes({ attempts }: { attempts: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Assessments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium">{attempt.quiz.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(attempt.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={`text-sm font-bold ${attempt.score >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {attempt.score}%
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}