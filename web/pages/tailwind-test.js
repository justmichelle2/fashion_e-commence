import { useMemo } from 'react'
import Link from 'next/link'
import { useLocale } from '../components/LocaleProvider'

export default function TailwindTest(){
  const { t } = useLocale()
  const strings = useMemo(
    () => ({
      title: t('pages.tailwind.title', 'Tailwind is working 🎉'),
      body: t('pages.tailwind.body', 'If you can see this colorful card, Tailwind CSS is applied.'),
      cta: t('pages.tailwind.cta', 'Go to catalog'),
    }),
    [t],
  )

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-gradient-to-br from-indigo-600 to-pink-500 text-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">{strings.title}</h1>
        <p className="opacity-90">{strings.body}</p>
        <div className="mt-4">
          <Link className="inline-block px-4 py-2 bg-white text-indigo-700 rounded hover:opacity-90 transition" href="/catalog">
            {strings.cta}
          </Link>
        </div>
      </div>
    </main>
  )
}
