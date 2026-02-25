import { Link } from "wouter";
import { MapPin, Phone, ShoppingCart, MessageCircle } from "lucide-react";

interface LivestockCardProps {
  livestock: any;
}

export function LivestockCard({ livestock }: LivestockCardProps) {
  const imageSrc = livestock.imageUrl || 
    `https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop&q=80&sig=${livestock.id}`;

  const sellerPhone = livestock.seller?.phoneNumber || "0751232584";
  const sellerWhatsapp = livestock.seller?.whatsappNumber || livestock.seller?.phoneNumber || "0751232584";

  // Format phone number for WhatsApp (remove 0 and add 254)
  const whatsappNumber = sellerWhatsapp.replace(/^0/, "254");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    `Hello, I am interested in your ${livestock.title} listed at KES ${Number(livestock.price).toLocaleString()}.`
  )}`;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img 
          src={imageSrc}
          alt={livestock.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
          {livestock.breed}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow">
          {livestock.healthStatus}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2 uppercase tracking-wide">
          {livestock.title}
        </h3>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-3">
          {livestock.description}
        </p>

        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
          <MapPin className="w-4 h-4 text-green-600" />
          {livestock.county}
        </div>

        <div className="text-2xl font-bold text-gray-900 mb-4">
          KES {Number(livestock.price).toLocaleString()}.00
        </div>

        {/* Contact row */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-green-600 hover:text-green-700 text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <a 
            href={`tel:${sellerPhone}`}
            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <Phone className="w-4 h-4" />
            {sellerPhone}
          </a>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto">
          <Link
            href={`/livestock/${livestock.id}`}
            className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold text-center flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </Link>
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2.5 rounded-xl border-2 border-green-600 text-green-600 hover:bg-green-50 text-sm font-semibold text-center flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Enquire Now
          </a>
        </div>

        {/* View Details */}
        <Link
          href={`/livestock/${livestock.id}`}
          className="mt-3 text-center text-sm text-green-600 hover:text-green-700 font-medium hover:underline"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}