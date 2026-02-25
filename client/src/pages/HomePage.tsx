import { Navbar } from "../components/layout/Navbar";
import { Link } from "wouter";
import { ArrowRight, Leaf, Shield, Truck, MapPin, Phone } from "lucide-react";
import { useLivestock } from "../hooks/use-livestock";
import { LivestockCard } from "../components/LivestockCard";
import { motion } from "framer-motion";

export function HomePage() {
  const { data: livestockList, isLoading } = useLivestock();
  const recentLivestock = livestockList?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=1080&fit=crop" 
            alt="Farm landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/20 backdrop-blur-md text-primary-foreground text-sm font-semibold mb-6 border border-primary/30">
              Kenya's Premium Agricultural Marketplace
            </span>
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-white leading-tight mb-6">
              Empowering the <br/>
              <span className="text-secondary">Future of Farming</span>
            </h1>
            <p className="text-lg text-gray-200 mb-4 max-w-xl text-balance">
              Connect directly with verified farmers across all 47 counties. Premium livestock, transparent pricing, and secure transactions.
            </p>

            {/* Location & Contact */}
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <MapPin className="w-4 h-4 text-green-400" />
                <span className="text-white text-sm font-medium">Naivasha, Nakuru County</span>
              </div>
              <a 
                href="tel:0751232584"
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 transition-colors px-4 py-2 rounded-full"
              >
                <Phone className="w-4 h-4 text-white" />
                <span className="text-white text-sm font-medium">Call: 0751 232 584</span>
              </a>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/marketplace" className="px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-1 flex items-center gap-2">
                Browse Marketplace <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/register" className="px-8 py-4 rounded-xl glass text-white font-semibold text-lg hover:bg-white/20 transition-all">
                Become a Seller
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Contact Banner */}
          <div className="flex flex-wrap justify-center gap-6 mb-14 p-6 bg-green-50 border border-green-200 rounded-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Our Location</p>
                <p className="font-semibold text-foreground">Naivasha, Nakuru County, Kenya</p>
              </div>
            </div>
            <div className="w-px bg-green-200 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Call or WhatsApp Us</p>
                <a href="tel:0751232584" className="font-semibold text-green-600 hover:text-green-700">
                  0751 232 584
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-card p-8 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Verified Livestock</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every listing undergoes strict quality checks to ensure health status and breed authenticity.
              </p>
            </div>
            <div className="bg-card p-8 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-6 text-secondary-foreground">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Nationwide Reach</h3>
              <p className="text-muted-foreground leading-relaxed">
                Connect with buyers and sellers across all 47 Kenyan counties seamlessly.
              </p>
            </div>
            <div className="bg-card p-8 rounded-3xl shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Leaf className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-display font-bold mb-3">Sustainable Farming</h3>
              <p className="text-muted-foreground leading-relaxed">
                Promoting ethical agricultural practices and supporting local farming communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-2">Recently Added</h2>
              <p className="text-muted-foreground">Discover the latest premium livestock listings.</p>
            </div>
            <Link href="/marketplace" className="hidden sm:flex text-primary font-semibold items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-2xl h-[400px] animate-pulse border border-border"></div>
              ))}
            </div>
          ) : recentLivestock.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentLivestock.map(item => (
                <LivestockCard key={item.id} livestock={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-card rounded-3xl border border-border">
              <p className="text-muted-foreground text-lg">No livestock listings available yet.</p>
            </div>
          )}
          
          <div className="mt-10 sm:hidden">
            <Link href="/marketplace" className="w-full py-4 rounded-xl bg-primary/10 text-primary font-semibold flex justify-center items-center gap-2">
              View all marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer Contact */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-between items-center gap-6">
          <div>
            <h3 className="text-xl font-bold text-green-400 mb-1">🌿 Delamere Farm</h3>
            <p className="text-gray-400 text-sm">Kenya's Premium Agricultural Marketplace</p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-300">
              <MapPin className="w-4 h-4 text-green-400" />
              <span className="text-sm">Naivasha, Nakuru County, Kenya</span>
            </div>
            <a href="tel:0751232584" className="flex items-center gap-2 text-green-400 hover:text-green-300">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-semibold">0751 232 584</span>
            </a>
          </div>
          <p className="text-gray-500 text-sm">© 2026 Delamere Farm. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}