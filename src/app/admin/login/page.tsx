'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock } from 'lucide-react';
import { messageErreur } from '@/lib/errors';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [erreur, setErreur] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErreur(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                // Auparavant : alert('Erreur de connexion: ' + error.message), qui presentait
                // « Invalid API key » (une erreur de configuration serveur) comme un probleme
                // de mot de passe, et exposait le message brut de Supabase en anglais.
                console.error('[adminLogin] echec', { code: error.code, message: error.message });
                setErreur(messageErreur(error, 'auth'));
                return;
            }

            router.push('/admin/dashboard');
            router.refresh();
        } catch (e) {
            console.error('[adminLogin] echec de transport', e);
            setErreur(messageErreur(e, 'auth'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-darkbg flex items-center justify-center p-4">
            <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-white/10">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-alpine/20 flex items-center justify-center text-alpine">
                        <Lock className="w-8 h-8" />
                    </div>
                </div>
                <h1 className="text-2xl font-oswald text-white text-center mb-6 uppercase tracking-widest">
                    Administration
                </h1>

                <form onSubmit={handleLogin} className="space-y-4" suppressHydrationWarning>
                    <div>
                        <label className="text-xs font-montserrat text-gray-400 uppercase tracking-wider block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 glass-input rounded-lg text-white"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs font-montserrat text-gray-400 uppercase tracking-wider block mb-2">Mot de passe</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 glass-input rounded-lg text-white"
                            required
                        />
                    </div>

                    {erreur && (
                        <div
                            role="alert"
                            className="p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 text-sm font-montserrat"
                        >
                            {erreur}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 alpine-btn font-oswald font-bold rounded mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Connexion...' : 'SE CONNECTER'}
                    </button>
                </form>
            </div>
        </div>
    );
}
