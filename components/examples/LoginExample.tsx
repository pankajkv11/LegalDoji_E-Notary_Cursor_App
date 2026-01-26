'use client';

/**
 * Example: Login component using generated GraphQL hooks
 * This demonstrates how to use auto-generated hooks instead of manual API calls
 */

import { useState } from 'react';
import { useLoginMutation, useSendOtpMutation } from '@/graphql/generated/hooks';
import { setAuthTokens } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export function LoginExample() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    otp: '',
  });

  const [login, { loading: loginLoading, error: loginError }] = useLoginMutation({
    onCompleted: (data) => {
      if (data.login) {
        setAuthTokens(
          data.login.accessToken,
          data.login.refreshToken,
          data.login.user,
        );
        router.push('/dashboard');
      }
    },
  });

  const [sendOtp, { loading: otpLoading }] = useSendOtpMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 'credentials') {
      if (loginMethod === 'email' && formData.email && formData.password) {
        await login({
          variables: {
            input: {
              method: 'EMAIL',
              email: formData.email,
              password: formData.password,
            },
          },
        });
      } else if (loginMethod === 'phone' && formData.phone) {
        await sendOtp({
          variables: {
            phone: formData.phone,
          },
        });
        setStep('otp');
      }
    } else {
      // OTP verification
      if (formData.otp) {
        await login({
          variables: {
            input: {
              method: 'PHONE',
              phone: formData.phone,
              otp: formData.otp,
            },
          },
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {loginError && (
        <div className="text-red-600 text-sm">
          {loginError.message}
        </div>
      )}
      
      {/* Form fields */}
      <button
        type="submit"
        disabled={loginLoading || otpLoading}
        className="w-full bg-primary-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loginLoading || otpLoading ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
