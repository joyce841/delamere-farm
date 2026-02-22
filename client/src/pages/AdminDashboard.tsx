import { Navbar } from "../components/layout/Navbar";
import { useAdminUsers, useAdminLivestock } from "../hooks/use-admin";
import { useDeleteLivestock } from "../hooks/use-livestock";
import { Users, LayoutList, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "../lib/utils";

export function AdminDashboard() {
  const { data: users, isLoading: loadingUsers } = useAdminUsers();
  const { data: livestock, isLoading: loadingLivestock } = useAdminLivestock();
  const deleteLivestock = useDeleteLivestock();

  const [tab, setTab] = useState<"users" | "livestock">("users");

  const handleDeleteLivestock = async (id: number) => {
    if (confirm("Admin: Are you sure you want to delete this listing globally?")) {
      await deleteLivestock.mutateAsync(id);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Admin Control Panel</h1>
          <p className="text-muted-foreground">Manage users and global platform content.</p>
        </div>

        <div className="flex gap-4 mb-8 border-b border-border pb-px">
          <button 
            onClick={() => setTab("users")}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${tab === 'users' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Users Directory</div>
          </button>
          <button 
            onClick={() => setTab("livestock")}
            className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 ${tab === 'livestock' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            <div className="flex items-center gap-2"><LayoutList className="w-4 h-4" /> All Livestock</div>
          </button>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          {tab === "users" && (
            <div className="overflow-x-auto">
              {loadingUsers ? <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">ID</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">Name</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">Email</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">Role</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">County</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {users?.map(u => (
                      <tr key={u.id} className="hover:bg-muted/30">
                        <td className="py-4 px-6 text-muted-foreground text-sm">#{u.id}</td>
                        <td className="py-4 px-6 font-medium">{u.name}</td>
                        <td className="py-4 px-6">{u.email}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                            u.role === 'seller' ? 'bg-secondary/20 text-secondary-foreground' : 
                            'bg-primary/10 text-primary'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-muted-foreground">{u.county}</td>
                        <td className="py-4 px-6 text-sm text-muted-foreground">{new Date(u.createdAt as string).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "livestock" && (
            <div className="overflow-x-auto">
              {loadingLivestock ? <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">ID</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">Title</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">Seller ID</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">Price</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground">County</th>
                      <th className="py-4 px-6 text-sm font-semibold text-muted-foreground text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {livestock?.map(l => (
                      <tr key={l.id} className="hover:bg-muted/30">
                        <td className="py-4 px-6 text-muted-foreground text-sm">#{l.id}</td>
                        <td className="py-4 px-6 font-medium line-clamp-1 max-w-[200px]">{l.title}</td>
                        <td className="py-4 px-6 text-sm">User #{l.sellerId}</td>
                        <td className="py-4 px-6 font-semibold">{formatCurrency(l.price.toString())}</td>
                        <td className="py-4 px-6 text-sm text-muted-foreground">{l.county}</td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => handleDeleteLivestock(l.id)}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors inline-flex"
                            title="Delete globally"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
