import { Navbar } from "../components/layout/Navbar";
import { useLivestock } from "../hooks/use-livestock";
import { LivestockCard } from "../components/LivestockCard";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState } from "react";
import { kenyanCounties } from "@shared/schema";
import { motion } from "framer-motion";

export function MarketplacePage() {
  const { data: livestock, isLoading } = useLivestock();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");

  const filteredLivestock = livestock?.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCounty = selectedCounty ? item.county === selectedCounty : true;
    return matchesSearch && matchesCounty;
  }) || [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="pt-28 pb-12 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Marketplace</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            Browse our verified selection of premium livestock directly from Kenyan farmers.
          </p>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full md:w-72 flex-shrink-0 space-y-6">
          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm sticky top-28">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-bold font-display">Filters</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Search</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search breed, title..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">County</label>
                <select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm appearance-none"
                >
                  <option value="">All Counties</option>
                  {kenyanCounties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLivestock.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              {filteredLivestock.map(item => (
                <LivestockCard key={item.id} livestock={item} />
              ))}
            </motion.div>
          ) : (
            <div className="bg-card border border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold font-display text-foreground mb-2">No listings found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any livestock matching your current filters. Try adjusting your search criteria.
              </p>
              <button 
                onClick={() => { setSearchTerm(""); setSelectedCounty(""); }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
