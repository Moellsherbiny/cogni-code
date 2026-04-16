import Navbar from '@/components/layout/navbar'
import { Whiteboard } from '@/components/whiteboard'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function WhiteboardPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
 
            <Whiteboard />
      </section>
    </main>
  )
}