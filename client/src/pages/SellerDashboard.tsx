import { Navbar } from "../components/layout/Navbar";
import { useLivestock, useDeleteLivestock } from "../hooks/use-livestock";
import { useAuth } from "../hooks/use-auth";
import { Plus, Trash2, Tag, MapPin, Loader2, ImagePlus } from "lucide-react";
import { useState, useRef } from "react";
import { kenyanCounties } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";

export function SellerDashboard() {
  const { user } = useAuth();
  const { data: allLivestock, isLoading } = useLivestock();
  const deleteLivestock = useDeleteLivestock();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myLivestock = allLivestock?.filter(l => l.sellerId === user?.id) || [];

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    breed: "",
    healthStatus: "Healthy",
    county: "Nakuru",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      // Append all text fields
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("breed", formData.breed);
      data.append("healthStatus", formData.healthStatus);
      data.append("county", formData.county);

      // Append image if selected
      const file = fileInputRef.current?.files?.[0];
      if (file) {
        data.append("image", file);
      }

      const res = await fetch("/api/livestock", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // DO NOT set Content-Type — browser sets it automatically for FormData
        },
        body: data,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create listing");
      }

      // Refresh listings
      queryClient.invalidateQueries({ queryKey: ["/api/livestock"] });

      // Reset form
      setIsAdding(false);
      setImagePreview(null);
      setFormData({ title: "", description: "", price: "", breed: "", healthStatus: "Healthy", county: "Nakuru" });
      if (fileInputRef.current) fileInputRef.current.value = "";

      alert("✅ Listing published successfully!");
    } catch (err: any) {
      alert("❌ Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Delete this listing?")) {
      await deleteLivestock.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-grow pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">

        {/* Header */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Seller Dashboard</h1>
            <p className="text-gray-500">Welcome back, {user?.name}. Manage your livestock listings.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow flex items-center gap-2 transition-colors"
          >
            {isAdding ? "Cancel" : <><Plus className="w-5 h-5" /> Add Listing</>}
          </button>
        </div>

        {/* Add Listing Form */}
        {isAdding && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow mb-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Create New Listing</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Title *</label>
                  <input
                    required type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="e.g., Healthy Fresian Dairy Cow"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Price (KES) *</label>
                  <input
                    required type="number"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="85000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Breed *</label>
                  <input
                    required type="text"
                    value={formData.breed}
                    onChange={e => setFormData({ ...formData, breed: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="Fresian, Boran, Dorper..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Health Status *</label>
                  <input
                    required type="text"
                    value={formData.healthStatus}
                    onChange={e => setFormData({ ...formData, healthStatus: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="Vaccinated, Healthy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">County *</label>
                  <select
                    required
                    value={formData.county}
                    onChange={e => setFormData({ ...formData, county: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                  >
                    {kenyanCounties.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Animal Photo</label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-500 cursor-pointer flex flex-col items-center justify-center gap-2 transition-colors overflow-hidden"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImagePlus className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">Click to upload photo</span>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Description *</label>
                  <textarea
                    required rows={4}
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                    placeholder="Describe the animal — age, weight, milk production, etc."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl flex items-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-60"
                >
                  {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Publishing...</> : "Publish Listing"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : myLivestock.length > 0 ? (
            myLivestock.map(item => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="h-48 bg-gray-100 relative">
                  <img
                    src={item.imageUrl || `https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop&q=80&sig=${item.id}`}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-green-700 shadow">
                    KES {Number(item.price).toLocaleString()}
                  </div>
                </div>
                <div className="p-5 flex-grow flex flex-col">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1 text-gray-900">{item.title}</h3>
                  <div className="flex gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{item.breed}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{item.county}</span>
                  </div>
                  <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">ID: #{item.id}</span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteLivestock.isPending}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white border border-gray-200 rounded-3xl p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Tag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-6">Start selling by adding your first livestock listing.</p>
              <button
                onClick={() => setIsAdding(true)}
                className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Add First Listing
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}