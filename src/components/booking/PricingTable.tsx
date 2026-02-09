export default function PricingTable() {
    return (
        <div className="glass-panel p-4 lg:p-6 rounded-xl animate-fade-in-up delay-200">
            <h3 className="font-oswald text-lg lg:text-xl text-alpine mb-4 tracking-[0.2em] uppercase flex items-center gap-3">
                <span className="text-2xl lg:text-3xl font-bold text-white/20">INFO</span> Tarifs
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-gray-400 font-montserrat min-w-[300px]">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-2 font-normal font-oswald tracking-wider text-white">Durée</th>
                            <th className="text-left p-2 font-normal font-oswald tracking-wider text-white">Standard</th>
                            <th className="text-left p-2 font-normal font-oswald tracking-wider text-white">Illimité</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-white/5">
                            <td className="p-2">Journée (Lun-Ven)</td>
                            <td className="p-2">60€ <span className="text-[10px] text-gray-500 block sm:inline">(150km)</span></td>
                            <td className="p-2 text-white font-bold">90€</td>
                        </tr>
                        <tr className="border-b border-white/5">
                            <td className="p-2">Week-end (48h)</td>
                            <td className="p-2">150€ <span className="text-[10px] text-gray-500 block sm:inline">(350km)</span></td>
                            <td className="p-2 text-white font-bold">200€</td>
                        </tr>
                        <tr>
                            <td className="p-2">Week-end (72h)</td>
                            <td className="p-2">200€ <span className="text-[10px] text-gray-500 block sm:inline">(400km)</span></td>
                            <td className="p-2 text-white font-bold">280€</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
