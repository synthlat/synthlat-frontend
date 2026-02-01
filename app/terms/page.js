import Link from 'next/link';
import { ArrowLeft, Gavel, AlertTriangle, Copyright, Server, Ban } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        <header className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Términos de Servicio
          </h1>
          <p className="text-gray-400">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="space-y-12 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Gavel className="text-purple-400" />
              1. Aceptación de los Términos
            </h2>
            <p>
              Al invitar a Synthlat a tu servidor de Discord, iniciar sesión en nuestro panel de control o utilizar cualquiera de sus funciones, aceptas estar legalmente vinculado por estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Server className="text-blue-400" />
              2. Uso del Servicio
            </h2>
            <p className="mb-4">
              Synthlat se proporciona "tal cual" y "según disponibilidad". Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del servicio en cualquier momento sin previo aviso.
            </p>
            <p>
              Te comprometes a utilizar el bot de manera responsable y de acuerdo con las <a href="https://discord.com/guidelines" target="_blank" className="text-blue-400 hover:underline">Directrices de la Comunidad de Discord</a> y sus <a href="https://discord.com/terms" target="_blank" className="text-blue-400 hover:underline">Términos de Servicio</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Ban className="text-red-400" />
              3. Conducta Prohibida
            </h2>
            <p className="mb-4">
              Está estrictamente prohibido utilizar Synthlat para:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-red-500">
              <li>Subir o distribuir contenido ilegal, incluyendo material de abuso sexual infantil (CSAM), gore real o contenido que promueva el terrorismo.</li>
              <li>Acosar, intimidar o amenazar a otros usuarios.</li>
              <li>Intentar explotar vulnerabilidades del bot, realizar ingeniería inversa o saturar nuestros sistemas (spam de comandos).</li>
              <li>Utilizar la función de "Stickers" para alojar imágenes que violen derechos de autor o sean ofensivas.</li>
            </ul>
            <div className="mt-4 bg-red-500/10 border border-red-500/20 p-4 rounded-lg flex gap-3">
              <AlertTriangle className="text-red-400 shrink-0 mt-1" />
              <p className="text-sm">
                La violación de estas normas resultará en el bloqueo permanente de tu cuenta y/o servidor de nuestros servicios, y el reporte a Discord Trust & Safety si corresponde.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Copyright className="text-yellow-400" />
              4. Propiedad Intelectual
            </h2>
            <p>
              El código fuente, diseño, logotipos y marca de Synthlat son propiedad exclusiva de sus desarrolladores. No puedes copiar, modificar ni distribuir nuestro software sin autorización explícita.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="text-orange-400" />
              5. Limitación de Responsabilidad
            </h2>
            <p>
              En la máxima medida permitida por la ley, los desarrolladores de Synthlat no serán responsables de ningún daño directo, indirecto, incidental o consecuente resultante del uso o la imposibilidad de usar el servicio, incluyendo la pérdida de datos (ej. configuraciones de servidor o economía).
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
