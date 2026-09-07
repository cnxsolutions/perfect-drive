import { Vehicle } from '@/types/vehicle';

interface PricingTableProps {
    vehicle?: Vehicle;
}

/**
 * Ce tableau doit annoncer EXACTEMENT ce que src/lib/pricing.ts facturera.
 * Auparavant il ignorait `allow_unlimited_mileage` et codait « 350 km » en dur,
 * si bien qu'un vehicule sans kilometrage illimite affichait 300 km / 350 km
 * alors que le moteur facturait 200 km / 400 km. Les regles ci-dessous sont
 * reprises telles quelles de pricing.ts (getWeekdayRate et getWeekendPackage).
 */
export default function PricingTable({ vehicle }: PricingTableProps) {
    // `??` et non `||` : un tarif enregistre a 0 est une donnee a montrer,
    // pas une valeur absente qu'il faudrait remplacer par une constante.
    const dailyRate = Number(vehicle?.daily_rate ?? 60);
    const unlimitedRate = Number(vehicle?.unlimited_rate ?? (dailyRate + 30));
    const weekendRate = Number(vehicle?.weekend_rate ?? 150);
    const weekendUnlimitedRate = Number(vehicle?.weekend_unlimited_rate ?? (weekendRate + 50));

    // Memes expressions que pricing.ts lignes 16 et 35.
    const illimiteActif = vehicle?.allow_unlimited_mileage !== false;
    const kmStandard = vehicle?.allow_unlimited_mileage === false
        ? 200
        : (vehicle?.mileage_standard_limit ?? 150);
    const kmWeekend = vehicle?.allow_unlimited_mileage === false ? 400 : 350;

    return (
        <div className="glass-panel p-4 lg:p-6 rounded-xl animate-fade-in-up delay-200">
            <h3 className="font-oswald text-lg lg:text-xl text-alpine mb-4 tracking-[0.2em] uppercase flex items-center justify-center lg:justify-start gap-3">
                <span className="text-2xl lg:text-3xl font-bold text-white/20">INFO</span> Tarifs
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-xs text-gray-400 font-montserrat min-w-[300px]">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left p-2 font-normal font-oswald tracking-wider text-white">Durée</th>
                            <th className="text-left p-2 font-normal font-oswald tracking-wider text-white">Limité</th>
                            {/* Ne pas annoncer un tarif que le client ne peut pas selectionner :
                                BookingForm masque le bouton « Illimite » dans ce cas. */}
                            {illimiteActif && (
                                <th className="text-left p-2 font-normal font-oswald tracking-wider text-white">Illimité</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-white/5">
                            <td className="p-2">Journée (Lun-Ven)</td>
                            <td className="p-2">{dailyRate}€ <span className="text-[10px] text-gray-500 block sm:inline">({kmStandard}km)</span></td>
                            {illimiteActif && <td className="p-2 text-white font-bold">{unlimitedRate}€</td>}
                        </tr>
                        <tr>
                            <td className="p-2">Week-end (48h)</td>
                            <td className="p-2">{weekendRate}€ <span className="text-[10px] text-gray-500 block sm:inline">({kmWeekend}km)</span></td>
                            {illimiteActif && <td className="p-2 text-white font-bold">{weekendUnlimitedRate}€</td>}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
