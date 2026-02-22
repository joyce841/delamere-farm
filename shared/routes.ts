import { z } from 'zod';
import { insertUserSchema, insertLivestockSchema, insertOrderSchema, users, livestock, orders } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema.omit({ role: true }).extend({
        role: z.enum(["buyer", "seller"]).optional().default("buyer")
      }),
      responses: {
        201: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({
        email: z.string().email(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  livestock: {
    list: {
      method: 'GET' as const,
      path: '/api/livestock' as const,
      responses: {
        200: z.array(z.custom<typeof livestock.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/livestock/:id' as const,
      responses: {
        200: z.custom<typeof livestock.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/livestock' as const,
      input: insertLivestockSchema.omit({ sellerId: true }),
      responses: {
        201: z.custom<typeof livestock.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/livestock/:id' as const,
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders' as const,
      input: insertOrderSchema.omit({ buyerId: true, paymentStatus: true, transactionId: true }),
      responses: {
        201: z.custom<typeof orders.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    myOrders: {
      method: 'GET' as const,
      path: '/api/orders/my' as const,
      responses: {
        200: z.array(z.custom<typeof orders.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  admin: {
    users: {
      method: 'GET' as const,
      path: '/api/admin/users' as const,
      responses: {
        200: z.array(z.custom<typeof users.$inferSelect>()),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    livestock: {
      method: 'GET' as const,
      path: '/api/admin/livestock' as const,
      responses: {
        200: z.array(z.custom<typeof livestock.$inferSelect>()),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type AuthRegisterInput = z.infer<typeof api.auth.register.input>;
export type AuthLoginInput = z.infer<typeof api.auth.login.input>;
export type LivestockCreateInput = z.infer<typeof api.livestock.create.input>;
export type OrderCreateInput = z.infer<typeof api.orders.create.input>;
