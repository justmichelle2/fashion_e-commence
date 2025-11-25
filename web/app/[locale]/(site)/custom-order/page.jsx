import Container from '../../../components/ui/Container'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'

export const metadata = {
  title: 'Custom Order — Luxe Atelier',
  description: 'Request a custom design from our talented designers.',
}

export default function CustomOrderPage() {
  return (
    <Container className="py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-serif">Request Custom Design</h1>
          <p className="text-muted">
            Work directly with designers to create your perfect piece. Share your vision, measurements, and inspiration.
          </p>
        </div>

        <Card className="p-8">
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted">Project Title</label>
              <input className="form-input" placeholder="e.g., Evening Gown for Gala" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted">Describe Your Vision</label>
              <textarea 
                className="form-input" 
                rows={6}
                placeholder="Tell us about the piece you envision - style, colors, occasion, special requirements..."
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted">Budget Range</label>
              <select className="form-input" required>
                <option value="">Select a range</option>
                <option value="1000-2500">$1,000 - $2,500</option>
                <option value="2500-5000">$2,500 - $5,000</option>
                <option value="5000-10000">$5,000 - $10,000</option>
                <option value="10000+">$10,000+</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted">Timeline</label>
              <input className="form-input" type="date" required />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.2em] text-muted">Inspiration Images (Optional)</label>
              <input className="form-input" type="file" accept="image/*" multiple />
              <p className="text-xs text-muted">Upload up to 5 images</p>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full justify-center">
                Submit Custom Order Request
              </Button>
              <p className="text-xs text-muted text-center mt-3">
                Designers will review your request and send proposals within 2-3 business days
              </p>
            </div>
          </form>
        </Card>
      </div>
    </Container>
  )
}
