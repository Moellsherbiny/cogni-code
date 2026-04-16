import { Button } from '@/components/ui/button'
import { Star, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function CTABanner() {
  return (
          <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-orb" />
          <Star size={32} className="cta-star" />
          <h2 className="cta-title">Ready to start your coding journey?</h2>
          <p className="cta-desc">Join thousands of students learning at their own pace, in their own way.</p>
          <Link href="/auth/register">
            <Button variant="default" size="icon-lg" className="btn-cta">
              Create Free Account <ChevronRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
  )
}
