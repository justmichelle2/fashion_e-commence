import { DEFAULT_LOCALE, normalizeLocale } from '../../i18n/settings'

export default function LegacyRegisterRedirect() {
  return null
}

export async function getServerSideProps({ req, query }) {
  const cookieLocale = req?.cookies?.NEXT_LOCALE
  const locale = normalizeLocale(cookieLocale, DEFAULT_LOCALE)
  const searchParams = new URLSearchParams(query).toString()
  return {
    redirect: {
      destination: `/${locale}/register${searchParams ? `?${searchParams}` : ''}`,
      permanent: false,
    },
  }
}
