import { Navbar } from "../components/layout/Navbar";
import { useLivestock, useCreateLivestock, useDeleteLivestock } from "../hooks/use-livestock";
import { useAuth } from "../hooks/use-auth";
import { formatCurrency } from "../lib/utils";
import { Plus, Trash2, Tag, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { kenyanCounties } from "@shared/schema";
import { LivestockCreateInput } from "@shared/routes";

export function SellerDashboard() {
  const { user } = useAuth();
  const { data: allLivestock, isLoading } = useLivestock();
  const createLivestock = useCreateLivestock();
  const deleteLivestock = useDeleteLivestock();

  const [isAdding, setIsAdding] = useState(false);
  
  // Filter for ONLY this seller's livestock
  const myLivestock = allLivestock?.filter(l => l.sellerId === user?.id) || [];

  const [formData, setFormData] = useState<LivestockCreateInput>({
    title: "",
    description: "",
    price: "", // will parse as string per schema but user types number
    breed: "",
    healthStatus: "Healthy",
    county: user?.county || "Nairobi",
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLivestock.mutateAsync(formData);
      setIsAdding(false);
      setFormData({ ...formData, title: "", description: "", price: "", breed: "" });
    } catch (err) {
      alert("Failed to add listing");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await deleteLivestock.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your livestock listings.</p>
          </div>
          <button 
            onClick={() => setIsAdding(!isAdding)}
            className="px-5 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-md hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
          >
            {isAdding ? "Cancel" : <><Plus className="w-5 h-5" /> Add Listing</>}
          </button>
        </div>

        {isAdding && (
          <div className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-md mb-10">
            <h2 className="text-2xl font-display font-bold mb-6">Create New Listing</h2>
            <form onSubmit={handleAddSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">Title</label>
                  <input required type="text" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="e.g., Healthy Boran Dairy Cow" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Price (KES)</label>
                  <input required type="number" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="50000" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Breed</label>
                  <input required type="text" value={formData.breed} onChange={e=>setFormData({...formData, breed: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Boran" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Health Status</label>
                  <input required type="text" value={formData.healthStatus} onChange={e=>setFormData({...formData, healthStatus: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Vaccinated, Healthy" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">County</label>
                  <select required value={formData.county} onChange={e=>setFormData({...formData, county: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none">
                    {kenyanCounties.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea required rows={4} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Provide details about the animal..."></textarea>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button type="submit" disabled={createLivestock.isPending} className="px-8 py-3 bg-primary text-white font-semibold rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors">
                  {createLivestock.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
             <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : myLivestock.length > 0 ? (
            myLivestock.map(item => (
              <div key={item.id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="h-48 bg-muted relative">
                  <img src={`https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop&q=80&sig=${item.id}`} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                    {formatCurrency(item.price.toString())}
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{item.title}</h3>
                  <div className="flex gap-3 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{item.breed}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.county}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-border flex justify-between items-center">
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">ID: #{item.id}</span>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteLivestock.isPending}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-card border border-border rounded-3xl p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Tag className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold font-display text-foreground mb-2">No listings yet</h3>
              <p className="text-muted-foreground mb-6">You haven't added any livestock. Start selling by adding your first listing.</p>
              <button onClick={() => setIsAdding(true)} className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90">Add First Listing</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
