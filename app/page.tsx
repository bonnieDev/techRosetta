import { ConsentReopen } from '@/components/ConsentBanner'
import '@/styles/holding.css'

export default function HoldingPage() {
  return (
    <div className="holding">
      <main id="main" tabIndex={-1} className="holding__frame" data-section="cover">
        <header className="holding__top">
          <h1 className="holding__name">Tech Rosetta</h1>
          <p className="holding__meta">Vol. 01 / EN</p>
        </header>
        <div className="holding__volume">
          <p className="holding__meta">Field Manual / Technology Literacy</p>
          <h2 className="holding__title">Tech Literacy, Translated</h2>
          <p className="holding__subtitle">Understanding AI, the Cloud, and Everyday Technology</p>
          <p className="holding__status">Coming soon.</p>
        </div>
        <div className="holding__byline">
          <p className="holding__meta">Bonnie Remeika</p>
          <p className="holding__meta">Edition 01</p>
        </div>
        <p className="holding__tagline">Understand it. Use it. Stay in control.</p>
      </main>
      <footer className="holding__foot" data-section="footer">
        <ConsentReopen />
      </footer>
    </div>
  )
}
