import Link from 'next/link'

export default function TailwindTest(){
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-gradient-to-br from-indigo-600 to-pink-500 text-white p-10 rounded-2xl shadow-xl">
        <h1 className="text-4xl font-extrabold mb-2">Tailwind is working 🎉</h1>
        <p className="opacity-90">If you can see this colorful card, Tailwind CSS is applied.</p>
        <div className="mt-4">
          <Link className="inline-block px-4 py-2 bg-white text-indigo-700 rounded hover:opacity-90 transition" href="/catalog">
            Go to catalog
          </Link>
        </div>
      </div>
    </main>
  )
}
