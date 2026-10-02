'use client';

import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import { chartTick, chartTooltip } from './chartStyle';

export type CurvaDatum = { x: number; y: number; fit: number; r: number };

/** Curva de calibración (puntos + recta). Se carga con next/dynamic desde CurvaTool. */
export function CalibrationChart({ data, fitLabel, pointsLabel }: { data: CurvaDatum[]; fitLabel: string; pointsLabel: string }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="1 3" />
          <XAxis type="number" dataKey="x" tick={chartTick} stroke="var(--color-line)" />
          <YAxis tick={chartTick} stroke="var(--color-line)" />
          <Tooltip {...chartTooltip} />
          <Line dataKey="fit" name={fitLabel} stroke="var(--color-ink)" strokeWidth={1.4} dot={false} isAnimationActive={false} />
          <Scatter dataKey="y" name={pointsLabel} fill="var(--color-accent)" shape="square" isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Residuos (y − ŷ) frente a x. */
export function ResidualsChart({ data }: { data: CurvaDatum[] }) {
  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 8, right: 16, bottom: 4, left: -8 }}>
          <CartesianGrid stroke="var(--color-line)" strokeDasharray="1 3" />
          <XAxis type="number" dataKey="x" tick={chartTick} stroke="var(--color-line)" />
          <YAxis type="number" dataKey="r" tick={chartTick} stroke="var(--color-line)" />
          <ReferenceLine y={0} stroke="var(--color-ink)" />
          <Tooltip {...chartTooltip} />
          <Scatter data={data} fill="var(--color-accent)" shape="square" isAnimationActive={false} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
