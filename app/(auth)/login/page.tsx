'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { loginSchema } from '@/lib/validations';
import { Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('from') || '/dashboard';
  
  const [formData, setFormData] = React.useState<LoginForm>({
    email: '',
    password: '',
  });
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errors, setErrors] = React.useState<Partial<LoginForm>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [generalError, setGeneralError] = React.useState('');

  // Demo credentials hint
  const [showDemo, setShowDemo] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name as keyof LoginForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setGeneralError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    // Validate form
    try {
      loginSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<LoginForm> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof LoginForm] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    // Attempt login
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setGeneralError('Invalid email or password');
      } else if (result?.ok) {
        // Success - redirect to callback URL
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setGeneralError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'pentester' | 'client') => {
    const credentials = {
      admin: { email: 'admin@base44.com', password: 'admin123' },
      pentester: { email: 'pentester@base44.com', password: 'pentester123' },
      client: { email: 'client@base44.com', password: 'client123' },
    };

    setFormData(credentials[role]);
    setShowDemo(false);
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="mt-2 text-sm text-gray-600">
          Sign in to your account to continue
        </p>
      </div>

      {/* Error message */}
      {generalError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-red-800">{generalError}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            name="email"
            type="email"
            label="Email address"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="you@example.com"
            icon={<Mail className="w-5 h-5" />}
            required
            autoComplete="email"
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <button
            type="button"
            onClick={() => setShowDemo(!showDemo)}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Demo credentials
          </button>
        </div>

        {/* Demo credentials */}
        {showDemo && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <p className="text-sm font-medium text-blue-900 mb-3">
              Click to use demo credentials:
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium">Admin:</span> admin@base44.com / admin123
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('pentester')}
                className="w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium">Pentester:</span> pentester@base44.com / pentester123
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('client')}
                className="w-full text-left px-3 py-2 text-sm bg-white rounded-md hover:bg-blue-100 transition-colors"
              >
                <span className="font-medium">Client:</span> client@base44.com / client123
              </button>
            </div>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={isLoading}
          disabled={isLoading}
          icon={<ArrowRight className="w-5 h-5" />}
          iconPosition="right"
        >
          Sign in
        </Button>
      </form>

      {/* Divider */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        {/* OAuth buttons (optional) */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              // Handle Google login
              alert('Google login not implemented in demo');
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="ml-2">Google</span>
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              // Handle GitHub login
              alert('GitHub login not implemented in demo');
            }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="ml-2">GitHub</span>
          </Button>
        </div>
      </div>

      {/* Sign up link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link
            href="/signup"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign up for free
          </Link>
        </p>
      </div>
    </>
  );
}
