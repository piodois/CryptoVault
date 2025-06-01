// src/server/routers/portfolio.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/lib/trpc'
import { portfolioService } from '@/lib/services/portfolio'
import { TransactionType } from '@prisma/client'

export const portfolioRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const portfolio = await portfolioService.createPortfolio(input)
        return {
          success: true,
          data: portfolio
        }
      } catch (error) {
        console.error('Error creating portfolio:', error)
        throw new Error('Error creating portfolio')
      }
    }),

  getUserPortfolios: publicProcedure
    .input(z.object({
      userId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const portfolios = await portfolioService.getUserPortfolios(input.userId)
        return {
          success: true,
          data: portfolios
        }
      } catch (error) {
        console.error('Error fetching portfolios:', error)
        throw new Error('Error fetching portfolios')
      }
    }),

  getPortfolioById: publicProcedure
    .input(z.object({
      portfolioId: z.string(),
      userId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const portfolio = await portfolioService.getPortfolioById(input.portfolioId, input.userId)
        return {
          success: true,
          data: portfolio
        }
      } catch (error) {
        console.error('Error fetching portfolio:', error)
        throw new Error('Error fetching portfolio')
      }
    }),

  addTransaction: publicProcedure
    .input(z.object({
      portfolioId: z.string(),
      coinId: z.string(),
      symbol: z.string(),
      type: z.nativeEnum(TransactionType),
      amount: z.number().positive(),
      price: z.number().positive(),
      fee: z.number().min(0).optional(),
      notes: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      try {
        const transaction = await portfolioService.addTransaction(input)
        return {
          success: true,
          data: transaction
        }
      } catch (error) {
        console.error('Error adding transaction:', error)
        throw new Error('Error adding transaction')
      }
    }),

  deleteTransaction: publicProcedure
    .input(z.object({
      transactionId: z.string(),
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await portfolioService.deleteTransaction(input.transactionId, input.userId)
        return {
          success: true,
          data: result
        }
      } catch (error) {
        console.error('Error deleting transaction:', error)
        throw new Error('Error deleting transaction')
      }
    }),

  getPortfolioAnalytics: publicProcedure
    .input(z.object({
      portfolioId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const analytics = await portfolioService.getPortfolioAnalytics(input.portfolioId)
        return {
          success: true,
          data: analytics
        }
      } catch (error) {
        console.error('Error fetching portfolio analytics:', error)
        throw new Error('Error fetching portfolio analytics')
      }
    }),

  deletePortfolio: publicProcedure
    .input(z.object({
      portfolioId: z.string(),
      userId: z.string()
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await portfolioService.deletePortfolio(input.portfolioId, input.userId)
        return {
          success: true,
          data: result
        }
      } catch (error) {
        console.error('Error deleting portfolio:', error)
        throw new Error('Error deleting portfolio')
      }
    }),
})