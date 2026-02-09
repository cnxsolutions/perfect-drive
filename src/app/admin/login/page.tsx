'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            alert('Erreur de connexion: ' + error.message);
            setLoading(false);
        } else {
            router.push('/admin/dashboard');
            router.refresh();
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 alpine-btn font-oswald font-bold rounded mt-4"
                    >
                        {loading ? 'Connexion...' : 'SE CONNECTER'}
                    </button>
                </form>
            </div>
        </div>
    );
}
