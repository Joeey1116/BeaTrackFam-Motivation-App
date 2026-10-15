import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  useIAP,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases as queryAvailablePurchases,
  isUserCancelledError,
  type ProductSubscription,
  type Purchase,
  type PurchaseError,
} from 'react-native-iap';
import { setPlan } from './storage';

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

/** Friendly plan names per SKU (fallback when StoreKit gives no title). */
export const SKU_NAMES: Record<string, string> = {
  HAVENMONTH299: 'Monthly',
  HAVEN3MONTH799: '3 Months',
  HAVEN6MONTH1499: '6 Months',
  HAVEN1YEAR1999: 'Yearly',
  havenplus_monthly: 'Monthly',
  havenplus_3month: '3 Months',
  havenplus_6month: '6 Months',
  havenplus_yearly: 'Yearly',
};

/**
 * requestPurchase is EVENT-BASED in react-native-iap v17: the promise it
 * returns does not carry the outcome. The real result arrives through the
 * global purchaseUpdatedListener / purchaseErrorListener below.
 *
 * Module-level plumbing so every useHavenPlus() instance shares one
 * pending-purchase promise and one set of native listeners.
 */
type PendingPurchase = { sku: string; resolve: (ok: boolean) => void };
let pendingPurchase: PendingPurchase | null = null;
let globalListenersAttached = false;
// Always points at the latest hook instance's finishTransaction.
let finishTxRef: ((args: {
  purchase: Purchase;
  isConsumable?: boolean;
}) => Promise<void>) | null = null;

function settlePending(ok: boolean) {
  const p = pendingPurchase;
  pendingPurchase = null;
  if (p) p.resolve(ok);
}

export function useHavenPlus() {
  const {
    connected,
    subscriptions,
    requestPurchase,
    finishTransaction,
    fetchProducts,
  } = useIAP();

  const [productsLoading, setProductsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Keep the module-level finishTransaction pointer fresh so the global
  // purchase listener always finishes with a live function.
  useEffect(() => {
    finishTxRef = finishTransaction;
  });

  // Attach the global purchase/error listeners once per app session.
  // The purchase listener is the ONLY place Haven Plus gets granted:
  // only on a verified transaction whose productId is one of our SKUs.
  useEffect(() => {
    if (globalListenersAttached) return;
    globalListenersAttached = true;

    const updateSub = purchaseUpdatedListener(async (purchase: Purchase) => {
      try {
        const sku = purchase.productId;
        const isOurs = SKUS.includes(sku);
        if (isOurs) {
          // Finish FIRST so StoreKit never redelivers, then grant.
          try {
            await finishTxRef?.({ purchase, isConsumable: false });
          } catch (e) {
            console.error('[purchases] finishTransaction failed:', e);
          }
          await setPlan('haven-plus');
        } else {
          console.warn('[purchases] transaction for unknown SKU:', sku);
        }
        settlePending(isOurs);
      } catch (e) {
        console.error('[purchases] purchaseUpdatedListener failed:', e);
        settlePending(false);
      }
    });

    const errorSub = purchaseErrorListener((error: PurchaseError) => {
      if (!isUserCancelledError(error)) {
        console.error('[purchases] purchase error:', error?.code, error?.message);
      }
      settlePending(false);
    });

    return () => {
      updateSub.remove();
      errorSub.remove();
      globalListenersAttached = false;
    };
  }, []);

  // Prefetch StoreKit products once connected so the paywall never
  // opens on a cold fetch (the old "takes forever" sheet).
  useEffect(() => {
    if (!connected) return;
    let cancelled = false;
    (async () => {
      try {
        await fetchProducts({ skus: SKUS, type: 'subs' });
      } catch (e) {
        console.error('[purchases] fetchProducts failed:', e);
      } finally {
        if (!cancelled && mountedRef.current) setProductsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [connected, fetchProducts]);

  /**
   * Starts a purchase and resolves TRUE only when a verified transaction
   * for this SKU comes back through the purchase listener. Resolves FALSE
   * on user cancel or any failure — never grants on failure.
   */
  const purchase = useCallback(
    async (sku: string): Promise<boolean> => {
      if (pendingPurchase) {
        console.warn('[purchases] purchase already in flight — ignoring');
        return false;
      }
      setPurchasing(true);
      try {
        return await new Promise<boolean>((resolve) => {
          pendingPurchase = { sku, resolve };
          requestPurchase({
            request: {
              apple: { sku },
              google: { skus: [sku] },
            },
            type: 'subs',
          }).catch((e) => {
            // Synchronous launch failure (e.g. store not connected):
            // no sheet was ever shown, so no listener event will come.
            console.error('[purchases] requestPurchase threw:', e);
            settlePending(false);
          });
        });
      } finally {
        if (mountedRef.current) setPurchasing(false);
      }
    },
    [requestPurchase]
  );

  /**
   * Restores a previous purchase. Uses the query API directly (it returns
   * the purchase array) instead of the hook's availablePurchases STATE,
   * which would be stale immediately after the await — that race was the
   * old "restore never works" bug. Grants haven-plus on success.
   */
  const restore = useCallback(async (): Promise<boolean> => {
    try {
      const purchases = await queryAvailablePurchases();
      const ok = purchases.some((p) => SKUS.includes(p.productId));
      if (ok) {
        await setPlan('haven-plus');
      }
      return ok;
    } catch (e) {
      console.error('[purchases] restore failed:', e);
      return false;
    }
  }, []);

  // Sort subscriptions by price (ascending): Monthly → 3mo → 6mo → Yearly
  const sorted = [...subscriptions].sort((a, b) => {
    const priceA = typeof a.price === 'number' ? a.price : 0;
    const priceB = typeof b.price === 'number' ? b.price : 0;
    return priceA - priceB;
  });

  return {
    subscriptions: sorted as ProductSubscription[],
    /** True until the first product fetch completes (success or fail). */
    productsLoading,
    /** True while a purchase sheet round-trip is in flight. */
    purchasing,
    purchase,
    restore,
    finishTransaction,
  };
}
