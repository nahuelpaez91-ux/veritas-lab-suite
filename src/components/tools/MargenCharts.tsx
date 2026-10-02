'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { chartTick, chartTooltip } from './chartStyle';

/** Contribución (%) de cada magnitud de entrada a u_c². Se carga con next/dynamic desde MargenTool. */
export function ContributionsChart({ data }: { data: { name: string; percent: number }[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="1 3" />
          <XAxis type="number" domain={[0, 100]} tick={chartTick} stroke="var(--color-line)" />
          <YAxis type="category" dataKey="name" tick={{ ...chartTick, fontSize: 12 }} stroke="var(--color-line)" width={24} />
          <Tooltip {...chartTooltip} cursor={{ fill: 'var(--color-bg)' }} formatter={(v) => (typeof v === 'number' ? `${v.toFixed(1)} %` : String(v))} />
          <Bar dataKey="percent" fill="var(--color-accent)" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Histograma de la simulación de Monte Carlo. Márgenes laterales para que la primera y última etiqueta no se corten. */
export function HistogramChart({ data }: { data: { x: string; count: number }[] }) {
  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, left: 20, right: 20, bottom: 0 }}>
          <XAxis dataKey="x" tick={{ ...chartTick, fontSize: 9 }} stroke="var(--color-line)" interval={7} />
          <YAxis hide />
          <Tooltip {...chartTooltip} cursor={{ fill: 'var(--color-bg)' }} />
          <Bar dataKey="count" fill="var(--color-accent)" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
