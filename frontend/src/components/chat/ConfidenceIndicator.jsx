/**
 * ConfidenceIndicator Component
 * Displays confidence score with color coding and complexity badge
 */

import { Badge } from '../ui/Badge';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react';

export function ConfidenceIndicator({ metadata }) {
  if (!metadata) return null;

  const { confidenceScore, complexityLevel, needsEscalation } = metadata;

  // Determine confidence level and color
  const getConfidenceInfo = (score) => {
    if (score >= 0.9) {
      return {
        label: 'High Confidence',
        color: 'success',
        icon: CheckCircle,
        textColor: 'text-amber-800',
      };
    } else if (score >= 0.7) {
      return {
        label: 'Moderate Confidence',
        color: 'warning',
        icon: HelpCircle,
        textColor: 'text-yellow-700',
      };
    } else {
      return {
        label: 'Low Confidence',
        color: 'destructive',
        icon: AlertTriangle,
        textColor: 'text-red-700',
      };
    }
  };

  const confidenceInfo = getConfidenceInfo(confidenceScore);
  const Icon = confidenceInfo.icon;

  // Complexity badge variant
  const complexityVariant = {
    simple: 'secondary',
    moderate: 'warning',
    complex: 'destructive',
  }[complexityLevel] || 'secondary';

  return (
    <div className="flex items-center gap-2 text-xs mt-2">
      {/* Confidence indicator */}
      <div className={cn('flex items-center gap-1', confidenceInfo.textColor)}>
        <Icon className="h-3 w-3" />
        <span className="font-medium">{confidenceInfo.label}</span>
        <span className="text-muted-foreground">
          ({(confidenceScore * 100).toFixed(0)}%)
        </span>
      </div>

      {/* Complexity badge */}
      {complexityLevel && (
        <Badge variant={complexityVariant} className="text-xs">
          {complexityLevel}
        </Badge>
      )}

      {/* Escalation warning */}
      {needsEscalation && (
        <Badge variant="destructive" className="text-xs">
          Flagged for Review
        </Badge>
      )}
    </div>
  );
}

export default ConfidenceIndicator;
