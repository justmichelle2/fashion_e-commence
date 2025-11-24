import {createSharedPathnamesNavigation} from 'next-intl/navigation'
import {SUPPORTED_LOCALES} from './i18n/settings'

const LOCALE_CODES = SUPPORTED_LOCALES.map((entry) => entry.code)

export const {Link, redirect, usePathname, useRouter, permanentRedirect} =
  createSharedPathnamesNavigation({locales: LOCALE_CODES})
