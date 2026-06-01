/**
 * PostHog Analytics - Self-hosted or Cloud free tier
 * Tracks page views and custom events for conversion analysis
 */

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

// PostHog project config (free tier: 1M events/month)
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com'

// Type declarations for window
declare global {
  interface Window {
    posthog?: any
  }
}

/**
 * Load PostHog script (client-side only)
 */
export function loadPostHog() {
  if (typeof window === 'undefined' || POSTHOG_KEY === '') return

  // Check if already loaded
  if (window.posthog) return

  const script = document.createElement('script')
  script.innerHTML = `
    !function(t,e){var o,n,p,r;e.__SV||((window.posthog=e).init=function(v,i,s){
      function g(t,e){var o={};return e.split(",").forEach(function(t){o[t.split("=")[0]]=t.split("=")[1]}),o}
      function a(t,e){return t instanceof RegExp?t:new RegExp("^"+e.replace(/\\[\\[\\]]/g,"\\\\$&").replace(/\\*/g,".*")+"$")}
      function u(t,e,o,n){if(!e)return!1;if(t===e)return!0;if("object"!=typeof e)return!1;for(var r in e)if(t[r]!==e[r])return!1;if(o)for(r=0;r<o.length;r++)if(t[o[r]]!==e[o[r]])return!1;if(n)for(r=0;r<n.length;r++)if(!u(t,n[r],n[r+1]))return!1;return!0}function h(t){return!t||"object"!=typeof t?"":JSON.stringify(t)}
      (o=document.createElement("script")).type="text/javascript",o.async=!0,o.src=i||"/static/instrument.min.js",
      (p=document.getElementsByTagName("script")[0]).parentNode.insertBefore(o,p),
      (n=e.__SV=e.__SV||{})[v]=n[v]||{},(r=e.__SV)._i=r._i||[],r._i.push([v,s,n]),
      n[t].init=n[t].init||function(){n[t].init=n[t]||function(){n[t]=n[t]||function(){var t=n[t];t.people=t.people||[],t.toString=function(t){var e="posthog";return n[t]!==e&&(e+="|"+n[t]),e},t.people.toString=function(){return t.toString(1)+".people (stub)"},t.people.toString=function(){return t.toString(1)+".people (stub)"}}()},n[t].init()},n[t].people.toString=function(){return n[t].toString(1)+".people (stub)"}},n[t].init()
    })("posthog","${POSTHOG_HOST}",{api_host:"${POSTHOG_HOST}",persistence:"localStorage+cookie",capture_pageview:!1});
  `
  document.head.appendChild(script)
}

/**
 * Track a custom event
 */
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture(event, {
      ...properties,
      timestamp: new Date().toISOString(),
    })
  }
}

/**
 * Identify a user
 */
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.identify(userId, properties)
  }
}

/**
 * Reset user tracking (on logout)
 */
export function resetTracking() {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.reset()
  }
}

/**
 * React hook for page view tracking
 */
export function usePageViewTracking() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.posthog) {
      window.posthog.capture('$pageview', {
        $current_url: pathname,
        path: pathname,
      })
    }
  }, [pathname])
}

// Pre-defined events for DomPlace
export const AnalyticsEvents = {
  // User actions
  USER_SIGN_UP: 'user_sign_up',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',

  // Commerce
  PRODUCT_VIEW: 'product_view',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  COMPLETE_ORDER: 'complete_order',
  CANCEL_ORDER: 'cancel_order',

  // Engagement
  SEARCH: 'search',
  FILTER_CATEGORY: 'filter_category',
  TOGGLE_FAVORITE: 'toggle_favorite',
  SHARE_PRODUCT: 'share_product',
  APPLY_COUPON: 'apply_coupon',

  // Store
  STORE_VIEW: 'store_view',
  STORE_SEARCH: 'store_search',

  // Conversion funnel
  HOMEPAGE_VIEW: 'homepage_view',
  PRODUCT_LIST_VIEW: 'product_list_view',
  CART_VIEW: 'cart_view',
  CHECKOUT_STARTED: 'checkout_started',
  PAYMENT_STARTED: 'payment_started',

  // App
  PWA_INSTALL_PROMPT_SHOWN: 'pwa_install_prompt_shown',
  PWA_INSTALLED: 'pwa_installed',
} as const
