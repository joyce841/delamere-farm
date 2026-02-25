import { Navbar } from "../components/layout/Navbar";
import { useLivestock } from "../hooks/use-livestock";
import { LivestockCard } from "../components/LivestockCard";
import { Search, Filter, Loader2, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import { kenyanCounties } from "@shared/schema";

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="pt-28 pb-10 bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">DELAMERE FARM SHOP</h1>
          <p className="text-green-100 text-lg mb-4">
            Quality livestock available directly from our farm in Naivasha, Kenya.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <MapPin className="w-4 h-4" />
              <span className="text-sm font-medium">Naivasha, Nakuru County</span>
            </div>
            <a
              href="tel:0751232584"
              className="flex items-center gap-2 bg-white text-green-700 px-4 py-2 rounded-full font-bold hover:bg-green-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="text-sm">Call: 0751 232 584</span>
            </a>
          </div>
        </div>
      </div>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col md:flex-row gap-8">

        {/* Sidebar */}
        <div className="w-full md:w-72 flex-shrink-0 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-28">
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-green-600" />
              <h2 className="text-lg font-bold">SEARCH WEBSITE</h2>
            </div>
            
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search livestock..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                />
              </div>

              <button
                onClick={() => {}}
                className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors"
              >
                SEARCH
              </button>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-700 mb-2">Filter by County</label>
                <select
                  value={selectedCounty}
                  onChange={(e) => setSelectedCounty(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm"
                >
                  <option value="">All Counties</option>
                  {kenyanCounties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* About Us */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">ABOUT US</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Quality livestock available 🐐 Goats: Boer, Kalahari Red, Savanna and Saanen 🐑 Sheep: Dorper, Merino and Meat Master 🐄 Cattle: Brahman, Boran, Holstein and Jersey. For sale — Call/WhatsApp us on <a href="tel:0751232584" className="text-green-600 font-semibold">0751 232 584</a>. Viewing is available. Delivery can be arranged.
              </p>
            </div>

            {/* WhatsApp & Maps buttons */}
            <div className="mt-4 flex gap-3">
              <a
                href="https://wa.me/254751232584"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a
                href="https://maps.google.com/?q=Naivasha,Kenya"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-colors"
              >
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : filteredLivestock.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-6">
              {filteredLivestock.map(item => (
                <LivestockCard key={item.id} livestock={item} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search or filter criteria.
              </p>
              <button 
                onClick={() => { setSearchTerm(""); setSelectedCounty(""); }}
                className="mt-6 px-6 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
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