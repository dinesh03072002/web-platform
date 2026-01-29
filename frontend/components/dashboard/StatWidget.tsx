import { Card, CardContent } from "@/components/ui/card";

export default function StatWidget({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <Card className="rounded-md shadow-sm">
      <CardContent className="px-3 py-2">
        <p className="text-sm text-slate-600 font-medium truncate">{title}</p>
        <p className="text-xl font-bold leading-6">{value}</p>
      </CardContent>
    </Card>
  );
}
