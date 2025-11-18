import Image from 'next/image'
import Link from 'next/link'

export default function Hero({title='New season arrivals', subtitle='Refined pieces, conscious design', ctas=[{label:'Shop Women', href:'/catalog'},{label:'Shop Men', href:'/catalog?gender=men'}]}){
  return (
    <section className="w-full hero-gradient rounded-lg p-8 md:p-12 mb-8 overflow-hidden">
      <div className="container mx-auto flex flex-col lg:flex-row items-start gap-8">
        <div className="lg:w-1/2">
          <h1 className="text-4xl md:text-5xl font-serif leading-tight mb-4">{title}</h1>
          <p className="text-lg mb-6 opacity-90">{subtitle}</p>
          <div className="flex gap-3">
            {ctas.map((c,i)=> (
              <Link key={i} href={c.href} className="btn-primary">{c.label}</Link>
            ))}
          </div>
        </div>

        <div className="lg:w-1/2 hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            <div className="card card-hover p-2">
              <div className="relative w-full h-64">
                <Image
                  src="/images/sample1.svg"
                  alt="hero1"
                  fill
                  priority
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="card card-hover p-2">
              <div className="relative w-full h-64">
                <Image
                  src="/images/sample2.svg"
                  alt="hero2"
                  fill
                  priority
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
