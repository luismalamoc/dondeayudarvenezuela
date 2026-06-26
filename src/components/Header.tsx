import { HandHeart } from 'lucide-react'

export default function Header() {
  const path = window.location.pathname

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <a href="/" className="flex items-center gap-3 text-lg font-black text-[#071a3d]">
          <span className="grid size-10 place-items-center rounded-md bg-[#ffdf42] text-[#071a3d]">
            <HandHeart size={22} aria-hidden="true" />
          </span>
          ¿Dónde ayudar Venezuela?
        </a>
        <nav className="flex items-center gap-3">
          <a
            href="/publicar"
            className={`rounded-md px-4 py-2 text-sm font-bold ${
              path.startsWith('/publicar')
                ? 'bg-slate-100 text-[#071a3d]'
                : 'bg-[#071a3d] text-white hover:bg-[#0d2a61]'
            }`}
          >
            Publicar
          </a>
          <a
            href="/acerca"
            className={`rounded-md px-3 py-2 text-sm font-bold ${
              path.startsWith('/acerca') ? 'text-[#071a3d]' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Acerca
          </a>
        </nav>
      </div>
    </header>
  )
}
