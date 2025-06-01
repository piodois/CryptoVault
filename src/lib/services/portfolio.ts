// src/lib/services/portfolio.ts
import { prisma } from '@/lib/prisma'
import { coinGeckoService } from './coingecko'
import { TransactionType } from '@prisma/client'

export interface CreatePortfolioInput {
  name: string
  description?: string
  userId: string
}

export interface AddTransactionInput {
  portfolioId: string
  coinId: string
  symbol: string
  type: TransactionType
  amount: number
  price: number
  fee?: number
  notes?: string
}

export interface CreateWatchlistInput {
  name: string
  coinIds: string[]
  userId: string
}

export interface UpdateWatchlistInput {
  watchlistId: string
  name?: string
  coinIds?: string[]
  userId: string
}

export interface PortfolioAnalytics {
  currentValue: number
  totalInvested: number
  totalReturn: number
  returnPercentage: number
  holdingsCount: number
  transactionsCount: number
  topPerformer: {
    symbol: string
    gainPercentage: number
  } | null
  worstPerformer: {
    symbol: string
    lossPercentage: number
  } | null
  totalGains: number
  totalLosses: number
  diversificationScore: number
  averageHoldingPeriod: number
}

export interface HoldingWithCurrentValue {
  id: string
  portfolioId: string
  coinId: string
  symbol: string
  amount: number
  averagePrice: number
  totalValue: number
  currentPrice: number
  currentValue: number
  gainLoss: number
  gainLossPercentage: number
  createdAt: Date
  updatedAt: Date
}

class PortfolioService {
  async createPortfolio(input: CreatePortfolioInput) {
    const portfolio = await prisma.portfolio.create({
      data: {
        name: input.name,
        description: input.description,
        userId: input.userId,
        isDefault: false
      },
      include: {
        holdings: true,
        transactions: true
      }
    })

    return portfolio
  }

  async getUserPortfolios(userId: string) {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        holdings: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const portfoliosWithValues = await Promise.all(
      portfolios.map(async (portfolio) => {
        const totalValue = await this.calculatePortfolioValue(portfolio.id)
        return { ...portfolio, totalValue }
      })
    )

    return portfoliosWithValues
  }

  async getPortfolioById(portfolioId: string, userId: string) {
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId
      },
      include: {
        holdings: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!portfolio) {
      throw new Error('Portfolio no encontrado')
    }

    const currentValue = await this.calculatePortfolioValue(portfolioId)
    const holdingsWithValues = await this.getHoldingsWithCurrentValues(portfolioId)

    return {
      ...portfolio,
      currentValue,
      holdingsWithValues
    }
  }

  async getHoldingsWithCurrentValues(portfolioId: string): Promise<HoldingWithCurrentValue[]> {
    const holdings = await prisma.portfolioHolding.findMany({
      where: { portfolioId }
    })

    if (holdings.length === 0) return []

    const coinIds = holdings.map(h => h.coinId)
    const currentPrices = await coinGeckoService.getCoinsPrices(coinIds)

    return holdings.map(holding => {
      const currentPrice = currentPrices[holding.coinId]?.usd || 0
      const currentValue = holding.amount * currentPrice
      const gainLoss = currentValue - (holding.amount * holding.averagePrice)
      const gainLossPercentage = holding.averagePrice > 0
        ? ((currentPrice - holding.averagePrice) / holding.averagePrice) * 100
        : 0

      return {
        ...holding,
        currentPrice,
        currentValue,
        gainLoss,
        gainLossPercentage
      }
    })
  }

  async addTransaction(input: AddTransactionInput) {
    const transaction = await prisma.transaction.create({
      data: {
        portfolioId: input.portfolioId,
        coinId: input.coinId,
        symbol: input.symbol,
        type: input.type,
        amount: input.amount,
        price: input.price,
        totalValue: input.amount * input.price,
        fee: input.fee || 0,
        notes: input.notes
      }
    })

    // Actualizar holding correspondiente
    if (input.type === 'BUY') {
      await this.addOrUpdateHolding({
        portfolioId: input.portfolioId,
        coinId: input.coinId,
        symbol: input.symbol,
        amount: input.amount,
        price: input.price
      })
    } else {
      await this.reduceHolding(input.portfolioId, input.coinId, input.amount)
    }

    // Actualizar valor total del portfolio
    await this.calculatePortfolioValue(input.portfolioId)

    return transaction
  }

  async deleteTransaction(transactionId: string, userId: string) {
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        portfolio: {
          userId
        }
      },
      include: {
        portfolio: true
      }
    })

    if (!transaction) {
      throw new Error('Transacción no encontrada')
    }

    // Revertir el efecto de la transacción
    if (transaction.type === 'BUY') {
      await this.reduceHolding(transaction.portfolioId, transaction.coinId, transaction.amount)
    } else {
      await this.addOrUpdateHolding({
        portfolioId: transaction.portfolioId,
        coinId: transaction.coinId,
        symbol: transaction.symbol,
        amount: transaction.amount,
        price: transaction.price
      })
    }

    await prisma.transaction.delete({
      where: { id: transactionId }
    })

    // Recalcular valor del portfolio
    await this.calculatePortfolioValue(transaction.portfolioId)

    return { success: true }
  }

  private async addOrUpdateHolding(input: {
    portfolioId: string
    coinId: string
    symbol: string
    amount: number
    price: number
  }) {
    const existingHolding = await prisma.portfolioHolding.findUnique({
      where: {
        portfolioId_coinId: {
          portfolioId: input.portfolioId,
          coinId: input.coinId
        }
      }
    })

    if (existingHolding) {
      const newAmount = existingHolding.amount + input.amount
      const newAveragePrice = (
        (existingHolding.amount * existingHolding.averagePrice) +
        (input.amount * input.price)
      ) / newAmount

      return await prisma.portfolioHolding.update({
        where: { id: existingHolding.id },
        data: {
          amount: newAmount,
          averagePrice: newAveragePrice,
        }
      })
    }

    return await prisma.portfolioHolding.create({
      data: {
        portfolioId: input.portfolioId,
        coinId: input.coinId,
        symbol: input.symbol,
        amount: input.amount,
        averagePrice: input.price,
        totalValue: input.amount * input.price
      }
    })
  }

  private async reduceHolding(portfolioId: string, coinId: string, amount: number) {
    const holding = await prisma.portfolioHolding.findUnique({
      where: {
        portfolioId_coinId: {
          portfolioId,
          coinId
        }
      }
    })

    if (!holding) {
      throw new Error('Holding no encontrado')
    }

    const newAmount = holding.amount - amount

    if (newAmount <= 0) {
      await prisma.portfolioHolding.delete({
        where: { id: holding.id }
      })
    } else {
      await prisma.portfolioHolding.update({
        where: { id: holding.id },
        data: {
          amount: newAmount,
        }
      })
    }
  }

  async calculatePortfolioValue(portfolioId: string): Promise<number> {
    const holdings = await prisma.portfolioHolding.findMany({
      where: { portfolioId }
    })

    if (holdings.length === 0) {
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { totalValue: 0 }
      })
      return 0
    }

    const coinIds = holdings.map(h => h.coinId)
    const currentPrices = await coinGeckoService.getCoinsPrices(coinIds)

    let totalValue = 0
    for (const holding of holdings) {
      const currentPrice = currentPrices[holding.coinId]?.usd || 0
      const holdingValue = holding.amount * currentPrice
      totalValue += holdingValue

      // Actualizar valor del holding
      await prisma.portfolioHolding.update({
        where: { id: holding.id },
        data: { totalValue: holdingValue }
      })
    }

    // Actualizar valor total del portfolio
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { totalValue }
    })

    return totalValue
  }

  async getPortfolioAnalytics(portfolioId: string): Promise<PortfolioAnalytics> {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        holdings: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!portfolio) {
      throw new Error('Portfolio no encontrado')
    }

    const currentValue = await this.calculatePortfolioValue(portfolioId)
    const holdingsWithValues = await this.getHoldingsWithCurrentValues(portfolioId)

    // Calcular inversión total
    const buyTransactions = portfolio.transactions.filter(t => t.type === 'BUY')
    const sellTransactions = portfolio.transactions.filter(t => t.type === 'SELL')

    const totalInvested = buyTransactions.reduce((sum, t) => sum + t.totalValue + t.fee, 0)
    const totalSold = sellTransactions.reduce((sum, t) => sum + t.totalValue - t.fee, 0)

    const netInvested = totalInvested - totalSold
    const totalReturn = currentValue - netInvested
    const returnPercentage = netInvested > 0 ? (totalReturn / netInvested) * 100 : 0

    // Encontrar mejor y peor performer
    let topPerformer: { symbol: string; gainPercentage: number } | null = null
    let worstPerformer: { symbol: string; lossPercentage: number } | null = null

    if (holdingsWithValues.length > 0) {
      let bestGain = -Infinity
      let worstLoss = Infinity

      for (const holding of holdingsWithValues) {
        if (holding.gainLossPercentage > bestGain) {
          bestGain = holding.gainLossPercentage
          topPerformer = {
            symbol: holding.symbol.toUpperCase(),
            gainPercentage: holding.gainLossPercentage
          }
        }

        if (holding.gainLossPercentage < worstLoss) {
          worstLoss = holding.gainLossPercentage
          worstPerformer = {
            symbol: holding.symbol.toUpperCase(),
            lossPercentage: holding.gainLossPercentage
          }
        }
      }
    }

    const totalGains = holdingsWithValues
      .filter(h => h.gainLoss > 0)
      .reduce((sum, h) => sum + h.gainLoss, 0)

    const totalLosses = Math.abs(holdingsWithValues
      .filter(h => h.gainLoss < 0)
      .reduce((sum, h) => sum + h.gainLoss, 0))

    // Calcular score de diversificación (0-100)
    const diversificationScore = this.calculateDiversificationScore(holdingsWithValues)

    // Calcular período promedio de holding en días
    const averageHoldingPeriod = this.calculateAverageHoldingPeriod(portfolio.transactions)

    return {
      currentValue,
      totalInvested: netInvested,
      totalReturn,
      returnPercentage,
      holdingsCount: portfolio.holdings.length,
      transactionsCount: portfolio.transactions.length,
      topPerformer,
      worstPerformer,
      totalGains,
      totalLosses,
      diversificationScore,
      averageHoldingPeriod
    }
  }

  private calculateDiversificationScore(holdings: HoldingWithCurrentValue[]): number {
    if (holdings.length === 0) return 0
    if (holdings.length === 1) return 20 // Muy poco diversificado

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0)
    if (totalValue === 0) return 0

    // Calcular índice Herfindahl-Hirschman (HHI)
    const marketShares = holdings.map(h => h.currentValue / totalValue)
    const hhi = marketShares.reduce((sum, share) => sum + (share * share), 0)

    // Convertir HHI a score de diversificación (0-100)
    // HHI va de 1/n (perfectamente diversificado) a 1 (concentrado)
    const maxHHI = 1
    const minHHI = 1 / holdings.length
    const normalizedHHI = (hhi - minHHI) / (maxHHI - minHHI)

    return Math.max(0, Math.min(100, (1 - normalizedHHI) * 100))
  }

  private calculateAverageHoldingPeriod(transactions: { type: string; createdAt: Date }[]): number {
    if (transactions.length === 0) return 0

    const buyTransactions = transactions.filter(t => t.type === 'BUY')
    if (buyTransactions.length === 0) return 0

    const now = new Date()
    const totalDays = buyTransactions.reduce((sum, tx) => {
      const daysSincePurchase = Math.floor(
        (now.getTime() - new Date(tx.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      )
      return sum + daysSincePurchase
    }, 0)

    return Math.floor(totalDays / buyTransactions.length)
  }

  async deletePortfolio(portfolioId: string, userId: string) {
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        id: portfolioId,
        userId
      }
    })

    if (!portfolio) {
      throw new Error('Portfolio no encontrado')
    }

    if (portfolio.isDefault) {
      throw new Error('No se puede eliminar el portfolio por defecto')
    }

    await prisma.portfolio.delete({
      where: { id: portfolioId }
    })

    return { success: true }
  }

  // Métodos para Watchlists
  async createWatchlist(input: CreateWatchlistInput) {
    const watchlist = await prisma.watchlist.create({
      data: {
        name: input.name,
        coinIds: input.coinIds,
        userId: input.userId
      }
    })

    return watchlist
  }

  async getUserWatchlists(userId: string) {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return watchlists
  }

  async getWatchlistById(watchlistId: string, userId: string) {
    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: watchlistId,
        userId
      }
    })

    if (!watchlist) {
      throw new Error('Watchlist no encontrada')
    }

    return watchlist
  }

  async updateWatchlist(input: UpdateWatchlistInput) {
    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: input.watchlistId,
        userId: input.userId
      }
    })

    if (!watchlist) {
      throw new Error('Watchlist no encontrada')
    }

    const updatedWatchlist = await prisma.watchlist.update({
      where: { id: input.watchlistId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.coinIds && { coinIds: input.coinIds })
      }
    })

    return updatedWatchlist
  }

  async deleteWatchlist(watchlistId: string, userId: string) {
    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: watchlistId,
        userId
      }
    })

    if (!watchlist) {
      throw new Error('Watchlist no encontrada')
    }

    await prisma.watchlist.delete({
      where: { id: watchlistId }
    })

    return { success: true }
  }

  async getWatchlistCoins(watchlistId: string, userId: string) {
    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: watchlistId,
        userId
      }
    })

    if (!watchlist) {
      throw new Error('Watchlist no encontrada')
    }

    if (watchlist.coinIds.length === 0) {
      return {
        watchlist,
        coins: []
      }
    }

    // Obtener datos actualizados de las monedas
    try {
      const allCoins = await coinGeckoService.getTopCoins(250) // Obtener más monedas para mayor cobertura
      const watchlistCoins = allCoins.filter(coin => watchlist.coinIds.includes(coin.id))

      // Si no encontramos algunas monedas, obtenerlas individualmente
      const foundCoinIds = watchlistCoins.map(coin => coin.id)
      const missingCoinIds = watchlist.coinIds.filter(id => !foundCoinIds.includes(id))

      const missingCoins = []
      for (const coinId of missingCoinIds) {
        try {
          const coinDetails = await coinGeckoService.getCoinDetails(coinId)
          if (coinDetails) {
            missingCoins.push({
              id: coinDetails.id,
              symbol: coinDetails.symbol,
              name: coinDetails.name,
              image: coinDetails.image,
              current_price: coinDetails.current_price,
              price_change_percentage_24h: coinDetails.price_change_percentage_24h,
              market_cap: coinDetails.market_cap,
              total_volume: coinDetails.total_volume,
              high_24h: coinDetails.high_24h,
              low_24h: coinDetails.low_24h,
              price_change_24h: coinDetails.price_change_24h,
              market_cap_rank: coinDetails.market_cap_rank,
              circulating_supply: coinDetails.circulating_supply,
              total_supply: coinDetails.total_supply,
              max_supply: coinDetails.max_supply
            })
          }
        } catch (error) {
          console.warn(`No se pudo obtener datos para ${coinId}:`, error)
        }
      }

      const allWatchlistCoins = [...watchlistCoins, ...missingCoins]

      return {
        watchlist,
        coins: allWatchlistCoins
      }
    } catch (error) {
      console.error('Error obteniendo datos de monedas:', error)
      return {
        watchlist,
        coins: []
      }
    }
  }

  async addCoinToWatchlist(watchlistId: string, coinId: string, userId: string) {
    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: watchlistId,
        userId
      }
    })

    if (!watchlist) {
      throw new Error('Watchlist no encontrada')
    }

    if (watchlist.coinIds.includes(coinId)) {
      throw new Error('La moneda ya está en la watchlist')
    }

    const updatedCoinIds = [...watchlist.coinIds, coinId]

    const updatedWatchlist = await prisma.watchlist.update({
      where: { id: watchlistId },
      data: { coinIds: updatedCoinIds }
    })

    return updatedWatchlist
  }

  async removeCoinFromWatchlist(watchlistId: string, coinId: string, userId: string) {
    const watchlist = await prisma.watchlist.findFirst({
      where: {
        id: watchlistId,
        userId
      }
    })

    if (!watchlist) {
      throw new Error('Watchlist no encontrada')
    }

    if (!watchlist.coinIds.includes(coinId)) {
      throw new Error('La moneda no está en la watchlist')
    }

    const updatedCoinIds = watchlist.coinIds.filter(id => id !== coinId)

    const updatedWatchlist = await prisma.watchlist.update({
      where: { id: watchlistId },
      data: { coinIds: updatedCoinIds }
    })

    return updatedWatchlist
  }

  // Métodos para Alertas
  async createAlert(input: {
    userId: string
    coinId: string
    symbol: string
    condition: 'ABOVE' | 'BELOW'
    targetPrice: number
  }) {
    const alert = await prisma.alert.create({
      data: {
        userId: input.userId,
        coinId: input.coinId,
        symbol: input.symbol,
        condition: input.condition,
        targetPrice: input.targetPrice,
        isActive: true
      }
    })

    return alert
  }

  async getUserAlerts(userId: string) {
    const alerts = await prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    })

    return alerts
  }

  async updateAlert(alertId: string, userId: string, data: {
    targetPrice?: number
    isActive?: boolean
  }) {
    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        userId
      }
    })

    if (!alert) {
      throw new Error('Alerta no encontrada')
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data
    })

    return updatedAlert
  }

  async deleteAlert(alertId: string, userId: string) {
    const alert = await prisma.alert.findFirst({
      where: {
        id: alertId,
        userId
      }
    })

    if (!alert) {
      throw new Error('Alerta no encontrada')
    }

    await prisma.alert.delete({
      where: { id: alertId }
    })

    return { success: true }
  }

  async checkAlerts() {
    const activeAlerts = await prisma.alert.findMany({
      where: {
        isActive: true,
        isTriggered: false
      }
    })

    if (activeAlerts.length === 0) return []

    const uniqueCoinIds = [...new Set(activeAlerts.map(alert => alert.coinId))]
    const currentPrices = await coinGeckoService.getCoinsPrices(uniqueCoinIds)

    const triggeredAlerts = []

    for (const alert of activeAlerts) {
      const currentPrice = currentPrices[alert.coinId]?.usd

      if (!currentPrice) continue

      let shouldTrigger = false

      if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) {
        shouldTrigger = true
      } else if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) {
        shouldTrigger = true
      }

      if (shouldTrigger) {
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            isTriggered: true,
            triggeredAt: new Date()
          }
        })

        triggeredAlerts.push({
          ...alert,
          currentPrice
        })
      }
    }

    return triggeredAlerts
  }
}

export const portfolioService = new PortfolioService()