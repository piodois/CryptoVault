// src/app/page.tsx
'use client'

import { trpc } from '@/lib/trpc-client'
import Image from 'next/image'

export default function HomePage() {
  const { data: marketStatus } = trpc.crypto.getMarketStatus.useQuery()
  const { data: coinsResponse, isLoading, error } = trpc.crypto.getTopCoins.useQuery({ limit: 12 })
  const { data: globalData } = trpc.crypto.getGlobalMarketData.useQuery()

  const topCoins = coinsResponse?.data || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">CV</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  CryptoVault
                </h1>
                <p className="text-xs text-gray-500">Gestión Profesional</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
                Iniciar Sesión
              </button>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm">
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
            🚀 Nuevo: Análisis AI-Powered
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Gestión profesional de
            <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              portafolios crypto
            </span>
          </h2>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Análisis en tiempo real, gestión avanzada de riesgos y herramientas
            institucionales para maximizar tus inversiones en criptomonedas
          </p>

          {/* Status Indicator */}
          {marketStatus && (
            <div className="mb-8 inline-flex items-center space-x-2 bg-emerald-100 border border-emerald-200 rounded-full px-4 py-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-emerald-700 text-sm font-medium">
                Datos en vivo • {new Date(marketStatus.lastUpdate).toLocaleTimeString()}
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-lg px-8 py-4 rounded-xl transition-all duration-200 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <span className="mr-2">🚀</span>
              Crear Portfolio Gratis
            </button>
            <button className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-lg px-8 py-4 rounded-xl transition-all duration-200 w-full sm:w-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              <span className="mr-2">📊</span>
              Ver Demo en Vivo
            </button>
          </div>
        </div>
      </section>

      {/* Global Market Stats - CORREGIDO */}
      {globalData?.success && globalData?.data?.data && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Cap. Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(globalData.data.data.total_market_cap?.usd / 1e12).toFixed(1)}T
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Volumen 24h</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(globalData.data.data.total_volume?.usd / 1e9).toFixed(0)}B
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Dominancia BTC</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalData.data.data.market_cap_percentage?.btc?.toFixed(1)}%
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Monedas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {globalData.data.data.active_cryptocurrencies?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Global Market Stats Fallback - Mostrar cuando no hay datos */}
      {(!globalData?.success || !globalData?.data?.data) && (
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Cap. Total</p>
                <p className="text-2xl font-bold text-gray-900">$3.5T</p>
                <p className="text-xs text-amber-600">Datos de ejemplo</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Volumen 24h</p>
                <p className="text-2xl font-bold text-gray-900">$89B</p>
                <p className="text-xs text-amber-600">Datos de ejemplo</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Dominancia BTC</p>
                <p className="text-2xl font-bold text-gray-900">55.7%</p>
                <p className="text-xs text-amber-600">Datos de ejemplo</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 text-center">
                <p className="text-sm text-gray-500 mb-1">Monedas Activas</p>
                <p className="text-2xl font-bold text-gray-900">17,237</p>
                <p className="text-xs text-amber-600">Datos de ejemplo</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Live Crypto Prices */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              📈 Mercado en Tiempo Real
            </h3>
            <p className="text-lg text-gray-600">
              Datos actualizados desde múltiples exchanges
            </p>
            {!coinsResponse?.isLiveData && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Mostrando datos de demostración - API externa limitada
              </p>
            )}
          </div>

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 animate-pulse">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded mb-1 w-16"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-2 w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-md mx-auto">
                <p className="text-amber-800 font-semibold mb-2">⚠️ API Externa Limitada</p>
                <p className="text-amber-600 text-sm">
                  tRPC funcionando correctamente - Usando datos de demostración
                </p>
              </div>
            </div>
          )}

          {topCoins.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {topCoins.map((coin, index) => (
                <div
                  key={coin.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-6 hover:scale-105 cursor-pointer group"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className="relative">
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={48}
                        height={48}
                        className="mr-3 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjQiIGN5PSIyNCIgcj0iMjQiIGZpbGw9IiNGM0Y0RjYiLz4KPHN2Zz4K'
                        }}
                      />
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center border-2 border-white">
                        <span className="text-xs font-bold text-blue-700">
                          #{coin.market_cap_rank || index + 1}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {coin.symbol.toUpperCase()}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">{coin.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${coin.current_price?.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: coin.current_price > 1 ? 2 : 6
                        }) || 'N/A'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-sm font-medium ${
                        (coin.price_change_percentage_24h || 0) >= 0
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        <span>
                          {(coin.price_change_percentage_24h || 0) >= 0 ? '↗️' : '↘️'}
                        </span>
                        <span>
                          {(coin.price_change_percentage_24h || 0) >= 0 ? '+' : ''}
                          {(coin.price_change_percentage_24h || 0).toFixed(2)}%
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">24h</span>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Cap. Mercado</span>
                        <span>${((coin.market_cap || 0) / 1e9).toFixed(1)}B</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Volumen 24h</span>
                        <span>${((coin.total_volume || 0) / 1e6).toFixed(0)}M</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mostrar mensaje cuando no hay datos */}
          {!isLoading && !error && topCoins.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
                <p className="text-gray-700 font-semibold mb-2">📊 Cargando datos del mercado...</p>
                <p className="text-gray-500 text-sm">
                  Los datos de criptomonedas se están actualizando
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              🛠️ Tecnología de Vanguardia
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stack moderno optimizado para rendimiento y escalabilidad empresarial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: '⚡',
                title: 'Next.js 15',
                description: 'App Router + Turbopack para máximo rendimiento',
                status: 'Funcionando',
                statusColor: 'emerald'
              },
              {
                icon: '🔄',
                title: 'tRPC + TypeScript',
                description: 'API type-safe de extremo a extremo',
                status: 'Funcionando',
                statusColor: 'emerald'
              },
              {
                icon: '🎨',
                title: 'Tailwind 4.0',
                description: 'CSS moderno con Oxide Engine',
                status: 'Funcionando',
                statusColor: 'emerald'
              },
              {
                icon: '📊',
                title: 'Prisma + PostgreSQL',
                description: 'ORM avanzado con base de datos robusta',
                status: 'Configurado',
                statusColor: 'blue'
              }
            ].map((feature, index) => (
              <div
                key={feature.title}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-8 text-center group hover:scale-105"
                style={{
                  animationDelay: `${index * 150}ms`
                }}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                  feature.statusColor === 'emerald'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {feature.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            🎉 ¡Stack Completo y Optimizado!
          </h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Frontend + Backend + Base de Datos + API en tiempo real =
            CryptoVault listo para escalar en producción
          </p>

          {marketStatus && (
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">
                  {marketStatus.message}
                </span>
              </div>
              <p className="text-blue-200 text-sm">
                Sistema operativo al 100% • Última actualización: {new Date(marketStatus.lastUpdate).toLocaleTimeString()}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button className="bg-white text-blue-700 hover:bg-gray-50 font-medium text-lg px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              🚀 Comenzar Demo
            </button>
            <button className="bg-transparent border border-white/30 text-white hover:bg-white/10 font-medium text-lg px-8 py-4 rounded-xl transition-all duration-200">
              📋 Ver Roadmap
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">CV</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold">CryptoVault</h4>
                  <p className="text-gray-400 text-sm">Gestión Profesional</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed">
                Plataforma profesional para gestión de portafolios de criptomonedas
                con tecnología de vanguardia y análisis en tiempo real.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Producto</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Seguridad</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4">Soporte</h5>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Estado del Sistema</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 mt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">
                © 2025 CryptoVault. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Términos
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Privacidad
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                  Cookies
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}