import Footer from '../components/Footer'
import Header from '../components/Header'

export default function Acerca() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9fc]">
      <Header />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-black text-[#071a3d]">¿Por qué existe este sitio?</h1>

        <div className="mt-8 space-y-5 text-base leading-7 text-slate-600">
          <p>
            Después del terremoto del 24 de junio de 2026 en Venezuela, las redes sociales se inundaron de información
            dispersa: cuentas bancarias en stories que expiran en 24 horas, hilos de Twitter imposibles de rastrear,
            grupos de WhatsApp con datos ya desactualizados. Querer ayudar y no saber exactamente cómo ni a quién se
            convirtió en una frustración real.
          </p>
          <p className="font-bold text-[#071a3d]">Este directorio nació para resolver eso.</p>
          <p>
            Un solo lugar donde cualquier persona puede publicar su campaña de ayuda directamente — sin intermediarios,
            sin moderación manual. Solo tú, tus datos de contacto y la información de cómo recibir donaciones.
          </p>
          <p>
            No recibo ni muevo dinero. No soy una ONG ni una organización formal. Soy una persona que vio el caos
            informativo y decidió hacer algo concreto.
          </p>
          <p>
            Si quieres publicar tu campaña, usa el botón <strong>Publicar</strong>. Si encontraste un dato incorrecto o
            quieres contactarme, escríbeme directamente.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-[#071a3d] px-5 py-3 font-black text-white hover:bg-[#0d2a61]"
          >
            Ver campañas
          </a>
          <a
            href="https://instagram.com/luismalamoc"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-100"
          >
            @luismalamoc
          </a>
          <a
            href="https://github.com/luismalamoc/dondeayudarvenezuela"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-5 py-3 font-bold text-slate-700 hover:bg-slate-100"
          >
            Código fuente
          </a>
        </div>
      </main>

      <Footer />
    </div>
  )
}
