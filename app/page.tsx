'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { Eye, EyeOff, Mail, Lock, User, Heart, CheckCircle, Activity } from 'lucide-react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

interface InputFieldProps {
  type: string;
  name: string;
  value: string;
  placeholder: string;
  icon: any;
  showToggle?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus: (fieldName: string) => void;
  onBlur: () => void;
  isFocused: boolean;
}

const InputField = ({ 
  type, 
  name, 
  value, 
  placeholder, 
  icon: Icon, 
  showToggle = false,
  showPassword = false,
  onTogglePassword,
  disabled = false,
  onChange,
  onFocus,
  onBlur,
  isFocused
}: InputFieldProps) => (
  <div className="relative group">
    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
      <Icon 
        size={20} 
        className={`transition-colors duration-200 ${
          isFocused || value 
            ? 'text-black' 
            : 'text-gray-400'
        }`} 
      />
    </div>
    <input
      type={showToggle ? (showPassword ? 'text' : 'password') : type}
      name={name}
      value={value}
      onChange={onChange}
      onFocus={() => onFocus(name)}
      onBlur={onBlur}
      placeholder={placeholder}
      className="w-full h-14 pl-12 pr-12 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-10 focus:border-black hover:border-gray-300 bg-white"
      disabled={disabled}
    />
    {showToggle && onTogglePassword && (
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        disabled={disabled}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    )}
  </div>
);

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const router = useRouter();

  // Refs for GSAP animations
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const switchTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const session = await getSession();
      if (session) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    // Initial page load animation
    const tl = gsap.timeline();
    
    tl.from(logoRef.current, {
      duration: 1.2,
      y: -30,
      opacity: 0,
      ease: "power3.out"
    })
    .from(formRef.current, {
      duration: 1,
      y: 40,
      opacity: 0,
      ease: "power3.out"
    }, "-=0.8")
    .from(switchTextRef.current, {
      duration: 0.8,
      opacity: 0,
      ease: "power2.out"
    }, "-=0.4");

  }, []);

  useEffect(() => {
    // Form transition animation when switching between sign in/up
    if (formRef.current) {
      gsap.fromTo(formRef.current, 
        { scale: 0.98, opacity: 0.8 },
        { scale: 1, opacity: 1, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [isSignUp]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleFocus = useCallback((fieldName: string) => {
    setFocusedField(fieldName);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (isSignUp) {
      if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
        setError('First name and last name are required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSignUp = async () => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName?.trim(),
          lastName: formData.lastName?.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // Show success message
      setSuccess('Account created successfully! Signing you in...');
      
      // Success animation
      gsap.to(formRef.current, {
        scale: 1.02,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut"
      });

      // Auto sign in after successful signup
      setTimeout(async () => {
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/dashboard');
        } else {
          setError('Account created but sign in failed. Please sign in manually.');
          setSuccess('');
        }
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    }
  };

  const handleSignIn = async () => {
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          setError('Invalid email or password');
        } else {
          setError('Sign in failed. Please try again.');
        }
        return;
      }

      if (result?.ok) {
        setSuccess('Welcome back! Redirecting...');
        
        // Success animation
        gsap.to(formRef.current, {
          scale: 1.02,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: "power2.inOut"
        });

        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        await handleSignUp();
      } else {
        await handleSignIn();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div ref={logoRef} className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
                  <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
            <h1 className="text-3xl font-bold text-black tracking-tight">
              Hefica
            </h1>
          </div>
          <p className="text-gray-600 text-lg font-light">
            Your wellness journey starts here
          </p>
        </div>

        {/* Form Container */}
        <div ref={formRef} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-2">
              {isSignUp ? 'Create your account' : 'karibu '}
            </h2>
            <p className="text-gray-500 text-base font-light">
              {isSignUp 
                ? 'Join thousands transforming their wellness' 
                : 'Continue your wellness transformation'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 flex-shrink-0"></div>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-600 text-sm rounded-xl flex items-center">
              <CheckCircle size={16} className="mr-3 flex-shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignUp && (
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  placeholder="First name"
                  icon={User}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  isFocused={focusedField === 'firstName'}
                  disabled={isLoading}
                />
                <InputField
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  placeholder="Last name"
                  icon={User}
                  onChange={handleInputChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  isFocused={focusedField === 'lastName'}
                  disabled={isLoading}
                />
              </div>
            )}

            <InputField
              type="email"
              name="email"
              value={formData.email}
              placeholder="Email address"
              icon={Mail}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              isFocused={focusedField === 'email'}
              disabled={isLoading}
            />

            <InputField
              type="password"
              name="password"
              value={formData.password}
              placeholder="Password"
              icon={Lock}
              showToggle={true}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              isFocused={focusedField === 'password'}
              disabled={isLoading}
            />

            {isSignUp && (
              <InputField
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword || ''}
                placeholder="Confirm password"
                icon={Lock}
                showToggle={true}
                showPassword={showConfirmPassword}
                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                isFocused={focusedField === 'confirmPassword'}
                disabled={isLoading}
              />
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-black text-white font-medium rounded-xl transition-all duration-200 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-black focus:ring-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99] disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                  {isSignUp ? 'Creating your account...' : 'Signing you in...'}
                </span>
              ) : (
                isSignUp ? 'Create account' : 'Sign in'
              )}
            </button>
          </form>

          {!isSignUp && (
            <div className="text-center mt-6">
              <button 
                className="text-sm text-gray-500 hover:text-black transition-colors font-medium"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-500 text-sm">
              By continuing, you agree to Hefica's{' '}
              <button className="text-black hover:underline font-medium">Terms of Service</button>
              {' '}and{' '}
              <button className="text-black hover:underline font-medium">Privacy Policy</button>
            </p>
          </div>
        </div>

        {/* Switch Mode */}
        <div ref={switchTextRef} className="text-center mt-8">
          <p className="text-gray-600">
            {isSignUp ? 'Already have an account?' : 'New to Hefica?'}{' '}
            <button
              onClick={switchMode}
              className="text-black font-semibold hover:underline transition-all ml-1 disabled:opacity-50"
              disabled={isLoading}
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
