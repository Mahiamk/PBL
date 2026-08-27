import { track } from '@vercel/analytics';

/**
 * Tracks a custom event in Vercel Analytics.
 * @param {string} eventName - Name of the custom event (e.g., 'cart_checkout', 'user_login', 'item_added_to_cart')
 * @param {Record<string, string | number | boolean | null>} [properties] - Optional event metadata properties
 */
export const trackEvent = (eventName, properties = {}) => {
  try {
    track(eventName, properties);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[Analytics] Failed to track event "${eventName}":`, error);
    }
  }
};

export default { trackEvent };
