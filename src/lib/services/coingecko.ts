// src/lib/services/coingecko.ts
import axios, { AxiosError } from 'axios'

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3'

export interface CoinData {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  market_cap_rank: number
  circulating_supply: number
  total_supply: number | null
  max_supply: number | null
}

export interface CoinDetails extends CoinData {
  description: {
    en: string
  }
  links: {
    homepage: string[]
    blockchain_site: string[]
  }
  market_data: {
    price_change_percentage_7d: number
    price_change_percentage_30d: number
    price_change_percentage_1y: number
  }
}

export interface PriceHistory {
  prices: [number, number][]
  market_caps: [number, number][]
  total_volumes: [number, number][]
}

export interface GlobalData {
  data: {
    active_cryptocurrencies: number
    total_market_cap: {
      usd: number
    }
    total_volume: {
      usd: number
    }
    market_cap_percentage: {
      btc: number
      eth: number
    }
  }
}

interface SearchResult {
  id: string
  name: string
  symbol: string
  market_cap_rank: number
  thumb: string
}

class CoinGeckoService {
  private apiKey?: string
  private lastRequestTime = 0
  private readonly MIN_REQUEST_INTERVAL = 2000 // 2 segundos para API pública
  private requestCount = 0
  private readonly MAX_REQUESTS_PER_MINUTE = 25 // Límite conservador para API pública

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    // Solo usar API key si está disponible
    if (this.apiKey && this.apiKey.length > 10) {
      headers['X-CG-Demo-API-Key'] = this.apiKey
    }

    return headers
  }

  private async rateLimitedRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    // Resetear contador cada minuto
    if (now - this.lastRequestTime > 60000) {
      this.requestCount = 0
    }

    // Verificar límite de requests por minuto
    if (this.requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      console.warn('Rate limit alcanzado, usando datos de fallback')
      throw new Error('Rate limit exceeded')
    }

    if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
      const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }

    this.lastRequestTime = Date.now()
    this.requestCount++

    return requestFn()
  }

  async getTopCoins(limit = 20): Promise<CoinData[]> {
    try {
      return await this.rateLimitedRequest(async () => {
        console.log('Fetching live data from CoinGecko...')
        const response = await axios.get(`${COINGECKO_BASE_URL}/coins/markets`, {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: Math.min(limit, 100), // Reducir límite para API pública
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          },
          headers: this.getHeaders(),
          timeout: 30000, // Timeout más largo
        })

        console.log('✅ Live data fetched successfully')
        return response.data
      })
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('❌ Error fetching live data:', axiosError.response?.status, axiosError.response?.statusText)

      if (axiosError.response?.status === 401) {
        console.warn('🔑 API Key required or invalid. Using fallback data.')
        console.warn('💡 Get a free API key at: https://www.coingecko.com/en/api')
      } else if (axiosError.response?.status === 429) {
        console.warn('⏰ Rate limit exceeded. Using fallback data.')
      }

      console.log('📊 Using fallback data...')
      return this.getFallbackCoins()
    }
  }

  async getCoinDetails(coinId: string): Promise<CoinDetails | null> {
    try {
      return await this.rateLimitedRequest(async () => {
        const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coinId}`, {
          params: {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: false
          },
          headers: this.getHeaders(),
          timeout: 30000,
        })
        return response.data
      })
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('Error fetching coin details:', axiosError.response?.status, axiosError.response?.statusText)
      return null
    }
  }

  async getCoinsPrices(coinIds: string[]): Promise<Record<string, { usd: number }>> {
    if (coinIds.length === 0) return {}

    try {
      return await this.rateLimitedRequest(async () => {
        // Solo hacer request para los primeros 50 coins para evitar rate limits
        const limitedCoinIds = coinIds.slice(0, 50)

        const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
          params: {
            ids: limitedCoinIds.join(','),
            vs_currencies: 'usd'
          },
          headers: this.getHeaders(),
          timeout: 30000,
        })

        return response.data
      })
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('Error fetching coins prices:', axiosError.response?.status, axiosError.response?.statusText)

      // Devolver precios de fallback basados en los datos mock
      const fallbackPrices: Record<string, { usd: number }> = {}
      const fallbackCoins = this.getFallbackCoins()

      coinIds.forEach(coinId => {
        const fallbackCoin = fallbackCoins.find(coin => coin.id === coinId)
        if (fallbackCoin) {
          fallbackPrices[coinId] = { usd: fallbackCoin.current_price }
        }
      })

      return fallbackPrices
    }
  }

  async getCoinHistory(coinId: string, days = 7): Promise<PriceHistory | null> {
    try {
      return await this.rateLimitedRequest(async () => {
        const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coinId}/market_chart`, {
          params: {
            vs_currency: 'usd',
            days,
            interval: days <= 1 ? 'hourly' : 'daily'
          },
          headers: this.getHeaders(),
          timeout: 30000,
        })
        return response.data
      })
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('Error fetching coin history:', axiosError.response?.status, axiosError.response?.statusText)
      return null
    }
  }

  async searchCoins(query: string): Promise<SearchResult[]> {
    try {
      return await this.rateLimitedRequest(async () => {
        const response = await axios.get(`${COINGECKO_BASE_URL}/search`, {
          params: { query },
          headers: this.getHeaders(),
          timeout: 30000,
        })
        return response.data.coins || []
      })
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('Error searching coins:', axiosError.response?.status, axiosError.response?.statusText)
      return []
    }
  }

  async getGlobalMarketData(): Promise<GlobalData | null> {
    try {
      return await this.rateLimitedRequest(async () => {
        console.log('Fetching global market data...')
        const response = await axios.get(`${COINGECKO_BASE_URL}/global`, {
          headers: this.getHeaders(),
          timeout: 30000,
        })
        console.log('✅ Global data fetched successfully')
        return response.data
      })
    } catch (error) {
      const axiosError = error as AxiosError
      console.error('❌ Error fetching global market data:', axiosError.response?.status, axiosError.response?.statusText)

      if (axiosError.response?.status === 401) {
        console.warn('🔑 API Key required for global data. Using fallback.')
      }

      console.log('📊 Using fallback global data...')
      return this.getFallbackGlobalData()
    }
  }

  private getFallbackCoins(): CoinData[] {
    console.log('📊 Returning fallback cryptocurrency data')
    return [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
        current_price: 97243,
        price_change_percentage_24h: 1.8,
        market_cap: 1923456789012,
        total_volume: 28456789012,
        high_24h: 98500,
        low_24h: 95800,
        price_change_24h: 1720,
        market_cap_rank: 1,
        circulating_supply: 19759843,
        total_supply: 19759843,
        max_supply: 21000000
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
        current_price: 3678,
        price_change_percentage_24h: -0.8,
        market_cap: 442345678901,
        total_volume: 16789012345,
        high_24h: 3750,
        low_24h: 3620,
        price_change_24h: -29,
        market_cap_rank: 2,
        circulating_supply: 120280387,
        total_supply: 120280387,
        max_supply: null
      },
      {
        id: 'tether',
        symbol: 'usdt',
        name: 'Tether',
        image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
        current_price: 1.00,
        price_change_percentage_24h: 0.02,
        market_cap: 138456789012,
        total_volume: 45678901234,
        high_24h: 1.001,
        low_24h: 0.999,
        price_change_24h: 0.0002,
        market_cap_rank: 3,
        circulating_supply: 138456789012,
        total_supply: 138456789012,
        max_supply: null
      },
      {
        id: 'binancecoin',
        symbol: 'bnb',
        name: 'BNB',
        image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
        current_price: 715,
        price_change_percentage_24h: 2.1,
        market_cap: 103456789012,
        total_volume: 1234567890,
        high_24h: 725,
        low_24h: 698,
        price_change_24h: 14.7,
        market_cap_rank: 4,
        circulating_supply: 144684445,
        total_supply: 144684445,
        max_supply: 200000000
      },
      {
        id: 'solana',
        symbol: 'sol',
        name: 'Solana',
        image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
        current_price: 242,
        price_change_percentage_24h: 3.4,
        market_cap: 115678901234,
        total_volume: 3456789012,
        high_24h: 248,
        low_24h: 232,
        price_change_24h: 8.0,
        market_cap_rank: 5,
        circulating_supply: 477859131,
        total_supply: 577859131,
        max_supply: null
      },
      {
        id: 'usd-coin',
        symbol: 'usdc',
        name: 'USDC',
        image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
        current_price: 1.00,
        price_change_percentage_24h: -0.01,
        market_cap: 38456789012,
        total_volume: 5678901234,
        high_24h: 1.001,
        low_24h: 0.999,
        price_change_24h: -0.0001,
        market_cap_rank: 6,
        circulating_supply: 38456789012,
        total_supply: 38456789012,
        max_supply: null
      },
      {
        id: 'cardano',
        symbol: 'ada',
        name: 'Cardano',
        image: 'https://assets.coingecko.com/coins/images/975/large/cardano.png',
        current_price: 1.15,
        price_change_percentage_24h: 4.2,
        market_cap: 40123456789,
        total_volume: 2345678901,
        high_24h: 1.18,
        low_24h: 1.09,
        price_change_24h: 0.046,
        market_cap_rank: 7,
        circulating_supply: 34910000000,
        total_supply: 45000000000,
        max_supply: 45000000000
      },
      {
        id: 'dogecoin',
        symbol: 'doge',
        name: 'Dogecoin',
        image: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
        current_price: 0.385,
        price_change_percentage_24h: -2.1,
        market_cap: 56789012345,
        total_volume: 3456789012,
        high_24h: 0.398,
        low_24h: 0.372,
        price_change_24h: -0.008,
        market_cap_rank: 8,
        circulating_supply: 147456789012,
        total_supply: 147456789012,
        max_supply: null
      }
    ]
  }

  private getFallbackGlobalData(): GlobalData {
    console.log('📊 Returning fallback global market data')
    return {
      data: {
        active_cryptocurrencies: 17237,
        total_market_cap: {
          usd: 3456789012345
        },
        total_volume: {
          usd: 89012345678
        },
        market_cap_percentage: {
          btc: 55.7,
          eth: 12.8
        }
      }
    }
  }
}

export const coinGeckoService = new CoinGeckoService()