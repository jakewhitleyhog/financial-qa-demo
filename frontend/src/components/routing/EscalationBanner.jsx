/**
 * EscalationBanner Component
 * Displays warning when a question needs human review
 */

import { Alert, AlertTitle, AlertDescription } from '../ui/Alert';
import { Button } from '../ui/Button';
import { AlertTriangle } from 'lucide-react';

export function EscalationBanner({ reason, onEscalate }) {
  return (
    <Alert variant="warning" className="mt-4">
      <AlertTriangle className="h-5 w-5" />
      <div className="flex-1">
        <AlertTitle>This question may need human review</AlertTitle>
        <AlertDescription className="mt-2">
          {reason || 'The AI assistant is not confident in its response.'}
        </AlertDescription>
      </div>
      {onEscalate && (
        <Button variant="outline" size="sm" onClick={onEscalate} className="ml-4">
          Request Human Help
        </Button>
      )}
    </Alert>
  );
}

export default EscalationBanner;
