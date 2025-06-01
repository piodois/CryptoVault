// src/lib/trpc.ts
import { initTRPC } from '@trpc/server'
import { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch'
import { prisma } from '@/lib/prisma'
import superjson from 'superjson'
import { ZodError } from 'zod'

export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  // Simplemente no usamos la variable si no la necesitamos
  return {
    prisma,
    req: opts.req, // Ahora sí usamos opts
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure
export const protectedProcedure = t.procedure