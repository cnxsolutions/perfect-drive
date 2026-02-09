
import { getUnavailableDates } from '../actions/booking';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verify() {
    console.log('Checking unavailable dates...');
    const dates = await getUnavailableDates();
    console.log('Unavailable Dates:', dates);
    if (dates.length === 0) {
        console.log('✅ No unavailable dates found. DB is likely clean.');
    } else {
        console.log(`❌ Found ${dates.length} unavailable dates.`);
    }
}

verify();
