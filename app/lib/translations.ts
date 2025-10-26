// Translation loader utility
import enCommon from '../../public/locales/en/common.json'
import arCommon from '../../public/locales/ar/common.json'
import enAdmin from '../../public/locales/en/admin.json'
import arAdmin from '../../public/locales/ar/admin.json'
import enPartner from '../../public/locales/en/partner.json'
import arPartner from '../../public/locales/ar/partner.json'
import enPortfolio from '../../public/locales/en/portfolio.json'
import arPortfolio from '../../public/locales/ar/portfolio.json'
import enAdvisor from '../../public/locales/en/advisor.json'
import arAdvisor from '../../public/locales/ar/advisor.json'
import enPortfolioAdvisor from '../../public/locales/en/portfolio-advisor.json'
import arPortfolioAdvisor from '../../public/locales/ar/portfolio-advisor.json'

export type Language = 'ar' | 'en'
export type Portal = 'common' | 'admin' | 'partner' | 'portfolio' | 'advisor'

// Portal-specific translations
const portalTranslations = {
  en: {
    common: enCommon,
    admin: enAdmin,
    partner: enPartner,
    portfolio: enPortfolio,
    advisor: { ...enAdvisor, ...enPortfolioAdvisor }
  },
  ar: {
    common: arCommon,
    admin: arAdmin,
    partner: arPartner,
    portfolio: arPortfolio,
    advisor: { ...arAdvisor, ...arPortfolioAdvisor }
  }
}

// Legacy support - default to common translations
export const translations = {
  en: enCommon,
  ar: arCommon
}

export function getTranslations(locale: Language, portal: Portal = 'common') {
  return portalTranslations[locale]?.[portal] || portalTranslations.ar.common
}

// Enhanced function to get translations with portal support
export function getPortalTranslations(locale: Language, portal: Portal) {
  const portalTrans = portalTranslations[locale]?.[portal] || portalTranslations.ar[portal]
  const commonTrans = portalTranslations[locale]?.common || portalTranslations.ar.common
  
  // Merge portal-specific translations with common ones (portal takes precedence)
  return {
    ...commonTrans,
    ...portalTrans
  }
}

// Detect portal from current path
export function detectPortalFromPath(pathname: string): Portal {
  if (pathname.startsWith('/admin')) return 'admin'
  if (pathname.startsWith('/partner')) return 'partner'
  if (pathname.startsWith('/portfolio')) return 'portfolio'
  if (pathname.startsWith('/portfolio-advisor')) return 'advisor'
  // Investment pages should use portfolio translations since they're investor-focused
  if (pathname.includes('/invest')) return 'portfolio'
  // Deal manager pages should use partner translations
  if (pathname.startsWith('/deal-manager')) return 'partner'
  // Financial officer pages should use admin translations  
  if (pathname.startsWith('/financial-officer')) return 'admin'
  return 'common'
}

export function translateKey(key: string, locale: Language, portal: Portal = 'common'): string {
  const t = getTranslations(locale, portal)
  const keys = key.split('.')
  let value: any = t
  
  for (const k of keys) {
    value = value?.[k]
  }
  
  return typeof value === 'string' ? value : key
}