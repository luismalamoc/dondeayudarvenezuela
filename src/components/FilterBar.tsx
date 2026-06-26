import type { Dictionary } from '../i18n/types'
import type { Filters, MethodType } from '../types'
import { CURRENCIES } from '../lib/currencies'

interface FilterBarProps {
  filters: Filters
  setFilters: React.Dispatch<React.SetStateAction<Filters>>
  t: Dictionary
}

const methodOptions: MethodType[] = [
  'banco_ve',
  'banco_us',
  'banco_cl',
  'zelle',
  'paypal',
  'donorbox',
  'globalgiving',
  'pago_movil',
]

export default function FilterBar({ filters, setFilters, t }: FilterBarProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-label={t.filters.title}>
      <div className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.filters.type}
          <select
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value as Filters['type'] }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            <option value="all">{t.filters.all}</option>
            <option value="persona">{t.filters.personas}</option>
            <option value="organizacion">{t.filters.organizaciones}</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.filters.method}
          <select
            value={filters.method}
            onChange={(event) => setFilters((current) => ({ ...current, method: event.target.value as Filters['method'] }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            <option value="all">{t.filters.all}</option>
            {methodOptions.map((method) => (
              <option key={method} value={method}>
                {t.methodLabels[method]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          {t.filters.currency}
          <select
            value={filters.currency}
            onChange={(event) => setFilters((current) => ({ ...current, currency: event.target.value }))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900"
          >
            <option value="all">{t.filters.all}</option>
            {CURRENCIES.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {t.lang === 'en' ? currency.nombre_en : currency.nombre_es}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => setFilters({ type: 'all', method: 'all', currency: 'all' })}
          className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
        >
          {t.filters.clear}
        </button>
      </div>
    </section>
  )
}
