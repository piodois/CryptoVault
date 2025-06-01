// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario de ejemplo
  const user = await prisma.user.upsert({
    where: { email: 'demo@cryptovault.com' },
    update: {},
    create: {
      email: 'demo@cryptovault.com',
      name: 'Usuario Demo',
      avatar: null
    }
  })

  console.log('✅ Usuario creado:', user.email)

  // Crear portfolio de ejemplo
  const portfolio = await prisma.portfolio.upsert({
    where: { id: 'demo-portfolio' },
    update: {},
    create: {
      id: 'demo-portfolio',
      name: 'Mi Portfolio Principal',
      description: 'Portfolio de demostración con las principales criptomonedas',
      userId: user.id,
      isDefault: true,
      totalValue: 0
    }
  })

  console.log('✅ Portfolio creado:', portfolio.name)

  // Agregar transacciones de ejemplo
  const transactions = [
    {
      portfolioId: portfolio.id,
      coinId: 'bitcoin',
      symbol: 'btc',
      type: 'BUY' as const,
      amount: 0.5,
      price: 45000,
      totalValue: 22500,
      fee: 50
    },
    {
      portfolioId: portfolio.id,
      coinId: 'ethereum',
      symbol: 'eth',
      type: 'BUY' as const,
      amount: 2.0,
      price: 2800,
      totalValue: 5600,
      fee: 25
    },
    {
      portfolioId: portfolio.id,
      coinId: 'cardano',
      symbol: 'ada',
      type: 'BUY' as const,
      amount: 1000,
      price: 0.8,
      totalValue: 800,
      fee: 10
    }
  ]

  for (const transaction of transactions) {
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        portfolioId: transaction.portfolioId,
        coinId: transaction.coinId,
        type: transaction.type
      }
    })

    if (!existingTransaction) {
      await prisma.transaction.create({
        data: transaction
      })
    }
  }

  console.log('✅ Transacciones creadas')

  // Agregar holdings de ejemplo
  const holdings = [
    {
      portfolioId: portfolio.id,
      coinId: 'bitcoin',
      symbol: 'btc',
      amount: 0.5,
      averagePrice: 45000,
      totalValue: 22500
    },
    {
      portfolioId: portfolio.id,
      coinId: 'ethereum',
      symbol: 'eth',
      amount: 2.0,
      averagePrice: 2800,
      totalValue: 5600
    },
    {
      portfolioId: portfolio.id,
      coinId: 'cardano',
      symbol: 'ada',
      amount: 1000,
      averagePrice: 0.8,
      totalValue: 800
    }
  ]

  for (const holding of holdings) {
    await prisma.portfolioHolding.upsert({
      where: {
        portfolioId_coinId: {
          portfolioId: holding.portfolioId,
          coinId: holding.coinId
        }
      },
      update: {},
      create: holding
    })
  }

  console.log('✅ Holdings creados')

  // Crear watchlist de ejemplo - CORREGIDO: usar array en lugar de string JSON
  await prisma.watchlist.upsert({
    where: { id: 'demo-watchlist' },
    update: {},
    create: {
      id: 'demo-watchlist',
      name: 'Top Cryptos',
      coinIds: ['bitcoin', 'ethereum', 'binancecoin', 'cardano', 'solana'], // Array directo
      userId: user.id
    }
  })

  console.log('✅ Watchlist creada')

  // Crear alertas de ejemplo
  const alerts = [
    {
      userId: user.id,
      coinId: 'bitcoin',
      symbol: 'btc',
      condition: 'ABOVE' as const,
      targetPrice: 100000,
      isActive: true
    },
    {
      userId: user.id,
      coinId: 'ethereum',
      symbol: 'eth',
      condition: 'BELOW' as const,
      targetPrice: 3000,
      isActive: true
    }
  ]

  for (const alert of alerts) {
    const existingAlert = await prisma.alert.findFirst({
      where: {
        userId: alert.userId,
        coinId: alert.coinId,
        condition: alert.condition
      }
    })

    if (!existingAlert) {
      await prisma.alert.create({
        data: alert
      })
    }
  }

  console.log('✅ Alertas creadas')

  // Actualizar valor total del portfolio
  const totalValue = holdings.reduce((sum, holding) => sum + holding.totalValue, 0)
  await prisma.portfolio.update({
    where: { id: portfolio.id },
    data: { totalValue }
  })

  console.log('✅ Valor del portfolio actualizado:', totalValue)

  // Crear algunos datos de mercado de ejemplo
  const marketDataSample = [
    {
      coinId: 'bitcoin',
      symbol: 'btc',
      name: 'Bitcoin',
      currentPrice: 95000,
      marketCap: 1800000000000,
      volume24h: 25000000000,
      priceChange24h: 2300,
      priceChangePercentage24h: 2.5,
      high24h: 96000,
      low24h: 93000,
      circulatingSupply: 19000000,
      totalSupply: 19000000,
      maxSupply: 21000000
    },
    {
      coinId: 'ethereum',
      symbol: 'eth',
      name: 'Ethereum',
      currentPrice: 3500,
      marketCap: 420000000000,
      volume24h: 15000000000,
      priceChange24h: -42,
      priceChangePercentage24h: -1.2,
      high24h: 3600,
      low24h: 3400,
      circulatingSupply: 120000000,
      totalSupply: 120000000,
      maxSupply: null
    }
  ]

  for (const marketData of marketDataSample) {
    await prisma.marketData.upsert({
      where: { coinId: marketData.coinId },
      update: {},
      create: marketData
    })
  }

  console.log('✅ Datos de mercado de ejemplo creados')

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })