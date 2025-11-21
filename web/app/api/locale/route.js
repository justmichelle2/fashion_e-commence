import { NextResponse } from 'next/server'
import { LOCALE_COOKIE, normalizeLocale } from '../../../i18n/settings'

export async function POST(request) {
  try {
    const body = await request.json()
    const requested = normalizeLocale(body?.locale)
    const response = NextResponse.json({ locale: requested })
    response.cookies.set(LOCALE_COOKIE, requested, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
    return response
  } catch (error) {
    return NextResponse.json({ error: 'Invalid locale payload' }, { status: 400 })
  }
}
