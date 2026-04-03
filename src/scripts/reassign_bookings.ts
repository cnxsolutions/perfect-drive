import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Charge les variables manuellement au cas où dotenv serait absent
const envFile = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        process.env[match[1]] = match[2];
    }
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function run() {
    console.log('Recherche de la Clio V...');
    
    // Trouver le véhicule "clio V"
    const { data: vehicles, error: vError } = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .ilike('name', '%clio%');
        
    if (vError) {
        console.error('Erreur lors de la recherche du véhicule:', vError);
        return;
    }
    
    if (!vehicles || vehicles.length === 0) {
        console.log('Aucune Clio trouvée dans la base.');
        return;
    }

    const targetVehicle = vehicles[0]; // On prend la première Clio trouvée
    console.log(`Véhicule cible trouvé: ${targetVehicle.name} (ID: ${targetVehicle.id})`);

    // Trouver les réservations sans véhicule
    const { data: bookings, error: bError } = await supabaseAdmin
        .from('bookings')
        .select('*')
        .is('vehicle_id', null);

    if (bError) {
        console.error('Erreur lors de la recherche des réservations:', bError);
        return;
    }

    if (!bookings || bookings.length === 0) {
        console.log('Aucune réservation orpheline (Véhicule inconnu) trouvée.');
        return;
    }

    console.log(`${bookings.length} réservation(s) à réassigner...`);

    // Mettre à jour les réservations
    const { error: updateError } = await supabaseAdmin
        .from('bookings')
        .update({ vehicle_id: targetVehicle.id })
        .is('vehicle_id', null);

    if (updateError) {
        console.error('Erreur lors de la mise à jour:', updateError);
        return;
    }

    console.log('✅ Toutes les réservations inconnues ont été transférées avec succès à:', targetVehicle.name);
}

run();
