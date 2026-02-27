import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Droplets, DollarSign, Target, Layers, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { dealAPI } from '../services/api';

// ── Warm palette colours used in charts ──────────────────────────────────────
const PALETTE = {
  sienna:    '#8B5E3C',
  siennaDim: '#C4956A',
  cream:     '#D4B896',
  olive:     '#5C4A2A',
  stone:     '#A89070',
  rust:      '#C07040',
};

const PIE_COLORS = [
  PALETTE.sienna, PALETTE.siennaDim, PALETTE.olive,
  PALETTE.cream, PALETTE.stone, PALETTE.rust,
];

// ── Small KPI card ────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'text-primary' }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Custom chart tooltip ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, valuePrefix = '', valueSuffix = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-sm text-sm">
      <p className="font-medium text-foreground mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="flex gap-2">
          <span className="text-muted-foreground">{entry.name}:</span>
          {valuePrefix}{typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}{valueSuffix}
        </p>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dealAPI.getSummary()
      .then(res => setData(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span className="text-sm">Failed to load deal data: {error}</span>
        </div>
      </div>
    );
  }

  const { deal, financials, capitalAllocation, projectedReturns, priceSensitivities } = data;

  // Format financials for charts (revenue in $M)
  const financialsChart = financials.map(f => ({
    year: String(f.year),
    'Revenue ($M)': +(f.revenue / 1_000_000).toFixed(1),
    'Op. Income ($M)': +(f.operatingIncome / 1_000_000).toFixed(1),
    'Distributions ($M)': +(f.distributions / 1_000_000).toFixed(1),
  }));

  // Pie data: capitalAllocation
  const pieData = capitalAllocation.map(c => ({
    name: c.category,
    value: +(c.percentage),
  }));

  // Price sensitivity for bar chart
  const sensitivityChart = priceSensitivities.map(p => ({
    price: `$${p.oilPrice}`,
    'IRR (%)': +(p.irr).toFixed(1),
    'MOIC (x)': +(p.moic).toFixed(2),
  }));

  // Projected returns table rows
  const baseCase = projectedReturns.find(r => r.scenario?.toLowerCase().includes('base'));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{deal.name}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {deal.basin} Basin · {deal.state} · {deal.totalWellsPlanned} wells planned
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {deal.leaseholdAcres?.toLocaleString()} leasehold acres
        </Badge>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard
          icon={TrendingUp}
          label="Target IRR"
          value={`${deal.targetIrr}%`}
          sub="Unlevered net"
        />
        <KpiCard
          icon={Layers}
          label="Target MOIC"
          value={`${deal.targetMoic}x`}
          sub={baseCase ? `Base: ${baseCase.moic}x` : undefined}
        />
        <KpiCard
          icon={DollarSign}
          label="Capital Raise"
          value={`$${(deal.capitalRaiseTarget / 1_000_000).toFixed(0)}M`}
          sub="Total offering"
        />
        <KpiCard
          icon={Target}
          label="Breakeven Oil"
          value={`$${deal.fundBreakevenOilPrice}`}
          sub="per bbl"
        />
      </div>

      {/* Row 1: Revenue + Capital Allocation */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Annual Revenue / Income chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Annual Financials</CardTitle>
            <CardDescription>Revenue and operating income by year ($M)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={financialsChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.sienna} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PALETTE.sienna} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PALETTE.siennaDim} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={PALETTE.siennaDim} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<ChartTooltip valueSuffix="M" />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="Revenue ($M)" stroke={PALETTE.sienna} fill="url(#gradRevenue)" strokeWidth={2} />
                <Area type="monotone" dataKey="Op. Income ($M)" stroke={PALETTE.siennaDim} fill="url(#gradIncome)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Capital Allocation donut */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Capital Allocation</CardTitle>
            <CardDescription>Use of funds by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Price Sensitivity + Projected Returns */}
      <div className="grid gap-6 md:grid-cols-2">

        {/* Price Sensitivity bar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price Sensitivity</CardTitle>
            <CardDescription>IRR and MOIC at various oil price assumptions</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={sensitivityChart} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="price" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip content={<ChartTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="IRR (%)" fill={PALETTE.sienna} radius={[3, 3, 0, 0]} />
                <Bar dataKey="MOIC (x)" fill={PALETTE.cream} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Projected Returns table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Projected Returns by Scenario</CardTitle>
            <CardDescription>Capital invested vs. returned across cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wide">
                    <th className="pb-2 text-left font-medium">Scenario</th>
                    <th className="pb-2 text-right font-medium">IRR</th>
                    <th className="pb-2 text-right font-medium">MOIC</th>
                    <th className="pb-2 text-right font-medium">ROC Yrs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projectedReturns.map((r, i) => (
                    <tr key={i} className="hover:bg-muted/40 transition-colors">
                      <td className="py-2.5 font-medium capitalize">{r.scenario}</td>
                      <td className="py-2.5 text-right text-primary font-semibold">{r.irr}%</td>
                      <td className="py-2.5 text-right">{r.moic}x</td>
                      <td className="py-2.5 text-right text-muted-foreground">{r.returnOfCapitalYears}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Investor Distributions sparkline */}
            {financials.some(f => f.distributions > 0) && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">Investor Distributions ($M / year)</p>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={financialsChart.filter(f => f['Distributions ($M)'] > 0)}>
                    <defs>
                      <linearGradient id="gradDist" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={PALETTE.olive} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={PALETTE.olive} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="Distributions ($M)" stroke={PALETTE.olive} fill="url(#gradDist)" strokeWidth={2} dot={false} />
                    <XAxis dataKey="year" hide />
                    <YAxis hide />
                    <Tooltip formatter={(v) => `$${v}M`} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
