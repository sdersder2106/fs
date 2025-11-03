'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { Toggle } from '@/components/ui/Toggle';
import { signupSchema } from '@/lib/validations';
import { 
  Mail, 
  Lock, 
  User, 
  Building, 
  AlertCircle, 
  ArrowRight,
  CheckCircle,
  Info
} from 'lucide-react';

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  
  const [step, setStep] = React.useState<1 | 2>(1);
  const [formData, setFormData] = React.useState<SignupForm>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    acceptTerms: false,
  });
  const [createCompany, setCreateCompany] = React.useState(true);
  const [errors, setErrors] = React.useState<Partial<SignupForm>>({});
  const [isLoading, setIsLoading] = React.useState(false);
  const [generalError, setGeneralError] = React.useState('');
  const [success, setSuccess] = React.useState(false);

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthText = ['Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || '';
  const passwordStrengthColor = [
    'bg-red-500',
    'bg-orange-500', 
    'bg-yellow-500',
    'bg-green-500'
  ][passwordStrength - 1] || 'bg-gray-300';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name as keyof SignupForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    setGeneralError('');
  };

  const validateStep1 = () => {
    const step1Data = {
      email: formData.email,
      fullName: formData.fullName,
      companyName: createCompany ? formData.companyName : undefined,
    };

    const step1Schema = z.object({
      email: z.string().email('Invalid email address'),
      fullName: z.string().min(2, 'Name must be at least 2 characters'),
      companyName: createCompany 
        ? z.string().min(2, 'Company name must be at least 2 characters')
        : z.string().optional(),
    });

    try {
      step1Schema.parse(step1Data);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<SignupForm> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof SignupForm] = err.message;
          }
        });
        setErrors(fieldErrors);
        return false;
      }
    }
    return false;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    // Validate form
    try {
      const dataToValidate = {
        ...formData,
        companyName: createCompany ? formData.companyName : undefined,
      };
      signupSchema.parse(dataToValidate);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Partial<SignupForm> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof SignupForm] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }
    }

    // Attempt signup
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          password: formData.password,
          fullName: formData.fullName,
          companyName: createCompany ? formData.companyName : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setGeneralError(data.error || 'Failed to create account');
        return;
      }

      // Success - auto login
      setSuccess(true);
      
      // Auto sign in
      const signInResult = await signIn('credentials', {
        email: formData.email.toLowerCase(),
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 1500);
      }
    } catch (error) {
      setGeneralError('An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Account Created Successfully!
        </h2>
        <p className="text-gray-600 mb-4">
          You&apos;re being redirected to your dashboard...
        </p>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
        <p className="mt-2 text-sm text-gray-600">
          Start your 14-day free trial, no credit card required
        </p>
      </div>

      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center">
          <div className={cn(
            'flex-1 h-2 rounded-full',
            step >= 1 ? 'bg-primary-600' : 'bg-gray-200'
          )} />
          <div className="mx-2">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            )}>
              2
            </div>
          </div>
          <div className={cn(
            'flex-1 h-2 rounded-full',
            step >= 2 ? 'bg-primary-600' : 'bg-gray-200'
          )} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-600">Account Info</span>
          <span className="text-xs text-gray-600">Security</span>
        </div>
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
        {step === 1 ? (
          <>
            {/* Step 1: Account Information */}
            <div>
              <Input
                name="fullName"
                type="text"
                label="Full name"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                placeholder="John Doe"
                icon={<User className="w-5 h-5" />}
                required
                autoFocus
              />
            </div>

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
              />
            </div>

            <div>
              <Toggle
                label="Create a new company"
                checked={createCompany}
                onChange={(e) => setCreateCompany(e.target.checked)}
                hint="Turn off to join an existing company"
              />
            </div>

            {createCompany && (
              <div>
                <Input
                  name="companyName"
                  type="text"
                  label="Company name"
                  value={formData.companyName}
                  onChange={handleChange}
                  error={errors.companyName}
                  placeholder="Acme Inc."
                  icon={<Building className="w-5 h-5" />}
                  required
                />
              </div>
            )}

            {!createCompany && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Joining an existing company?</p>
                    <p>You&apos;ll be added to the default company. An admin can invite you to the correct company after signup.</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="button"
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleNextStep}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            {/* Step 2: Password and Terms */}
            <div>
              <Input
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                hint="At least 8 characters with uppercase and numbers"
                required
                autoFocus
              />
              
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">Password strength:</span>
                    <span className={cn(
                      'text-xs font-medium',
                      passwordStrength === 4 ? 'text-green-600' :
                      passwordStrength === 3 ? 'text-yellow-600' :
                      passwordStrength === 2 ? 'text-orange-600' : 'text-red-600'
                    )}>
                      {passwordStrengthText}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={cn('h-1.5 rounded-full transition-all', passwordStrengthColor)}
                      style={{ width: `${(passwordStrength / 4) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input
                name="confirmPassword"
                type="password"
                label="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
                icon={<Lock className="w-5 h-5" />}
                required
              />
            </div>

            <div>
              <Checkbox
                name="acceptTerms"
                label={
                  <span>
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                      Privacy Policy
                    </Link>
                  </span>
                }
                checked={formData.acceptTerms}
                onChange={handleChange}
                error={errors.acceptTerms}
                required
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                fullWidth
                size="lg"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={isLoading}
                disabled={isLoading || !formData.acceptTerms}
              >
                Create account
              </Button>
            </div>
          </>
        )}
      </form>

      {/* Sign in link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </>
  );
}
