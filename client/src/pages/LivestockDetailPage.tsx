import { useParams, useLocation } from "wouter";
import { useLivestockDetails } from "../hooks/use-livestock";
import { useCreateOrder } from "../hooks/use-orders";
import { useAuth } from "../hooks/use-auth";
import { Navbar } from "../components/layout/Navbar";
import { formatCurrency } from "../lib/utils";
import { MapPin, ShieldCheck, Tag, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";

export function LivestockDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: livestock, isLoading } = useLivestockDetails(Number(id));
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  
  const [orderSuccess, setOrderSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!livestock) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4 text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">Listing Not Found</h2>
          <p className="text-muted-foreground mb-8">This livestock listing may have been removed or sold.</p>
          <Link href="/marketplace" className="px-6 py-3 bg-primary text-white rounded-xl font-medium">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const handleOrder = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    try {
      await createOrder.mutateAsync({ livestockId: livestock.id });
      setOrderSuccess(true);
    } catch (err) {
      alert("Failed to place order. Please try again.");
    }
  };

  const imageSrc = `https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=1200&h=800&fit=crop&q=80&sig=${livestock.id}`;

  const whatsappLink = `https://wa.me/${livestock.phoneNumber}?text=${encodeURIComponent(
    `Hello, I am interested in your ${livestock.title} listed at ${formatCurrency(
      livestock.price.toString()
    )}.`
  )}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to listings
          </Link>

          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col lg:flex-row">
            
            <div className="w-full lg:w-1/2 h-[400px] lg:h-auto relative bg-muted">
              <img 
                src={imageSrc} 
                alt={livestock.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  {livestock.title}
                </h1>
                <div className="text-right">
                  <span className="block text-3xl font-bold text-primary whitespace-nowrap">
                    {formatCurrency(livestock.price.toString())}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-foreground">
                  <MapPin className="w-4 h-4 text-primary" /> {livestock.county}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-foreground">
                  <Tag className="w-4 h-4 text-primary" /> {livestock.breed}
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted rounded-lg text-sm font-medium text-foreground">
                  <ShieldCheck className="w-4 h-4 text-primary" /> {livestock.healthStatus}
                </div>
              </div>

              <div className="mb-10 flex-grow">
                <h3 className="text-lg font-bold font-display mb-3">Description</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {livestock.description}
                </p>
              </div>

              {orderSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center"
                >
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-green-800 mb-1">Order Placed Successfully!</h3>
                  <p className="text-green-700 mb-4">The seller will contact you shortly.</p>
                  <Link href="/dashboard/buyer" className="text-green-700 font-semibold hover:underline">
                    View my orders
                  </Link>
                </motion.div>
              ) : (
                <div className="pt-8 border-t border-border">
                  <button
                    onClick={handleOrder}
                    disabled={createOrder.isPending || (user && user.id === livestock.sellerId)}
                    className="w-full py-4 rounded-xl font-semibold text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    {createOrder.isPending ? "Processing..." : 
                      (user && user.id === livestock.sellerId ? "This is your listing" : "Place Order Now")}
                  </button>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full mt-4 py-4 rounded-xl font-semibold text-lg bg-green-600 text-white text-center hover:bg-green-700 transition-all"
                  >
                    Chat Seller on WhatsApp
                  </a>

                  {!user && (
                    <p className="text-center text-sm text-muted-foreground mt-3">
                      You will be asked to sign in first.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}