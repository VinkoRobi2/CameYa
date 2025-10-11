// src/pages/HomePage.tsx
import Header from '../components/Header'
import Hero from '../components/Hero'
import JobRange from '../components/JobRange'
import Features from '../components/Features'
import PaymentSection from '../components/PaymentSection'
import { FAQ } from '../components/FAQ'

export default function HomePage() {
  return (
    <>
      <Header />
      {/* Hero ahora va directamente debajo del header para cubrir la barra blanca */}
      <Hero />
      <main className="pt-0">
        <JobRange />
        <Features />
        <PaymentSection />
        <FAQ />
      </main>
    </>
  )
}
