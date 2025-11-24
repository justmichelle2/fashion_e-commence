// i18n/request-config.js
const { default: config } = require('./config')

// This function reads the locale from the request headers or cookies
export default async function getRequestConfig(request) {
  // Default locale
  let locale = config.defaultLocale

  try {
    // If a request is provided (Server Component), check headers
    if (request?.headers) {
      const acceptLanguage = request.headers.get('accept-language')
      if (acceptLanguage) {
        const preferred = acceptLanguage.split(',')[0].split('-')[0]
        if (config.locales.includes(preferred)) {
          locale = preferred
        }
      }
    }
  } catch (err) {
    console.warn('Error detecting locale, using default.', err)
  }

  return { locale }
}
