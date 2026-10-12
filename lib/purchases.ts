import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as InAppPurchases from 'expo-in-app-purchases';

// Product IDs from App Store Connect (Joey set up 2026-10-12)
export const HAVEN_PLUS_PRODUCTS = {
  ios: [
    'HAVENMONTH299',    // $2.99/month
    'HAVEN3MONTH799',   // $7.99/3 months
    'HAVEN6MONTH1499',  // $14.99/6 months
    'HAVEN1YEAR1999',   // $19.99/year
  ],
  android: [
    // TODO: Joey to provide from Play Console
    'havenplus.monthly',
    'havenplus.3month',
    'havenplus.6month',
    'havenplus.yearly',
  ],
};

export interface Product {
  productId: string;
  title: string;
  description: string;
  price: string;
}

export function useHavenPlus() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    init();
    return () => {
      InAppPurchases.disconnectAsync();
    };
  }, []);

  const init = async () => {
    try {
      await InAppPurchases.connectAsync();
      const ids = Platform.OS === 'ios'
        ? HAVEN_PLUS_PRODUCTS.ios
        : HAVEN_PLUS_PRODUCTS.android;

      const { responseCode, results } = await InAppPurchases.getProductsAsync(ids);

      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        setProducts(results.map((p) => ({
          productId: p.productId,
          title: p.title,
          description: p.description || '',
          price: p.price || '',
        })));
      }
    } catch (e) {
      console.error('IAP init failed:', e);
    } finally {
      setLoading(false);
    }

    // Listen for purchase updates
    InAppPurchases.setPurchaseListener(({ responseCode, results, errorCode }) => {
      if (responseCode === InAppPurchases.IAPResponseCode.OK) {
        results?.forEach(async (purchase) => {
          if (!purchase.acknowledged) {
            await InAppPurchases.finishTransactionAsync(purchase, true);
            // TODO: verify receipt with server, update plan to haven-plus
          }
        });
      }
      setPurchasing(false);
    });
  };

  const purchase = async (productId: string) => {
    setPurchasing(true);
    try {
      await InAppPurchases.purchaseItemAsync(productId);
    } catch (e) {
      console.error('Purchase failed:', e);
      setPurchasing(false);
    }
  };

  const restore = async () => {
    try {
      const { responseCode, results } = await InAppPurchases.getPurchaseHistoryAsync();
      if (responseCode === InAppPurchases.IAPResponseCode.OK && results) {
        // Check if user has active Haven Plus
        return results.length > 0;
      }
    } catch (e) {
      console.error('Restore failed:', e);
    }
    return false;
  };

  return { products, loading, purchasing, purchase, restore };
}
