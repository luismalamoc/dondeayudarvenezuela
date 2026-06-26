import { useEffect, useTransition, useState } from 'react'
import { AlertTriangle, Search } from 'lucide-react'
import CampaignCard from '../components/CampaignCard'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { getPublicaciones } from '../lib/api'
import { ESTADOS_VENEZUELA, PAISES } from '../lib/venezuela'
import type { Publicacion } from '../types'

const LIMIT = 20

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [inputQ, setInputQ] = useState('')
  const [searchQ, setSearchQ] = useState('')
  const [filterPais, setFilterPais] = useState('')
  const [filterEstado, setFilterEstado] = useState('')
  const [items, setItems] = useState<Publicacion[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState('')

  const [filterTipo, setFilterTipo] = useState('')

  const [isPending, startTransition] = useTransition()
  const [isLoadingMore, startLoadMoreTransition] = useTransition()

  // Initial fetch on mount — only place we use useEffect for data
  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getPublicaciones({ limit: LIMIT })
        setItems(data.publicaciones)
        setHasMore(data.hasMore)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      } finally {
        setLoading(false)
      }
    })
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = inputQ.trim()
    startTransition(async () => {
      try {
        const data = await getPublicaciones({
          q: q || undefined,
          tipo: filterTipo || undefined,
          pais: filterPais || undefined,
          estado_ve: filterEstado || undefined,
          limit: LIMIT,
        })
        setItems(data.publicaciones)
        setHasMore(data.hasMore)
        setSearchQ(q)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      }
    })
  }

  function handleTipoChange(newTipo: string) {
    setFilterTipo(newTipo)
    startTransition(async () => {
      try {
        const data = await getPublicaciones({
          q: searchQ || undefined,
          tipo: newTipo || undefined,
          pais: filterPais || undefined,
          estado_ve: filterEstado || undefined,
          limit: LIMIT,
        })
        setItems(data.publicaciones)
        setHasMore(data.hasMore)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      }
    })
  }

  function handlePaisChange(newPais: string) {
    setFilterPais(newPais)
    setFilterEstado('')
    startTransition(async () => {
      try {
        const data = await getPublicaciones({
          q: searchQ || undefined,
          tipo: filterTipo || undefined,
          pais: newPais || undefined,
          limit: LIMIT,
        })
        setItems(data.publicaciones)
        setHasMore(data.hasMore)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      }
    })
  }

  function handleEstadoChange(newEstado: string) {
    setFilterEstado(newEstado)
    startTransition(async () => {
      try {
        const data = await getPublicaciones({
          q: searchQ || undefined,
          tipo: filterTipo || undefined,
          pais: filterPais || undefined,
          estado_ve: newEstado || undefined,
          limit: LIMIT,
        })
        setItems(data.publicaciones)
        setHasMore(data.hasMore)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      }
    })
  }

  function handleClearFilters() {
    setInputQ('')
    setSearchQ('')
    setFilterTipo('')
    setFilterPais('')
    setFilterEstado('')
    startTransition(async () => {
      try {
        const data = await getPublicaciones({ limit: LIMIT })
        setItems(data.publicaciones)
        setHasMore(data.hasMore)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      }
    })
  }

  function handleLoadMore() {
    const offset = items.length
    startLoadMoreTransition(async () => {
      try {
        const data = await getPublicaciones({
          q: searchQ || undefined,
          tipo: filterTipo || undefined,
          pais: filterPais || undefined,
          estado_ve: filterEstado || undefined,
          limit: LIMIT,
          offset,
        })
        setItems((prev) => [...prev, ...data.publicaciones])
        setHasMore(data.hasMore)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar')
      }
    })
  }

  const paisLabel = PAISES.find((p) => p.code === filterPais)?.name

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      <Header />

      <div className="border-b border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-4xl gap-3 px-4 py-3 text-sm font-semibold leading-6 text-amber-950 sm:px-6">
          <AlertTriangle className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
          <p>
            Este sitio no recauda ni mueve dinero. Verifica siempre a quién le envías antes de transferir. Las campañas
            son publicadas directamente por sus autores.
          </p>
        </div>
      </div>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase tracking-wide text-[#b71c1c]">Terremoto Venezuela · Junio 2026</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-[#071a3d] sm:text-4xl">
            ¿Dónde puedo ayudar a Venezuela?
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Directorio de campañas activas publicadas por personas y organizaciones que reciben donaciones. Si tú
            también estás coordinando ayuda,{' '}
            <a href="/publicar" className="font-bold text-[#071a3d] underline hover:no-underline">
              publica tu campaña aquí
            </a>
            .
          </p>
        </section>

        <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="search"
              value={inputQ}
              onChange={(e) => setInputQ(e.target.value)}
              placeholder="Buscar en título e información…"
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#071a3d] px-4 py-2 text-sm font-bold text-white hover:bg-[#0d2a61]"
            >
              <Search size={15} aria-hidden="true" />
              Buscar
            </button>
          </form>

          <div className="mt-3 flex gap-2">
            {(['', 'persona', 'organizacion'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTipoChange(t)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
                  filterTipo === t
                    ? 'bg-[#071a3d] text-white'
                    : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t === '' ? 'Todos' : t === 'persona' ? 'Personas' : 'Organizaciones'}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <select
              value={filterPais}
              onChange={(e) => handlePaisChange(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-[#071a3d] focus:outline-none"
            >
              <option value="">Todos los países</option>
              {PAISES.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>

            {filterPais === 'VE' ? (
              <select
                value={filterEstado}
                onChange={(e) => handleEstadoChange(e.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-[#071a3d] focus:outline-none"
              >
                <option value="">Todos los estados</option>
                {ESTADOS_VENEZUELA.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            ) : null}

            {filterPais || filterEstado || searchQ || filterTipo ? (
              <button
                type="button"
                onClick={handleClearFilters}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50"
              >
                Limpiar filtros
              </button>
            ) : null}
          </div>

          {filterPais || filterEstado || searchQ || filterTipo ? (
            <p className="mt-2 text-xs text-slate-500">
              {filterTipo ? (filterTipo === 'persona' ? 'Personas' : 'Organizaciones') : null}
              {filterTipo && (searchQ || filterPais || filterEstado) ? ' · ' : null}
              {searchQ ? <>Buscando "{searchQ}"</> : null}
              {searchQ && (filterPais || filterEstado) ? ' · ' : null}
              {paisLabel ? <>{paisLabel}</> : null}
              {filterEstado ? `, ${filterEstado}` : null}
            </p>
          ) : null}
        </section>

        <section className="mt-4 grid gap-4">
          {loading || isPending ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-500">Cargando campañas…</p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 p-5 font-semibold text-red-800">{error}</p>
          ) : null}

          {!loading && !isPending && !error && items.length === 0 ? (
            <p className="rounded-lg border border-slate-200 bg-white p-5 text-slate-500">
              No hay campañas que coincidan con los filtros.{' '}
              <a href="/publicar" className="font-bold text-[#071a3d] underline">
                ¿Quieres publicar la tuya?
              </a>
            </p>
          ) : null}

          {items.map((pub) => (
            <CampaignCard key={pub.id} pub={pub} />
          ))}

          {hasMore ? (
            <button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              className="rounded-lg border border-slate-200 bg-white py-4 text-sm font-bold text-[#071a3d] shadow-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {isLoadingMore ? 'Cargando…' : 'Cargar más campañas'}
            </button>
          ) : null}
        </section>
      </main>

      <Footer />
    </div>
  )
}
