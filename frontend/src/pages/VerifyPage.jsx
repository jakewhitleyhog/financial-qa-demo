import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verify } = useAuth();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError('No verification token found in the URL.');
      return;
    }

    verify(token)
      .then(() => {
        setStatus('success');
        setTimeout(() => navigate('/', { replace: true }), 1500);
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message || 'Verification failed. Please request a new link.');
      });
  }, [searchParams, verify, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {status === 'verifying' && (
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg font-medium">Verifying your link...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium">Signed in successfully!</p>
              <p className="text-sm text-muted-foreground">Redirecting to your portal...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-lg font-medium">Verification Failed</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => navigate('/login', { replace: true })} className="mt-4">
                Back to Sign In
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default VerifyPage;
