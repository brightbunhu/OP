'use client';

import React, { useState, useEffect } from 'react';
import { Download, Bell, X, ShieldAlert, Sparkles } from 'lucide-react';

export default function PwaProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('PWA Service Worker registered with scope:', registration.scope);
            checkSubscription(registration);
          })
          .catch((err) => {
            console.error('PWA Service Worker registration failed:', err);
          });
      });
    }

    // 2. Capture Install Prompt Event
    const handleInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show install banner if they haven't dismissed it in this session
      if (!sessionStorage.getItem('pwa-install-dismissed')) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleInstallPrompt);
    };
  }, []);

  // Check if user is already subscribed to push notifications
  const checkSubscription = async (registration: ServiceWorkerRegistration) => {
    try {
      if (!registration.pushManager) return;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      
      // If notification permission is default, suggest enabling them after a short delay
      if (Notification.permission === 'default' && !sessionStorage.getItem('pwa-push-dismissed')) {
        setTimeout(() => {
          setShowNotificationBanner(true);
        }, 5000);
      }
    } catch (e) {
      console.warn('Error checking push subscription:', e);
    }
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    sessionStorage.setItem('pwa-install-dismissed', 'true');
    setShowInstallBanner(false);
  };

  const handleDismissPush = () => {
    sessionStorage.setItem('pwa-push-dismissed', 'true');
    setShowNotificationBanner(false);
  };

  // Subscribe user to Push Notifications
  const subscribeToPush = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission denied.');
        setShowNotificationBanner(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      if (!registration.pushManager) {
        alert('Push notifications not supported on this browser.');
        return;
      }

      // Fetch public VAPID key dynamically from the backend
      const vapidRes = await fetch('/api/push/vapid');
      if (!vapidRes.ok) throw new Error('Could not load VAPID settings from server.');
      const { publicKey: vapidPublicKey } = await vapidRes.json();
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send subscription to backend
      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      if (res.ok) {
        setIsSubscribed(true);
        setShowNotificationBanner(false);
        // Show local confirmation notification
        registration.showNotification('Subscribed!', {
          body: 'You will now receive notifications from OP Supermarket.',
          icon: '/icons/icon-192.png'
        });
      } else {
        throw new Error('Subscription API returned error status');
      }
    } catch (e) {
      console.error('Failed to subscribe to push notifications:', e);
      alert('Error subscribing to notifications. Please try again.');
    }
  };

  // Helper function to decode VAPID keys
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  return (
    <>
      {children}

      {/* 1. Install App Banner Prompt */}
      {showInstallBanner && (
        <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50 rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 print:hidden">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-sm">Install OP Supermarket</h4>
                <button onClick={handleDismissInstall} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Add to your home screen for offline browsing, faster load times, and a full native application experience.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 rounded-xl bg-primary text-primary-foreground text-xs font-bold py-2 hover:bg-primary/90 transition shadow-sm"
                >
                  Install Now
                </button>
                <button
                  onClick={handleDismissInstall}
                  className="px-3 rounded-xl bg-muted text-muted-foreground text-xs font-semibold py-2 hover:bg-muted/80 transition"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Enable Notifications Toast Banner */}
      {showNotificationBanner && !isSubscribed && (
        <div className="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-96 z-50 rounded-3xl border border-border bg-card/95 backdrop-blur-xl p-5 shadow-2xl animate-in slide-in-from-bottom-5 duration-300 print:hidden">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-500 shrink-0">
              <Bell className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-sm">Enable Deal Alerts</h4>
                <button onClick={handleDismissPush} className="text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Never miss low stock warnings, flash sales, and order shipping notifications. Enable push alerts.
              </p>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={subscribeToPush}
                  className="flex-1 rounded-xl bg-indigo-600 text-white text-xs font-bold py-2 hover:bg-indigo-700 transition shadow-sm"
                >
                  Enable Alerts
                </button>
                <button
                  onClick={handleDismissPush}
                  className="px-3 rounded-xl bg-muted text-muted-foreground text-xs font-semibold py-2 hover:bg-muted/80 transition"
                >
                  No Thanks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
