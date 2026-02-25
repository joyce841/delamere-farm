const API_BASE = "";

export const api = {
  auth: {
    login: {
      path: `${API_BASE}/api/auth/login`,
      method: "POST",
      responses: { 200: null },
    },
    register: {
      path: `${API_BASE}/api/auth/register`,
      method: "POST",
      responses: { 201: null },
    },
    me: {
      path: `${API_BASE}/api/auth/me`,
      method: "GET",
      responses: { 200: null },
    },
  },
  livestock: {
    list: {
      path: `${API_BASE}/api/livestock`,
      method: "GET",
      responses: { 200: null },
    },
    get: {
      path: `${API_BASE}/api/livestock/:id`,
      method: "GET",
      responses: { 200: null },
    },
    create: {
      path: `${API_BASE}/api/livestock`,
      method: "POST",
      responses: { 201: null },
    },
    delete: {
      path: `${API_BASE}/api/livestock/:id`,
      method: "DELETE",
      responses: { 200: null },
    },
  },
  orders: {
    create: {
      path: `${API_BASE}/api/orders`,
      method: "POST",
      responses: { 201: null },
    },
    myOrders: {
      path: `${API_BASE}/api/orders/my`,
      method: "GET",
      responses: { 200: null },
    },
  },
  admin: {
    users: {
      path: `${API_BASE}/api/admin/users`,
      method: "GET",
      responses: { 200: null },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>) {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}

export type AuthLoginInput = {
  email: string;
  password: string;
};

export type AuthRegisterInput = {
  name: string;
  email: string;
  password: string;
  phoneNumber: string;
  whatsappNumber?: string;
  county: string;
  role: "buyer" | "seller" | "admin";
};

export type LivestockCreateInput = {
  title: string;
  description: string;
  price: string;
  breed: string;
  healthStatus: string;
  county: string;
  image?: File;
};

export type OrderCreateInput = {
  livestockId: number;
};