import { z } from 'zod';
import { insertTicketSchema, updateTicketSchema, insertInventorySchema, updateInventorySchema } from './schema';

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
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  tickets: {
    list: {
      method: 'GET' as const,
      path: '/api/tickets' as const,
      responses: {
        200: z.array(z.any()), // returns TicketWithUsers[]
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/tickets/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tickets' as const,
      input: insertTicketSchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tickets/:id' as const,
      input: updateTicketSchema,
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
  },
  inventory: {
    list: {
      method: 'GET' as const,
      path: '/api/inventory' as const,
      responses: {
        200: z.array(z.any()), // returns InventoryWithAssignee[]
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/inventory/:id' as const,
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/inventory' as const,
      input: insertInventorySchema,
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/inventory/:id' as const,
      input: updateInventorySchema,
      responses: {
        200: z.any(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/inventory/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    addSupport: {
      method: 'POST' as const,
      path: '/api/inventory/:id/support' as const,
      input: z.object({ 
        description: z.string(),
        ticketId: z.number().optional(),
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
  },
  users: {
    list: {
      method: 'GET' as const,
      path: '/api/users' as const,
      responses: {
        200: z.array(z.any()), // returns UserData[]
      },
    },
    updateRole: {
      method: 'PATCH' as const,
      path: '/api/users/:id/role' as const,
      input: z.object({ role: z.enum(['usuario', 'analista', 'admin']) }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
      },
    },
    resetPassword: {
      method: 'POST' as const,
      path: '/api/users/:id/reset-password' as const,
      input: z.object({}),
      responses: {
        200: z.object({ temporaryPassword: z.string() }),
      },
    }
  },
  auth: {
    forgotPassword: {
      method: 'POST' as const,
      path: '/api/auth/forgot-password' as const,
      input: z.object({ email: z.string().email() }),
      responses: {
        200: z.object({ message: z.string(), temporaryPassword: z.string().optional(), emailSent: z.boolean().optional() }),
        404: errorSchemas.notFound,
      },
    },
    changePassword: {
      method: 'POST' as const,
      path: '/api/auth/change-password' as const,
      input: z.object({ currentPassword: z.string(), newPassword: z.string().min(6) }),
      responses: {
        200: z.object({ message: z.string() }),
      },
    }
  },
  reports: {
    exportTickets: {
      method: 'GET' as const,
      path: '/api/reports/tickets' as const,
      responses: {
        200: z.string(), // CSV content
      },
    }
  },
  uploads: {
    create: {
      method: 'POST' as const,
      path: '/api/uploads' as const,
      // input is FormData with 'file' field
      responses: {
        201: z.object({ url: z.string() }),
      }
    }
  }
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
