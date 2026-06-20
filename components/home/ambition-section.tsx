export function AmbitionSection() {
  return (
    <section className="relative overflow-hidden py-40">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2000"
          alt="Luxury interior"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <span className="mb-6 block text-[10px] font-bold tracking-[0.4em] text-accent uppercase">
          The Rise Lifestyle
        </span>
        <h2 className="mb-8 font-serif text-4xl leading-tight font-light tracking-wide text-white md:text-6xl">
          Where Ambition Meets <br />
          <span className="text-accent italic">Exceptional Living</span>
        </h2>
        <p className="text-lg leading-relaxed font-light text-white/86">
          Qatar&apos;s luxury real estate landscape is evolving. Rise Property
          stands at the forefront, connecting discerning clients with
          properties that define the pinnacle of modern living.
        </p>
      </div>
    </section>
  );
}
