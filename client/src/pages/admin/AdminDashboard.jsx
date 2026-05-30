import React from "react";
import {
  ShoppingCart,
  DollarSign,
  Package,
  Box,
  Truck,
  TriangleAlert,
  Users,
  Clock3,
  TrendingUp,
  Building2,
} from "lucide-react";

const stats = [
  {
    title: "Orders Today",
    value: 148,
    icon: ShoppingCart,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Revenue Today",
    value: "KES 1.82M",
    icon: DollarSign,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
  {
    title: "In Picking",
    value: 17,
    icon: Package,
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
  },
  {
    title: "In Packaging",
    value: 12,
    icon: Box,
    iconBg: "bg-secondary/10",
    iconColor: "text-secondary",
  },
  {
    title: "In Transit",
    value: 24,
    icon: Truck,
    iconBg: "bg-info/10",
    iconColor: "text-info",
  },
  {
    title: "Low Stock Items",
    value: 9,
    icon: TriangleAlert,
    iconBg: "bg-error/10",
    iconColor: "text-error",
  },
];

const recentOrders = [
  {
    id: "ORD-2401",
    customer: "SkyNet Technologies",
    amount: "KES 125,000",
    status: "Packaging",
  },
  {
    id: "ORD-2402",
    customer: "Mara ISP",
    amount: "KES 48,500",
    status: "Picking",
  },
  {
    id: "ORD-2403",
    customer: "Netwave Solutions",
    amount: "KES 320,000",
    status: "In Transit",
  },
  {
    id: "ORD-2404",
    customer: "Safelink Networks",
    amount: "KES 72,000",
    status: "Delivered",
  },
];

const lowStock = [
  {
    product: "MikroTik RB4011",
    stock: 2,
  },
  {
    product: "Ubiquiti NanoBeam M5",
    stock: 3,
  },
  {
    product: "TP-Link SG2210",
    stock: 1,
  },
];

const branchPerformance = [
  {
    branch: "Nairobi",
    orders: 320,
    revenue: "KES 8.4M",
  },
  {
    branch: "Narok",
    orders: 180,
    revenue: "KES 4.1M",
  },
  {
    branch: "Kisumu",
    orders: 145,
    revenue: "KES 3.2M",
  },
];

const topSales = [
  {
    name: "John Kamau",
    orders: 92,
  },
  {
    name: "Mercy Wanjiku",
    orders: 78,
  },
  {
    name: "David Otieno",
    orders: 65,
  },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Operations Dashboard</h1>
        <p className="text-base-content/70">
          Real-time overview of all branches and fulfillment activities.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="card bg-base-100 shadow-md border border-base-300"
            >
              <div className="card-body p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-base-content/70">{stat.title}</p>

                    <h2 className="mt-1 text-2xl font-bold">{stat.value}</h2>
                  </div>

                  <div
                    className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.iconBg}`}
                  >
                    <Icon size={24} className={stat.iconColor} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="card bg-base-100 shadow-md lg:col-span-2">
          <div className="card-body">
            <h2 className="card-title">Recent Orders</h2>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.amount}</td>
                      <td>
                        <span className="badge badge-primary">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Low Stock */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Low Stock Alerts</h2>

            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item.product}
                  className="flex justify-between items-center border-b border-base-300 pb-2"
                >
                  <div>
                    <p className="font-medium">{item.product}</p>
                  </div>

                  <span className="badge badge-error">{item.stock}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Branch Performance */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Branch Performance</h2>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Branch</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {branchPerformance.map((branch) => (
                    <tr key={branch.branch}>
                      <td>{branch.branch}</td>
                      <td>{branch.orders}</td>
                      <td>{branch.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Sales Staff */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Top Sales Agents</h2>

            <div className="space-y-4">
              {topSales.map((agent) => (
                <div
                  key={agent.name}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{agent.name}</p>
                  </div>

                  <div className="badge badge-success">
                    {agent.orders} Orders
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SLA Monitoring */}
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title">SLA Performance</h2>

          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="mb-2 font-medium">Picking</p>

              <progress
                className="progress progress-success w-full"
                value="85"
                max="100"
              ></progress>

              <p className="text-sm mt-1">Avg 12 mins / Target 15 mins</p>
            </div>

            <div>
              <p className="mb-2 font-medium">Packaging</p>

              <progress
                className="progress progress-warning w-full"
                value="65"
                max="100"
              ></progress>

              <p className="text-sm mt-1">Avg 18 mins / Target 15 mins</p>
            </div>

            <div>
              <p className="mb-2 font-medium">Dispatch</p>

              <progress
                className="progress progress-success w-full"
                value="92"
                max="100"
              ></progress>

              <p className="text-sm mt-1">Avg 8 mins / Target 10 mins</p>
            </div>

            <div>
              <p className="mb-2 font-medium">Delivery</p>

              <progress
                className="progress progress-info w-full"
                value="78"
                max="100"
              ></progress>

              <p className="text-sm mt-1">Avg 45 mins / Target 60 mins</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
