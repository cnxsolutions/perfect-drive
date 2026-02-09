import { calculatePrice } from '../lib/pricing';

// Test exact case
const start = new Date('2026-02-10'); // Mardi
const end = new Date('2026-02-15');   // Dimanche

console.log('Test: Mardi 10 → Dimanche 15');
console.log('Start:', start.toDateString());
console.log('End:', end.toDateString());

const result = calculatePrice(start, end, 'standard');
console.log('\nRésultat:', result);
console.log('\nAttendu: 320€ (2j semaine 120€ + Ven-Dim 72h 200€)');
