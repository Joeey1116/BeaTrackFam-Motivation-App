import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { useIAP, type ProductSubscription } from 'react-native-iap';

// Product IDs from App Store Connect (Joey set up 2026-10-12)
// iOS: HAVENMONTH299, HAVEN3MONTH799, HAVEN6MONTH1499, HAVEN1YEAR1999
const IOS_SKUS = [
  'HAVENMONTH299',
  'HAVEN3MONTH799',
  'HAVEN6MONTH1499',
  'HAVEN1YEAR1999',
];

// Android: Joey to provide from Play Console after uploading build with billing
const ANDROID_SKUS = [
  'havenplus_monthly',
  'havenplus_3month',
  'havenplus_6month',
  'havenplus_yearly',
];

export const SKUS = Platform.OS === 'ios' ? IOS_SKUS : ANDROID_SKUS;

export function useHavenPlus() {
  const {
    connected,
    subscriptions,
    availablePurchases,
    requestPurchase,
    finishTransaction,
    getAvailablePurchases,
    fetchProducts,
  } = useIAP();

  // Fetch our subscription products once connected
  useEffect(() => {
    if (connected) {
      fetchProducts({ skus: SKUS, type: 'subs' }).catch((e) =>
        console.error('Failed to fetch products:', e)
      );
    }
  }, [connected]);

  const purchase = async (sku: string) => {
    try {
      await requestPurchase({
        request: {
          apple: { sku },
          google: { skus: [sku] },
        },
        type: 'subs',
      });
    } catch (e: any) {
      if (e?.code !== 'E_USER_CANCELLED') {
        console.error('Purchase failed:', e);
      }
    }
  };

  const restore = async (): Promise<boolean> => {
    try {
      await getAvailablePurchases();
      return availablePurchases.some((p) => SKUS.includes(p.productId));
    } catch (e) {
      console.error('Restore failed:', e);
      return false;
    }
  };

  // Sort subscriptions by price (ascending)
  const sorted = [...subscriptions].sort((a, b) => {
    const priceA = a.price || 0;
    const priceB = b.price || 0;
    return priceA - priceB;
  });

  return {
    subscriptions: sorted as ProductSubscription[],
    loading: !connected,
    purchase,
    restore,
    finishTransaction,
  };
}
