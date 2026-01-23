'use client';

import { useEffect } from 'react';
import { getYOKKSystem } from '@/lib/yokk-unified-system';

export default function YOKKInitializer() {
  useEffect(() => {
    // Initialize the YOKK unified system when the component mounts
    const initYOKK = async () => {
      try {
        const yokkSystem = await getYOKKSystem();
        console.log('✅ YOKK Unified System initialized');
        
        // Log system health for debugging
        const health = await yokkSystem.getSystemHealth();
        console.log('📊 YOKK System Health:', health);
      } catch (error) {
        console.error('❌ Failed to initialize YOKK System:', error);
      }
    };

    initYOKK();
  }, []);

  return null; // This component doesn't render anything
}