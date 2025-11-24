import { redirect } from 'next/navigation'
import { DEFAULT_LOCALE } from '../i18n/settings'

export default function IndexRedirect() {
  redirect(`/${DEFAULT_LOCALE}`)
}
