import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-purple-500 selection:text-white">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Volver al Inicio
        </Link>

        <header className="mb-12 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
            Política de Privacidad
          </h1>
          <p className="text-gray-400">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </header>

        <div className="space-y-12 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Database className="text-purple-400" />
              1. Datos que Recopilamos
            </h2>
            <p className="mb-4">
              Para proporcionar nuestros servicios, Synthlat recopila y almacena la siguiente información limitada:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-purple-500">
              <li><strong>Información de Usuario:</strong> ID de Discord, nombre de usuario, avatar y discriminador.</li>
              <li><strong>Información de Servidores:</strong> ID del servidor, nombre, icono, roles y canales (solo para configuración).</li>
              <li><strong>Configuraciones:</strong> Preferencias de módulos (bienvenida, niveles, economía, etc.) establecidas por los administradores.</li>
              <li><strong>Datos de Uso:</strong> Estadísticas de niveles (XP), balance de economía, inventario y registros de infracciones.</li>
              <li><strong>Contenido Generado:</strong> Stickers personalizados subidos por el usuario (URL y nombre).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="text-blue-400" />
              2. Uso de la Información
            </h2>
            <p className="mb-4">
              Utilizamos los datos recopilados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-blue-500">
              <li>Operar y mantener las funcionalidades del bot (ej. mostrar niveles, gestionar economía).</li>
              <li>Permitir la configuración personalizada a través del panel de control web.</li>
              <li>Procesar reportes de moderación automatizada (si está activado por el servidor).</li>
              <li>Mejorar la seguridad y prevenir abusos del servicio.</li>
            </ul>
            <p className="mt-4 bg-white/5 p-4 rounded-lg border-l-4 border-blue-500">
              <strong>Nota Importante:</strong> No vendemos, alquilamos ni compartimos tus datos personales con terceros con fines comerciales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="text-green-400" />
              3. Almacenamiento y Seguridad
            </h2>
            <p className="mb-4">
              Tus datos se almacenan en bases de datos seguras con acceso restringido. Implementamos medidas técnicas como cifrado de claves API y tokens de sesión para proteger tu información contra accesos no autorizados.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <UserCheck className="text-yellow-400" />
              4. Tus Derechos
            </h2>
            <p className="mb-4">
              Como usuario de Synthlat, tienes derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 marker:text-yellow-500">
              <li><strong>Acceder:</strong> Puedes ver la mayoría de tus datos directamente en el comando <code>/profile</code> o en el dashboard web.</li>
              <li><strong>Rectificar:</strong> Puedes actualizar tus configuraciones en cualquier momento.</li>
              <li><strong>Eliminar:</strong> Puedes solicitar la eliminación completa de tus datos (Derecho al Olvido) contactando a nuestro soporte o expulsando al bot de tu servidor (lo que eliminará la configuración del servidor).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="text-red-400" />
              5. Contacto
            </h2>
            <p>
              Si tienes preguntas sobre esta política o deseas ejercer tus derechos, por favor únete a nuestro <a href="/discord" className="text-purple-400 hover:underline">Servidor de Soporte</a> o contáctanos directamente a través de Discord.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
