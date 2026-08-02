import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from '../api/api'
import featureImg from '../assets/images/abc.png'
import plumberImg from '../assets/images/background.jpg'
import electricianImg from '../assets/images/electrician.jpg'
import cleaningImg from '../assets/images/cleaning.jpg'
import Reveal from '../components/home/Reveal'
import Counter from '../components/home/Counter'
import {
  ShieldCheck,
  Zap,
  CreditCard,
  MapPin,
  Clock,
  Star,
  ClipboardList,
  CalendarClock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  BadgeCheck,
  Quote,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Static content                                                     */
/* ------------------------------------------------------------------ */

const FEATURES = [
  { icon: ShieldCheck, title: 'Verified, not just listed', desc: 'Every provider is manually reviewed and approved by our admin team before they can accept a single booking.' },
  { icon: Zap, title: 'Book in under a minute', desc: 'Pick a service, pick a slot, done. No phone tag, no waiting on hold for a callback.' },
  { icon: CreditCard, title: 'Secure Razorpay checkout', desc: 'Pay by UPI, card, or net banking through encrypted, PCI-compliant payment flows.' },
  { icon: MapPin, title: 'Local, not generic', desc: 'Search by pincode to find professionals who actually serve your street, not just your city.' },
  { icon: Clock, title: 'Real-time status', desc: 'Track every booking from requested to completed, right from your personal dashboard.' },
  { icon: Star, title: 'Reviewed by real customers', desc: 'Ratings only come from verified, completed bookings — no fake five-star padding.' },
]

const STEPS = [
  { icon: ClipboardList, title: 'Book', desc: 'Tell us what you need — plumbing, electrical, or cleaning — and we match you with nearby verified pros.' },
  { icon: CalendarClock, title: 'Schedule', desc: 'Pick a date and time that works for you. Your provider confirms and you\u2019re set.' },
  { icon: Sparkles, title: 'Relax', desc: 'Sit back while a background-checked professional takes care of the job, start to finish.' },
]

const STATS = [
  { value: 10000, suffix: '+', label: 'Bookings completed' },
  { value: 500, suffix: '+', label: 'Verified professionals' },
  { value: 50, suffix: '+', label: 'Cities served' },
  { value: 4.8, suffix: '/5', label: 'Average rating', decimals: 1 },
]

const BENEFITS = [
  { title: 'Quick response time', desc: 'We prioritize efficiency, so you get a prompt reply and a fast resolution for every request.' },
  { title: 'Wide range of services', desc: 'Plumbing, electrical, cleaning, or almost any household need — our experts are ready to help.' },
  { title: 'Transparent pricing', desc: 'No hidden fees. You see clear, upfront pricing before you ever confirm a booking.' },
  { title: 'Real-time booking updates', desc: 'Track your booking status and get timely updates so you\u2019re never left guessing.' },
  { title: 'Satisfaction guarantee', desc: 'Not happy with the job? We\u2019ll make it right — your peace of mind is the whole point.' },
]

const TESTIMONIALS = [
  { name: 'Priya Nair', role: 'Homeowner, Mumbai', quote: 'Our kitchen tap burst on a Sunday night. I booked a plumber on Local Guardian and someone verified was at our door in under an hour.', rating: 5 },
  { name: 'Rohan Mehta', role: 'Homeowner, Pune', quote: 'The electrician showed up on time, explained exactly what was wrong with our wiring, and the price matched the quote. No surprises.', rating: 5 },
  { name: 'Ayesha Khan', role: 'Homeowner, Bengaluru', quote: 'I love that I can track the booking status in real time. Booked a deep cleaning before a family visit and it was spotless.', rating: 4 },
]

const FAQS = [
  { q: 'How are service providers verified?', a: 'Every provider account starts as inactive. Our admin team reviews registration details before activating the account, and only active, approved providers can receive or accept bookings.' },
  { q: 'Is my payment secure?', a: 'Yes. All payments run through Razorpay with encrypted checkout and signature verification, so your booking is only confirmed after a payment is validated on our backend.' },
  { q: 'Can I reschedule or cancel a booking?', a: 'You can manage upcoming bookings from your dashboard. Availability for changes depends on the provider\u2019s schedule, so we recommend updating as early as possible.' },
  { q: 'Which areas do you currently serve?', a: 'Coverage depends on active providers in your pincode. Use the search on the Services page to check who\u2019s currently available near you.' },
  { q: 'How do I become a service provider?', a: 'Register through the provider sign-up flow. Your profile stays inactive until an admin verifies your details, after which you can start accepting bookings.' },
  { q: 'What if I\u2019m not satisfied with the service?', a: 'Leave a review and reach out through support. We stand behind every booking with a satisfaction guarantee and will help make it right.' },
]

/* ------------------------------------------------------------------ */

export default function Home() {
  const [services, setServices] = useState([])
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    api.get('/api/services')
      .then((r) => {
        const items = Array.isArray(r.data) ? r.data : r.data.value || []
        setServices(items.slice(0, 3))
      })
      .catch(() => setServices([]))
  }, [])

  const getServiceImage = (serviceName = '') => {
    if (serviceName.toLowerCase().includes('plumber')) return plumberImg
    if (serviceName.toLowerCase().includes('electric')) return electricianImg
    return cleaningImg
  }

  const spawnRipple = (e) => {
    const btn = e.currentTarget
    const circle = document.createElement('span')
    const diameter = Math.max(btn.clientWidth, btn.clientHeight)
    circle.className = 'ripple'
    circle.style.width = circle.style.height = `${diameter}px`
    circle.style.left = `${e.clientX - btn.getBoundingClientRect().left - diameter / 2}px`
    circle.style.top = `${e.clientY - btn.getBoundingClientRect().top - diameter / 2}px`
    btn.appendChild(circle)
    setTimeout(() => circle.remove(), 650)
  }

  return (
    <div className="app-bg overflow-x-hidden font-body text-white">
      {/* ============================= HERO ============================= */}
      <section className="relative pb-24 pt-16 md:pb-32 md:pt-24">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-grid" />
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-500/30 blur-3xl animate-blob" />
          <div className="absolute top-24 -right-16 h-96 w-96 rounded-full bg-primary-600/25 blur-3xl animate-blob [animation-delay:2s]" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl animate-blob [animation-delay:4s]" />
        </div>

        <div className="container relative mx-auto px-6 text-center">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-300 backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5 text-accent-400" />
              Admin-verified professionals only
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.12] sm:text-5xl lg:text-6xl">
              Home repairs, handled by
              <span className="block gradient-text animate-gradient-x">people you can trust.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
              Local Guardian connects you with background-verified plumbers, electricians, and cleaners —
              booked in minutes, tracked in real time, paid for securely.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/services"
                onMouseDown={spawnRipple}
                className="btn-ripple btn-primary group inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                Book a Professional
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#how-it-works"
                onMouseDown={spawnRipple}
                className="btn-ripple btn-secondary inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                See How It Works
              </a>
            </div>
          </Reveal>

          {/* Straight, centered glass "booking ticket" — the signature visual */}
          <Reveal delay={320} scale className="mx-auto mt-16 max-w-md">
            <div className="glass-strong rounded-3xl p-6 text-left shadow-glow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400">Booking ticket</p>
                  <p className="mt-1 font-display text-lg font-semibold text-white">#LG-48213</p>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-emerald-400" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  Live
                </span>
              </div>

              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/[0.04] p-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-500/15 text-accent-400">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-white">Electrical Repair</p>
                  <p className="text-xs text-gray-400">Ravi K. &middot; 4.9 <Star className="mb-0.5 inline h-3 w-3 fill-accent-400 text-accent-400" /></p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {['Requested', 'Assigned', 'On the way'].map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <CheckCircle2 className={`h-4 w-4 ${i < 2 ? 'text-emerald-400' : 'text-accent-400'}`} />
                    <span className={`text-sm ${i < 2 ? 'text-gray-500 line-through decoration-gray-600' : 'text-white'}`}>
                      {label}
                    </span>
                    {i === 2 && <span className="ml-auto text-xs text-gray-400">ETA 12 min</span>}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={380}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-gray-400">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Background-checked pros</span>
              <span className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-emerald-400" /> Secure Razorpay payments</span>
              <span className="flex items-center gap-2"><Star className="h-4 w-4 text-emerald-400" /> 4.8/5 from 10,000+ homeowners</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ FEATURES ============================ */}
      <section id="features" className="relative py-24">
        <div className="container mx-auto px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-500">Why Local Guardian</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              Everything you need to trust a stranger with your home
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <div className="glass group h-full rounded-2xl p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary-500/40 hover:shadow-card-hover">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 text-primary-500 transition-colors duration-300 group-hover:from-primary-500 group-hover:to-primary-600 group-hover:text-white">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold text-white">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== HOW IT WORKS ========================== */}
      <section id="how-it-works" className="relative py-24">
        <div className="container mx-auto px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-500">The process</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Three steps. Zero hassle.</h2>
          </Reveal>

          <div className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-primary-500/40 to-transparent md:block" />
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 120} className="relative flex flex-col items-center text-center">
                <div className="glass relative flex h-[72px] w-[72px] items-center justify-center rounded-2xl text-primary-500 shadow-card">
                  <step.icon className="h-7 w-7" />
                  <span className="btn-primary absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-gray-400">{step.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== STATS ============================== */}
      <section className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div className="container relative mx-auto grid grid-cols-2 gap-8 px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 100} className="text-center">
              <p className="font-display text-3xl font-bold sm:text-4xl">
                <span className="gradient-text"><Counter value={s.value} suffix={s.suffix} decimals={s.decimals || 0} /></span>
              </p>
              <p className="mt-2 text-sm text-gray-400">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============================= BENEFITS ============================= */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
            <Reveal scale className="order-2 md:order-1">
              <ul className="space-y-6">
                {BENEFITS.map((b) => (
                  <li key={b.title} className="flex gap-4">
                    <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-400" />
                    <div>
                      <h4 className="font-display text-lg font-semibold text-white">{b.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-gray-400">{b.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={100} className="order-1 md:order-2">
              <div className="relative">
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-primary-500/20 via-primary-600/20 to-accent-500/20 blur-xl" />
                <img
                  src={featureImg}
                  alt="Local Guardian dashboard preview"
                  loading="lazy"
                  className="w-full rounded-2xl border border-white/10 object-cover shadow-2xl"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============================ TESTIMONIALS ============================ */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-500">Real homeowners</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Trusted across the neighborhood</h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <div className="glass flex h-full flex-col rounded-2xl p-7 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
                  <Quote className="h-6 w-6 text-primary-500/50" />
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-300">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="btn-primary flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white">
                      {t.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} className={`h-3.5 w-3.5 ${idx < t.rating ? 'fill-accent-400 text-accent-400' : 'text-gray-600'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== OUR SERVICES =========================== */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-500">Popular right now</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Our services</h2>
            <p className="mt-3 text-gray-400">Explore available services and the providers behind them.</p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {services.length === 0 && (
              <div className="glass col-span-1 rounded-2xl p-10 text-center text-gray-400 md:col-span-3">
                No services available right now. Please check back later.
              </div>
            )}
            {services.map((s, i) => (
              <Reveal key={s.id} delay={i * 100}>
                <div className="glass group h-full rounded-2xl p-6 text-center shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border border-white/10">
                    <img
                      src={getServiceImage(s.serviceName)}
                      alt={s.serviceName}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <h4 className="mt-4 font-display text-lg font-semibold text-white">{s.serviceName}</h4>
                  <p className="mt-1 text-sm text-gray-400">{s.description}</p>
                  <Link
                    to="/services"
                    onMouseDown={spawnRipple}
                    className="btn-ripple btn-primary mt-5 inline-flex items-center gap-1.5 rounded-2xl px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    Book Now <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================================ FAQ ================================ */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-widest text-primary-500">Questions</span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Frequently asked questions</h2>
          </Reveal>

          <div className="glass mx-auto mt-12 max-w-2xl divide-y divide-white/10 rounded-2xl shadow-card">
            {FAQS.map((item, i) => {
              const isOpen = openFaq === i
              return (
                <div key={item.q} className="px-6">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-medium text-white">{item.q}</span>
                    <ChevronDown className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
                  </button>
                  <div className="overflow-hidden transition-all duration-300 ease-in-out" style={{ maxHeight: isOpen ? '200px' : '0px' }}>
                    <p className="pb-5 text-sm leading-relaxed text-gray-400">{item.a}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================= CTA BANNER ============================= */}
      <section className="relative overflow-hidden py-20">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" />
        <div className="pointer-events-none absolute -top-16 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-500/25 blur-3xl animate-blob" />
        <Reveal className="container relative mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Something needs fixing?</h2>
          <p className="mx-auto mt-3 max-w-md text-gray-400">Get matched with a verified local professional in minutes.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/services"
              onMouseDown={spawnRipple}
              className="btn-ripple btn-primary inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Book a Professional <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/register"
              onMouseDown={spawnRipple}
              className="btn-ripple btn-secondary inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Become a Provider
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
