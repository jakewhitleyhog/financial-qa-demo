import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle, User } from 'lucide-react';

const DEAL_NAME = import.meta.env.VITE_DEAL_NAME || 'Investor Portal';

export function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-12 mx-auto mb-4"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <h1 className="text-2xl font-bold text-foreground">{DEAL_NAME}</h1>
          <p className="text-muted-foreground mt-1">Investment Details and Question Board</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {sent ? 'Check Your Email' : 'Sign In'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <p className="text-muted-foreground">
                  If <strong>{email}</strong> is authorized, you'll receive a sign-in link shortly.
                </p>
                <p className="text-sm text-muted-foreground">
                  The link expires in 15 minutes.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setSent(false); setEmail(''); }}
                >
                  Use a different email
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the email address associated with your investment to receive a sign-in link.
                </p>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="investor@example.com"
                    className="pl-10"
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={loading || demoLoading}>
                  {loading ? (
                    'Sending...'
                  ) : (
                    <>
                      Send Sign-In Link
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={loading || demoLoading}
                  onClick={async () => {
                    setDemoLoading(true);
                    setError('');
                    try {
                      await demoLogin();
                      navigate('/', { replace: true });
                    } catch (err) {
                      setError(err.message || 'Demo login failed');
                    } finally {
                      setDemoLoading(false);
                    }
                  }}
                >
                  {demoLoading ? (
                    'Signing in...'
                  ) : (
                    <>
                      <User className="h-4 w-4 mr-2" />
                      Continue as Demo Investor
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage;
