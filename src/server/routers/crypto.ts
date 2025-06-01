// src/server/routers/crypto.ts
import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '@/lib/trpc'
import { coinGeckoService } from '@/lib/services/coingecko'
import { prisma } from '@/lib/prisma'

export const cryptoRouter = createTRPCRouter({
  getTopCoins: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(20)
    }))
    .query(async ({ input }) => {
      try {
        const coins = await coinGeckoService.getTopCoins(input.limit)

        // Solo actualizar base de datos si tenemos datos reales (no fallback)
        if (coins.length > 0 && coins[0].current_price > 0) {
          try {
            for (const coin of coins.slice(0, 10)) { // Solo los primeros 10 para evitar sobrecarga
              await prisma.marketData.upsert({
                where: { coinId: coin.id },
                update: {
                  symbol: coin.symbol,
                  name: coin.name,
                  currentPrice: coin.current_price,
                  marketCap: coin.market_cap,
                  volume24h: coin.total_volume,
                  priceChange24h: coin.price_change_24h,
                  priceChangePercentage24h: coin.price_change_percentage_24h,
                  high24h: coin.high_24h,
                  low24h: coin.low_24h,
                  circulatingSupply: coin.circulating_supply,
                  totalSupply: coin.total_supply,
                  maxSupply: coin.max_supply,
                  lastUpdated: new Date()
                },
                create: {
                  coinId: coin.id,
                  symbol: coin.symbol,
                  name: coin.name,
                  currentPrice: coin.current_price,
                  marketCap: coin.market_cap,
                  volume24h: coin.total_volume,
                  priceChange24h: coin.price_change_24h,
                  priceChangePercentage24h: coin.price_change_percentage_24h,
                  high24h: coin.high_24h,
                  low24h: coin.low_24h,
                  circulatingSupply: coin.circulating_supply,
                  totalSupply: coin.total_supply,
                  maxSupply: coin.max_supply
                }
              })
            }
          } catch (dbError) {
            console.warn('Error updating database, continuing with API data:', dbError)
          }
        }

        return {
          success: true,
          data: coins,
          count: coins.length,
          isLiveData: coins.length > 0 && coins[0].current_price > 0
        }
      } catch (error) {
        console.error('Error in getTopCoins:', error)
        // No lanzar error, devolver datos vacíos
        return {
          success: false,
          data: [],
          count: 0,
          error: 'Error fetching crypto data',
          isLiveData: false
        }
      }
    }),

  getGlobalMarketData: publicProcedure
    .query(async () => {
      try {
        const globalData = await coinGeckoService.getGlobalMarketData()
        return {
          success: true,
          data: globalData,
          isLiveData: !!globalData
        }
      } catch (error) {
        console.error('Error fetching global market data:', error)
        return {
          success: false,
          data: null,
          error: 'Error fetching global market data',
          isLiveData: false
        }
      }
    }),

  getCoinDetails: publicProcedure
    .input(z.object({
      coinId: z.string()
    }))
    .query(async ({ input }) => {
      try {
        const coinDetails = await coinGeckoService.getCoinDetails(input.coinId)
        return {
          success: true,
          data: coinDetails
        }
      } catch (error) {
        console.error('Error fetching coin details:', error)
        return {
          success: false,
          data: null,
          error: 'Error fetching coin details'
        }
      }
    }),

  getCoinHistory: publicProcedure
    .input(z.object({
      coinId: z.string(),
      days: z.number().min(1).max(365).default(7)
    }))
    .query(async ({ input }) => {
      try {
        const history = await coinGeckoService.getCoinHistory(input.coinId, input.days)
        return {
          success: true,
          data: history
        }
      } catch (error) {
        console.error('Error fetching coin history:', error)
        return {
          success: false,
          data: null,
          error: 'Error fetching coin history'
        }
      }
    }),

  searchCoins: publicProcedure
    .input(z.object({
      query: z.string().min(1)
    }))
    .query(async ({ input }) => {
      try {
        const results = await coinGeckoService.searchCoins(input.query)
        return {
          success: true,
          data: results.slice(0, 10)
        }
      } catch (error) {
        console.error('Error searching coins:', error)
        return {
          success: false,
          data: [],
          error: 'Error searching coins'
        }
      }
    }),

  getMarketStatus: publicProcedure
    .query(() => {
      return {
        status: 'active',
        lastUpdate: new Date().toISOString(),
        message: 'CryptoVault API funcionando correctamente',
        version: '1.0.0'
      }
    }),
})