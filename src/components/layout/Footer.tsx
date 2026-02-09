import { Phone } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-12 mb-20 text-center space-y-4 px-4 animate-fade-in-up">
            <div className="inline-block p-6 glass-panel rounded-2xl border border-white/10 max-w-2xl w-full">
                <p className="text-gray-300 font-montserrat text-sm mb-6">
                    Pour toute autre demande particulière ou spécifique (longue durée, shooting, événement),<br className="hidden md:block" />
                    veuillez nous contacter directement.
                </p>
                <a
                    href="https://wa.me/33762711498"
                    target="_blank"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-oswald tracking-wider transition uppercase text-sm font-bold shadow-lg shadow-green-900/20"
                >
                    <Phone className="w-4 h-4" /> Contacter sur WhatsApp
                </a>
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-8">
                © 2026 Perfect Drive - Location Premium
            </p>
            <div className="text-[10px] text-gray-600 uppercase tracking-widest mt-2">
                Développé par <a href="https://cnx-solutions.fr" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-alpine transition-colors font-bold">CNX Solutions</a>
            </div>
        </footer>
    );
}
