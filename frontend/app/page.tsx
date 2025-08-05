import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Users, Briefcase, TrendingUp, CheckCircle, ArrowRight, Globe, Shield, Zap } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <Header />
      <section className="relative bg-gradient-to-br from-primary via-primary to-primary/90 text-white py-20 lg:py-32">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-secondary text-primary px-4 py-2">
                  🚀 Connecting Africa to Global Tech Opportunities
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  Build Your Tech Career in
                  <span className="text-secondary"> Africa</span>
                </h1>
                <p className="text-xl text-gray-200 leading-relaxed">
                  Join the premier talent marketplace connecting African tech professionals with cutting-edge
                  opportunities in web2, web3, UI/UX, and all technology domains.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register?role=talent">
                  <Button
                    size="lg"
                    className="bg-secondary text-primary hover:bg-secondary/90 px-8 py-4 text-lg font-semibold"
                  >
                    Join as Talent
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/register?role=recruiter">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg font-semibold bg-transparent"
                  >
                    Hire Talent
                  </Button>
                </Link>
              </div>
              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">2,500+</div>
                  <div className="text-sm text-gray-300">Active Talents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">850+</div>
                  <div className="text-sm text-gray-300">Jobs Posted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">150+</div>
                  <div className="text-sm text-gray-300">Companies</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Connect with Top Talent</h3>
                      <p className="text-gray-300 text-sm">Access Africa's best tech professionals</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Quality Opportunities</h3>
                      <p className="text-gray-300 text-sm">Curated jobs from leading companies</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                      <Globe className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Global Reach</h3>
                      <p className="text-gray-300 text-sm">Remote and on-site opportunities worldwide</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary">Why Choose DLT TalentHub?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're more than just a job board. We're building the future of tech talent in Africa.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Verified Opportunities</CardTitle>
                <CardDescription>
                  All jobs and companies are thoroughly vetted to ensure quality and legitimacy.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Fast Matching</CardTitle>
                <CardDescription>
                  Our AI-powered matching system connects you with relevant opportunities quickly.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Career Growth</CardTitle>
                <CardDescription>
                  Access resources, mentorship, and opportunities to advance your tech career.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Community Driven</CardTitle>
                <CardDescription>Join a thriving community of tech professionals across Africa.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Global Opportunities</CardTitle>
                <CardDescription>
                  Access both local African opportunities and international remote positions.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Success Support</CardTitle>
                <CardDescription>
                  Get support throughout your job search and career development journey.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-primary">Trusted by Thousands</h2>
            <p className="text-xl text-gray-600">Join the growing community of tech professionals and companies</p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
