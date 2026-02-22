import { Link } from "wouter";
import { formatCurrency } from "../lib/utils";
import { MapPin, Activity, ShieldCheck } from "lucide-react";
import { Livestock } from "@shared/schema";

interface LivestockCardProps {
  livestock: Livestock;
}

export function LivestockCard({ livestock }: LivestockCardProps) {
  // Use a reliable placeholder based on ID so it's consistent
  const placeholderImage = `https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=800&h=600&fit=crop&q=80&sig=${livestock.id}`;

  return (
    <Link href={`/livestock/${livestock.id}`} className="group block">
      <div className="bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col h-full">
        
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          {/* Unsplash livestock image */}
          <img 
            src={placeholderImage} 
            alt={livestock.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
            {livestock.breed}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h3 className="font-display font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {livestock.title}
            </h3>
            <span className="font-bold text-lg text-secondary-foreground whitespace-nowrap">
              {formatCurrency(livestock.price.toString())}
            </span>
          </div>
          
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-grow">
            {livestock.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mt-auto pt-4 border-t border-border">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {livestock.county}
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              {livestock.healthStatus}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
