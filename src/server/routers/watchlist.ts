// src/server/routers/watchlist.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/lib/trpc'
import { portfolioService } from '@/lib/services/portfolio'

export const watchlistRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      coinIds: z.array(z.string()).min(1).max(50),
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const watchlist = await portfolioService.createWatchlist(input)
        return {
          success: true,
          data: watchlist
        }
      } catch (error) {
        console.error('Error creating watchlist:', error)
        throw new Error('Error creating watchlist')
      }
    }),

  getUserWatchlists: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const watchlists = await portfolioService.getUserWatchlists(input.userId)
        return {
          success: true,
          data: watchlists
        }
      } catch (error) {
        console.error('Error fetching watchlists:', error)
        throw new Error('Error fetching watchlists')
      }
    }),

  getWatchlistCoins: publicProcedure
    .input(z.object({
      watchlistId: z.string(),
      userId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const result = await portfolioService.getWatchlistCoins(input.watchlistId, input.userId)
        return {
          success: true,
          data: result
        }
      } catch (error) {
        console.error('Error fetching watchlist coins:', error)
        throw new Error('Error fetching watchlist coins')
      }
    }),

  update: publicProcedure
    .input(z.object({
      watchlistId: z.string(),
      name: z.string().min(1).max(100).optional(),
      coinIds: z.array(z.string()).min(1).max(50).optional(),
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const watchlist = await portfolioService.updateWatchlist(input)
        return {
          success: true,
          data: watchlist
        }
      } catch (error) {
        console.error('Error updating watchlist:', error)
        throw new Error('Error updating watchlist')
      }
    }),

  delete: publicProcedure
    .input(z.object({
      watchlistId: z.string(),
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await portfolioService.deleteWatchlist(input.watchlistId, input.userId)
        return {
          success: true,
          data: result
        }
      } catch (error) {
        console.error('Error deleting watchlist:', error)
        throw new Error('Error deleting watchlist')
      }
    }),
})