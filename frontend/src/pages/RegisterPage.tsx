import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Card from '../components/Card';
import Input from '../components/Input';
import { Link2, CheckCircle2, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, hyphens, or underscores'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage: React.FC = () => {
  const { register: registerApi } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setServerError('');
    try {
      await registerApi({
        username: data.username,
        email: data.email,
        password: data.password,
      });
      setSuccess(true);
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || 'Registration failed. Username or email might be taken.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex flex-col transition-colors duration-300">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/20 mb-2">
              <Link2 className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Create an account
            </h2>
            <p className="text-sm text-slate-500">
              Get started with TinyLink today for detailed analytics and protected links
            </p>
          </div>

          <Card>
            {success ? (
              <div className="text-center py-6 space-y-4">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    Registration Successful!
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Your profile has been created. You can now log in using your credentials.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 py-3 text-sm font-semibold text-white shadow-md transition-colors"
                >
                  Go to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/20 dark:border-red-900 dark:text-red-400">
                    {serverError}
                  </div>
                )}

                <Input
                  label="Username"
                  type="text"
                  placeholder="e.g. janesmith"
                  error={errors.username?.message}
                  {...register('username')}
                />

                <Input
                  label="Email address"
                  type="email"
                  placeholder="e.g. jane@example.com"
                  error={errors.email?.message}
                  {...register('email')}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 6 characters"
                  error={errors.password?.message}
                  {...register('password')}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-brand-600 hover:bg-brand-700 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/10 transition-colors disabled:opacity-50"
                >
                  <span>{loading ? 'Creating account...' : 'Sign up'}</span>
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>
            )}

            {!success && (
              <div className="mt-6 border-t border-slate-150 dark:border-slate-800 pt-4 text-center text-xs text-slate-500">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                  Sign in
                </Link>
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
