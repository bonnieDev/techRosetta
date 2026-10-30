/**
 * Google Analytics stays off until it's allowed. Where consent is required, the
 * tag doesn't load at all until someone accepts. Elsewhere it loads unless
 * they've opted out. The regions still need attorney review.
 */

const KEY = 'tr-consent'

// EU, EEA, UK, Switzerland and Brazil
const CONSENT_COUNTRIES = new Set(
  'AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE IS LI NO GB CH BR'.split(' '),
)

/** An unknown country counts as required, so a missing header fails safe. */
export function consentRequired(country: string | null) {
  return !country || CONSENT_COUNTRIES.has(country.toUpperCase())
}

/** Runs in <head> before anything else, so it can't use imports. */
export function gaBootstrap(id: string, required: boolean) {
  return `(function(){
var id=${JSON.stringify(id)},required=${required};
window.trStartGA=function(){
  if(window.gtag||!id)return;
  window.dataLayer=window.dataLayer||[];
  window.gtag=function(){dataLayer.push(arguments)};
  gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  gtag('js',new Date());
  gtag('config',id);
  var s=document.createElement('script');
  s.async=true;
  s.src='https://www.googletagmanager.com/gtag/js?id='+id;
  document.head.appendChild(s);
};
var choice=null;
try{choice=localStorage.getItem(${JSON.stringify(KEY)})}catch(e){}
if(choice==='granted'||(!required&&choice!=='denied'))trStartGA();
})();`
}

declare global {
  interface Window {
    trStartGA?: () => void
  }
}

export function storedChoice() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function remember(choice: 'granted' | 'denied') {
  try {
    localStorage.setItem(KEY, choice)
  } catch {}
}

export function allowAnalytics() {
  remember('granted')
  window.trStartGA?.()
  window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
  window.dispatchEvent(new Event('tr:analytics-allowed'))
}

export function refuseAnalytics() {
  remember('denied')
  window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  // stops anything further being sent, and clears what was already stored
  window.gtag = undefined
  const domain = location.hostname.replace(/^www\./, '')
  for (const part of document.cookie.split('; ')) {
    const name = part.split('=')[0]
    if (name === '_ga' || name.startsWith('_ga_')) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${domain}`
      document.cookie = `${name}=; Max-Age=0; path=/`
    }
  }
}
