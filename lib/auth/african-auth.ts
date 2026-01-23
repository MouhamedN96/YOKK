import { createClient } from '@/lib/supabase/client';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

/**
 * Authentication utilities for African market
 * Implements WhatsApp Auth and Passkeys for improved conversion
 */

const supabase = createClient();

// WhatsApp Authentication
export class WhatsAppAuth {
  /**
   * Initiate WhatsApp authentication flow
   * For Phase 1.3, we use SMS OTP as the reliable fallback since 
   * direct WhatsApp OTP requires Meta Business verification.
   */
  static async signInWithWhatsApp(phoneNumber: string): Promise<{ data?: any; error?: any }> {
    try {
      // 1. Sanitize input (remove spaces, ensure + prefix)
      const sanitized = AuthUIHelper.formatPhoneNumber(phoneNumber);
      
      // 2. Trigger OTP via Supabase (SMS)
      // Note: To send via WhatsApp, we would need a custom Edge Function 
      // wrapping a provider like Twilio/Infobip.
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: sanitized,
        options: {
          channel: 'sms', // Can be toggled to 'whatsapp' if provider configured
        }
      });
      
      return { data, error };
    } catch (error) {
      console.error('WhatsApp auth error:', error);
      return { error };
    }
  }

  /**
   * Verify WhatsApp number through OTP
   */
  static async verifyWithWhatsAppOTP(phoneNumber: string, otp: string): Promise<{ data?: any; error?: any }> {
    try {
      const sanitized = AuthUIHelper.formatPhoneNumber(phoneNumber);
      
      const { data, error } = await supabase.auth.verifyOtp({
        phone: sanitized,
        token: otp,
        type: 'sms',
      });
      
      return { data, error };
    } catch (error) {
      console.error('WhatsApp OTP verification error:', error);
      return { error };
    }
  }
}

// Passkey Authentication (WebAuthn)
export class PasskeyAuth {
  /**
   * Register a new passkey for the user
   */
  static async registerPasskey(username: string): Promise<{ data?: any; error?: any }> {
    try {
      if (!this.isWebAuthnSupported()) {
        throw new Error('Passkeys are not supported in this browser');
      }

      // 1. Get Registration Options
      const resp = await fetch('/api/auth/passkey/register-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }), // User ID inferred from session cookie
      });

      if (!resp.ok) throw new Error('Failed to get registration options');
      const options = await resp.json();

      // 2. Create Credential (Browser Interaction)
      const attResp = await startRegistration(options);

      // 3. Verify Registration
      const verificationResp = await fetch('/api/auth/passkey/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: attResp,
          challenge: options.challenge // In prod, this verification happens purely server-side via DB lookup
        }),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        return { data: verificationJSON };
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Passkey registration error:', error);
      return { error };
    }
  }

  /**
   * Authenticate user with existing passkey
   */
  static async authenticateWithPasskey(): Promise<{ data?: any; error?: any }> {
    try {
      if (!this.isWebAuthnSupported()) {
        throw new Error('Passkeys are not supported in this browser');
      }

      // 1. Get Auth Options
      const resp = await fetch('/api/auth/passkey/authenticate-options');
      if (!resp.ok) throw new Error('Failed to get auth options');
      const options = await resp.json();

      // 2. Get Assertion (Browser Interaction)
      const asseResp = await startAuthentication(options);

      // 3. Verify Authentication
      const verificationResp = await fetch('/api/auth/passkey/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: asseResp,
          challenge: options.challenge
        }),
      });

      const verificationJSON = await verificationResp.json();

      if (verificationJSON.verified) {
        // Reload page or handle session update
        return { data: verificationJSON };
      } else {
        throw new Error('Verification failed');
      }
    } catch (error) {
      console.error('Passkey authentication error:', error);
      return { error };
    }
  }

  static isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' && 
           !!(window.PublicKeyCredential && 
           typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function');
  }
}

// Combined authentication manager for African market
export class AfricanAuthManager {
  static getRecommendedAuthMethods(): Array<'email' | 'phone' | 'whatsapp' | 'passkey'> {
    const methods: Array<'email' | 'phone' | 'whatsapp' | 'passkey'> = [];
    methods.push('whatsapp'); // Priorities
    methods.push('phone');
    if (PasskeyAuth.isWebAuthnSupported()) {
      methods.push('passkey');
    }
    methods.push('email');
    return methods;
  }

  static async signInWithRecommendedMethod(
    identifier: string, 
    method?: 'email' | 'phone' | 'whatsapp' | 'passkey'
  ): Promise<{ data?: any; error?: any }> {
    const authMethod = method || this.getRecommendedAuthMethods()[0];
    
    switch (authMethod) {
      case 'whatsapp':
        return await WhatsAppAuth.signInWithWhatsApp(identifier);
      case 'passkey':
        return await PasskeyAuth.authenticateWithPasskey();
      case 'phone':
        // Standard SMS OTP
        return await supabase.auth.signInWithOtp({ phone: AuthUIHelper.formatPhoneNumber(identifier) });
      case 'email':
      default:
        // Magic Link
        return await supabase.auth.signInWithOtp({ email: identifier });
    }
  }
}

// Utility functions for auth UI
export class AuthUIHelper {
  static getLocalizedLabels(languageCode: string = 'en'): Record<string, string> {
    const labels: Record<string, Record<string, string>> = {
      en: {
        whatsappSignIn: 'Continue with WhatsApp',
        passkeySignIn: 'Sign in with Face ID/Touch ID',
        phoneSignIn: 'Continue with Phone Number',
        emailSignIn: 'Continue with Email',
        otpPlaceholder: 'Enter 6-digit code',
        sendCode: 'Send Code',
        verify: 'Verify',
      },
      fr: {
        whatsappSignIn: 'Continuer avec WhatsApp',
        passkeySignIn: 'Se connecter avec Face ID/Touch ID',
        phoneSignIn: 'Continuer avec le numéro de téléphone',
        emailSignIn: 'Continuer avec Email',
        otpPlaceholder: 'Entrez le code à 6 chiffres',
        sendCode: 'Envoyer le code',
        verify: 'Vérifier',
      },
    };
    return labels[languageCode] || labels.en;
  }

  static formatPhoneNumber(phone: string, countryCode: string = 'NG'): string {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Basic formatting logic for common African codes
    if (cleanPhone.startsWith('+')) return cleanPhone;
    
    switch (countryCode) {
      case 'NG': 
        if (cleanPhone.length === 10) return `+234${cleanPhone}`;
        if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) return `+234${cleanPhone.substring(1)}`;
        break;
      case 'KE': 
        if (cleanPhone.length === 9) return `+254${cleanPhone}`;
        if (cleanPhone.length === 10 && cleanPhone.startsWith('0')) return `+254${cleanPhone.substring(1)}`;
        break;
      // Add more as needed
    }
    return cleanPhone.startsWith('+') ? cleanPhone : `+${cleanPhone}`;
  }
}
