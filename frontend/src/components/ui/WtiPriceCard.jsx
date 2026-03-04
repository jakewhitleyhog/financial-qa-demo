import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Droplets, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { dealAPI } from '@/services/api';
import { WTI_COLOR } from '../../config/theme';

/**
 * Self-fetching WTI crude oil price card with 30-day sparkline.
 * Returns null if no API key is configured or EIA is unavailable.
 *
 * @param {{ breakevenPrice?: number }} props
 */
export function WtiPriceCard({ breakevenPrice = 45 }) {
  const [oilData, setOilData] = useState(undefined); // undefined = loading

  useEffect(() => {
    dealAPI.getOilPrice()
      .then(res => setOilData(res.data ?? null))
      .catch(() => setOilData(null));
  }, []);

  if (oilData === undefined) {
    return <Skeleton className="h-44 rounded-xl col-span-2" />;
  }

  if (!oilData?.latest) {
    return null; // No EIA key or API down — silently omit card
  }

  const { latest, history } = oilData;
  const delta = +(latest.priceUsd - breakevenPrice).toFixed(2);
  const aboveBreakeven = delta >= 0;
  const DeltaIcon = aboveBreakeven ? TrendingUp : TrendingDown;
  const deltaColor = aboveBreakeven ? 'text-emerald-600' : 'text-destructive';

  const sparkData = history.map(h => ({
    period: h.period,
    price: h.priceUsd,
  }));

  return (
    <Card className="col-span-2">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Droplets className="h-4 w-4 text-primary" />
            WTI Crude Oil
          </CardTitle>
          <span className="text-xs text-muted-foreground">as of {latest.period}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl font-bold text-foreground">
            ${latest.priceUsd.toFixed(2)}
          </span>
          <span className={`flex items-center gap-1 text-sm font-medium ${deltaColor}`}>
            <DeltaIcon className="h-4 w-4" />
            {aboveBreakeven ? '+' : ''}${delta.toFixed(2)} vs ${breakevenPrice} breakeven
          </span>
        </div>

        {sparkData.length > 0 && (
          <ResponsiveContainer width="100%" height={60}>
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradWti" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={WTI_COLOR} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={WTI_COLOR} stopOpacity={0}    />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="price"
                stroke={WTI_COLOR}
                fill="url(#gradWti)"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <XAxis dataKey="period" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                formatter={(v) => [`$${v.toFixed(2)}`, 'WTI']}
                labelFormatter={(l) => l}
                contentStyle={{ fontSize: 12 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default WtiPriceCard;
