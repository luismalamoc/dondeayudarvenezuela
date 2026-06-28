import { Plus, X } from 'lucide-react'
import { ESTADOS_VENEZUELA, PAISES } from '../lib/venezuela'
import type { CampaignFormValue, ContactoDraft } from '../lib/campaign'
import type { ContactoTipo } from '../types'

const CONTACT_PLACEHOLDERS: Record<ContactoTipo, string> = {
  instagram: '@tucuenta',
  twitter_x: '@tucuenta',
  whatsapp: '+58 412 1234567',
}

interface CampaignFieldsProps {
  value: CampaignFormValue
  onChange: (patch: Partial<CampaignFormValue>) => void
  idPrefix?: string
}

export default function CampaignFields({ value, onChange, idPrefix = 'campaign' }: CampaignFieldsProps) {
  function addContacto() {
    onChange({ contactos: [...value.contactos, { tipo: 'whatsapp', valor: '' }] })
  }

  function removeContacto(index: number) {
    onChange({ contactos: value.contactos.filter((_, i) => i !== index) })
  }

  function updateContacto(index: number, field: keyof ContactoDraft, fieldValue: string) {
    onChange({
      contactos: value.contactos.map((c, i) => (i === index ? { ...c, [field]: fieldValue } : c)),
    })
  }

  function handlePaisChange(newPais: string) {
    onChange({ pais: newPais, estadoVe: '' })
  }

  return (
    <>
      <div className="grid gap-1.5">
        <span className="text-sm font-bold text-slate-700">
          ¿Quién coordina la ayuda? <span className="text-red-600">*</span>
        </span>
        <div className="flex gap-3">
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-slate-300 px-4 py-3 has-[:checked]:border-[#071a3d] has-[:checked]:bg-[#f0f4ff]">
            <input
              type="radio"
              name={`${idPrefix}-tipo`}
              value="persona"
              checked={value.tipo === 'persona'}
              onChange={() => onChange({ tipo: 'persona' })}
              className="accent-[#071a3d]"
            />
            <span className="text-sm font-semibold text-slate-700">Persona</span>
          </label>
          <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-md border border-slate-300 px-4 py-3 has-[:checked]:border-[#071a3d] has-[:checked]:bg-[#f0f4ff]">
            <input
              type="radio"
              name={`${idPrefix}-tipo`}
              value="organizacion"
              checked={value.tipo === 'organizacion'}
              onChange={() => onChange({ tipo: 'organizacion' })}
              className="accent-[#071a3d]"
            />
            <span className="text-sm font-semibold text-slate-700">Organización</span>
          </label>
        </div>
      </div>

      <label className="grid gap-1.5">
        <span className="text-sm font-bold text-slate-700">
          Título de la campaña <span className="text-red-600">*</span>
        </span>
        <input
          required
          type="text"
          value={value.titulo}
          onChange={(e) => onChange({ titulo: e.target.value })}
          placeholder="Ej: Familia Rodríguez — damnificados en Caracas"
          className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-sm font-bold text-slate-700">
          Información para donar <span className="text-red-600">*</span>
        </span>
        <p className="text-xs text-slate-500">
          Pega aquí los datos de transferencia, links a GoFundMe, Donorbox, PayPal, Zelle, pago móvil, etc.
        </p>
        <textarea
          required
          rows={6}
          value={value.info}
          onChange={(e) => onChange({ info: e.target.value })}
          placeholder={'Banco Venezuela: cuenta 01234567890\nZelle: usuario@email.com\nhttps://gofundme.com/mi-campaña'}
          className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
        />
      </label>

      {/* Ubicación */}
      <div className="grid gap-3">
        <span className="text-sm font-bold text-slate-700">
          Ubicación <span className="text-red-600">*</span>
        </span>
        <select
          required
          value={value.pais}
          onChange={(e) => handlePaisChange(e.target.value)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#071a3d] focus:outline-none"
        >
          <option value="">Selecciona el país</option>
          {PAISES.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        {value.pais === 'VE' && (
          <select
            value={value.estadoVe}
            onChange={(e) => onChange({ estadoVe: e.target.value })}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-[#071a3d] focus:outline-none"
          >
            <option value="">Estado (opcional)</option>
            {ESTADOS_VENEZUELA.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        )}

        <input
          type="text"
          value={value.ciudad}
          onChange={(e) => onChange({ ciudad: e.target.value })}
          placeholder="Ciudad (opcional)"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
        />
      </div>

      {/* Contactos */}
      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">Contactos (opcional)</span>
          <button
            type="button"
            onClick={addContacto}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <Plus size={14} aria-hidden="true" />
            Agregar
          </button>
        </div>

        {value.contactos.length === 0 ? (
          <p className="text-xs text-slate-400">
            Agrega tu WhatsApp, Instagram o Twitter/X para que puedan contactarte.
          </p>
        ) : null}

        {value.contactos.map((c, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={c.tipo}
              onChange={(e) => updateContacto(i, 'tipo', e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm font-semibold text-slate-700"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
              <option value="twitter_x">Twitter/X</option>
            </select>
            <input
              type="text"
              value={c.valor}
              onChange={(e) => updateContacto(i, 'valor', e.target.value)}
              placeholder={CONTACT_PLACEHOLDERS[c.tipo]}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#071a3d] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeContacto(i)}
              className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Eliminar contacto"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
