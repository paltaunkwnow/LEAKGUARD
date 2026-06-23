"use client";

import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartData } from "@/lib/api";
import { useLang } from "@/contexts/language-context";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
  scales: {
    x: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
    y: { grid: { color: "#1e293b" }, ticks: { color: "#94a3b8", font: { size: 10 } } },
  },
};

export function DashboardCharts({ data }: { data: ChartData }) {
  const { t } = useLang();

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-neutral-300">{t.chart_sectors}</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <Bar
            data={{
              labels: data.sectors.labels,
              datasets: [{
                label: t.chart_alerts_label,
                data: data.sectors.data,
                backgroundColor: "rgba(168, 85, 247, 0.65)",
                borderColor: "#a855f7",
                borderRadius: 4,
              }],
            }}
            options={{ ...chartOptions, plugins: { legend: { display: false } } }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-neutral-300">{t.chart_verification}</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <Doughnut
            data={{
              labels: data.verification.labels,
              datasets: [{
                data: data.verification.data,
                backgroundColor: ["#22c55e", "#eab308", "#ef4444"],
                borderColor: "#0f172a",
                borderWidth: 2,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "right", labels: { color: "#94a3b8", font: { size: 11 }, padding: 12 } } },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
