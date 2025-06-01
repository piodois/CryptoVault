// src/server/routers/_app.ts
import { createTRPCRouter } from '@/lib/trpc'
import { cryptoRouter } from './crypto'
import { portfolioRouter } from './portfolio'
import { watchlistRouter } from './watchlist'

export const appRouter = createTRPCRouter({
  crypto: cryptoRouter,
  portfolio: portfolioRouter,
  watchlist: watchlistRouter,
})

export type AppRouter = typeof appRouter