'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Fingerprint, Shield, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhatsAppAuth, PasskeyAuth, AfricanAuthManager } from '@/lib/auth/african-auth';

interface AuthFlowProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  mode?: 'login' | 'signup';
}

export default function AfricanAuthFlow({ 
  onSuccess, 
  onError, 
  mode = 'login' 
}: AuthFlowProps) {
  const [currentStep, setCurrentStep] = useState<'method' | 'whatsapp' | 'passkey' | 'success'>('method');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [authMethod, setAuthMethod] = useState<'whatsapp' | 'passkey' | 'email'>('whatsapp');
  const [user, setUser] = useState<any>(null);

  const recommendedMethods = AfricanAuthManager.getRecommendedAuthMethods();

  const handleWhatsAppAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await WhatsAppAuth.signInWithWhatsApp(phoneNumber);
      
      if (result.error) {
        throw new Error(result.error.message || 'WhatsApp authentication failed');
      }
      
      setUser(result.data?.user || result.data);
      setCurrentStep('success');
      
      if (onSuccess) {
        onSuccess(result.data?.user || result.data);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      if (onError) {
        onError(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyAuth = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await PasskeyAuth.authenticateWithPasskey();
      
      if (result.error) {
        throw new Error(result.error.message || 'Passkey authentication failed');
      }
      
      setUser(result.data?.user || result.data);
      setCurrentStep('success');
      
      if (onSuccess) {
        onSuccess(result.data?.user || result.data);
      }
    } catch (err: any) {
      setError(err.message || 'Passkey authentication failed');
      if (onError) {
        onError(err.message || 'Passkey authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input if value entered and not last input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) (nextInput as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) (prevInput as HTMLInputElement).focus();
    }
  };

  const isOTPFilled = otp.every(digit => digit !== '');

  useEffect(() => {
    if (currentStep === 'success' && user) {
      // Automatically call onSuccess after a short delay to show success state
      const timer = setTimeout(() => {
        if (onSuccess) {
          onSuccess(user);
        }
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, user, onSuccess]);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="
        bg-charcoal-base/90 backdrop-blur-xl
        border border-white/10 rounded-2xl
        p-6 sm:p-8
        shadow-2xl
      ">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-terracotta-primary to-savanna-gold flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-clay-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Join YOKK'}
          </h2>
          <p className="text-clay-white/60">
            {mode === 'login' 
              ? 'Sign in to continue your journey' 
              : 'Create an account to join the community'}
          </p>
        </div>

        {/* Auth Method Selection */}
        <AnimatePresence mode="wait">
          {currentStep === 'method' && (
            <motion.div
              key="method"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold text-clay-white mb-4">Choose Authentication Method</h3>
              
              <div className="space-y-3">
                {recommendedMethods.includes('whatsapp') && (
                  <button
                    onClick={() => {
                      setAuthMethod('whatsapp');
                      setCurrentStep('whatsapp');
                    }}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl
                      transition-all duration-200
                      ${authMethod === 'whatsapp'
                        ? 'bg-gradient-to-r from-terracotta-primary/20 to-savanna-gold/20 border border-terracotta-primary/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-clay-white">Continue with WhatsApp</p>
                        <p className="text-xs text-clay-white/60">Receive OTP via WhatsApp</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-clay-white/60" />
                  </button>
                )}
                
                {recommendedMethods.includes('passkey') && PasskeyAuth.isWebAuthnSupported() && (
                  <button
                    onClick={() => {
                      setAuthMethod('passkey');
                      setCurrentStep('passkey');
                    }}
                    className={`
                      w-full flex items-center justify-between p-4 rounded-xl
                      transition-all duration-200
                      ${authMethod === 'passkey'
                        ? 'bg-gradient-to-r from-terracotta-primary/20 to-savanna-gold/20 border border-terracotta-primary/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <Fingerprint className="w-5 h-5 text-blue-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-clay-white">Sign in with Passkey</p>
                        <p className="text-xs text-clay-white/60">Biometric or device authentication</p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-clay-white/60" />
                  </button>
                )}
                
                <button
                  onClick={() => {
                    setAuthMethod('email');
                    // For now, just show an alert since we don't have email auth implemented
                    alert('Email authentication coming soon!');
                  }}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-xl
                    transition-all duration-200
                    ${authMethod === 'email'
                      ? 'bg-gradient-to-r from-terracotta-primary/20 to-savanna-gold/20 border border-terracotta-primary/30'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-clay-white">Continue with Email</p>
                      <p className="text-xs text-clay-white/60">Traditional email authentication</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-clay-white/60" />
                </button>
              </div>
              
              <div className="text-center mt-6">
                <p className="text-xs text-clay-white/50">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          )}

          {/* WhatsApp Authentication */}
          {currentStep === 'whatsapp' && (
            <motion.div
              key="whatsapp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h3 className="text-xl font-semibold text-clay-white mb-2">WhatsApp Authentication</h3>
                <p className="text-clay-white/60">
                  Enter your phone number to receive a verification code via WhatsApp
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-clay-white/80 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <span className="text-clay-white/60">+234</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="8012345678"
                    className="
                      w-full pl-12 pr-4 py-3 rounded-lg
                      bg-white/5 border border-white/10
                      text-clay-white placeholder:text-clay-white/40
                      focus:outline-none focus:ring-2 focus:ring-terracotta-primary/50
                    "
                  />
                </div>
              </div>
              
              <button
                onClick={handleWhatsAppAuth}
                disabled={loading || !phoneNumber}
                className={`
                  w-full py-3 rounded-lg font-medium
                  flex items-center justify-center gap-2
                  transition-all duration-200
                  ${loading || !phoneNumber
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-terracotta-primary to-savanna-gold text-white hover:opacity-90'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    Continue with WhatsApp
                  </>
                )}
              </button>
              
              <button
                onClick={() => setCurrentStep('method')}
                className="w-full py-3 rounded-lg font-medium text-clay-white/60 hover:text-clay-white transition-colors"
              >
                Back to Methods
              </button>
            </motion.div>
          )}

          {/* Passkey Authentication */}
          {currentStep === 'passkey' && (
            <motion.div
              key="passkey"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Fingerprint className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-clay-white mb-2">Passkey Authentication</h3>
                <p className="text-clay-white/60">
                  Use your device's biometric sensor or security key to sign in
                </p>
              </div>
              
              <button
                onClick={handlePasskeyAuth}
                disabled={loading}
                className={`
                  w-full py-4 rounded-lg font-medium
                  flex items-center justify-center gap-3
                  transition-all duration-200
                  ${loading
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90'
                  }
                `}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-5 h-5" />
                    <span>Use Passkey</span>
                  </>
                )}
              </button>
              
              <button
                onClick={() => setCurrentStep('method')}
                className="w-full py-3 rounded-lg font-medium text-clay-white/60 hover:text-clay-white transition-colors"
              >
                Back to Methods
              </button>
            </motion.div>
          )}

          {/* Success State */}
          {currentStep === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-clay-white mb-2">Authentication Successful!</h3>
              <p className="text-clay-white/60 mb-6">
                Welcome to YOKK, {user?.username || 'Developer'}!
              </p>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta-primary"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="
                mt-4 p-3 rounded-lg
                bg-red-500/20 border border-red-500/30
                flex items-center gap-2
              "
            >
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-red-400">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}