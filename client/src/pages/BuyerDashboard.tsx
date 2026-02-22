import { Navbar } from "../components/layout/Navbar";
import { useMyOrders } from "../hooks/use-orders";
import { formatCurrency } from "../lib/utils";
import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";

export function BuyerDashboard() {
  const { data: orders, isLoading } = useMyOrders();

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const base = "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit";
    switch(status) {
      case 'completed': return `${base} bg-green-100 text-green-700`;
      case 'failed': return `${base} bg-red-100 text-red-700`;
      default: return `${base} bg-yellow-100 text-yellow-700`;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-28 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">My Orders</h1>
            <p className="text-muted-foreground">Track and manage your purchases.</p>
          </div>
          <Link href="/marketplace" className="px-5 py-2.5 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors">
            Keep Shopping
          </Link>
        </div>

        <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="py-4 px-6 font-semibold text-sm text-muted-foreground">Order ID</th>
                    <th className="py-4 px-6 font-semibold text-sm text-muted-foreground">Livestock ID</th>
                    <th className="py-4 px-6 font-semibold text-sm text-muted-foreground">Date</th>
                    <th className="py-4 px-6 font-semibold text-sm text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-5 px-6 font-medium text-foreground">
                        #{order.id.toString().padStart(5, '0')}
                      </td>
                      <td className="py-5 px-6 text-primary hover:underline">
                        <Link href={`/livestock/${order.livestockId}`}>
                          View Item #{order.livestockId}
                        </Link>
                      </td>
                      <td className="py-5 px-6 text-muted-foreground">
                        {new Date(order.createdAt as string).toLocaleDateString()}
                      </td>
                      <td className="py-5 px-6">
                        <div className={getStatusBadge(order.paymentStatus)}>
                          {getStatusIcon(order.paymentStatus)}
                          {order.paymentStatus}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold font-display text-foreground mb-2">No orders yet</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                You haven't placed any orders. Browse the marketplace to find what you need.
              </p>
              <Link href="/marketplace" className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 shadow-md hover:-translate-y-0.5 transition-all">
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
