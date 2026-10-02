'use client';

import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export type LjDatum = { run: string } & Record<string, number | string>;

const COLORS = ['var(--color-accent)', '#7c3aed'];

export function LeveyJenningsChart({ data, levels, title }: { data: LjDatum[]; levels: string[]; title: string }) {
  return (
    <figure className="w-full">
      <figcaption className="mb-2 text-sm font-semibold">{title}</figcaption>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 16, bottom: 4, left: -16 }}>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" />
            <XAxis dataKey="run" tick={{ fontSize: 10 }} stroke="var(--color-muted)" interval="preserveStartEnd" />
            <YAxis domain={[-4, 4]} ticks={[-3, -2, -1, 0, 1, 2, 3]} tick={{ fontSize: 10 }} stroke="var(--color-muted)" />
            <ReferenceLine y={3} stroke="var(--color-danger)" strokeDasharray="4 2" />
            <ReferenceLine y={-3} stroke="var(--color-danger)" strokeDasharray="4 2" />
            <ReferenceLine y={2} stroke="var(--color-warn)" strokeDasharray="4 2" />
            <ReferenceLine y={-2} stroke="var(--color-warn)" strokeDasharray="4 2" />
            <ReferenceLine y={1} stroke="var(--color-line)" />
            <ReferenceLine y={-1} stroke="var(--color-line)" />
            <ReferenceLine y={0} stroke="var(--color-muted)" />
            <Tooltip formatter={(v) => (typeof v === 'number' ? v.toFixed(2) : String(v))} />
            <Legend />
            {levels.map((level, i) => (
              <Line
                key={level}
                type="linear"
                dataKey={level}
                stroke={COLORS[i % COLORS.length]}
                dot={{ r: 3 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  );
}
