import { calculatePrice } from '../lib/pricing';

console.log('=== TESTS DU NOUVEAU PRICING ===\n');

// Test 1: Mardi à Dimanche (5 jours) - Le cas problématique mentionné
console.log('Test 1: Mardi 10 Fév → Dimanche 15 Fév (5 jours)');
const test1 = calculatePrice(
    new Date('2026-02-10'), // Mardi
    new Date('2026-02-15'), // Dimanche
    'standard'
);
console.log('Résultat:', test1);
console.log('Attendu: ~320€ (2j semaine + 3j WE)');
console.log('---\n');

// Test 2: Vendredi à Lundi (72h weekend)
console.log('Test 2: Vendredi 13 Fév → Lundi 16 Fév (3 jours)');
const test2 = calculatePrice(
    new Date('2026-02-13'), // Vendredi
    new Date('2026-02-16'), // Lundi
    'standard'
);
console.log('Résultat:', test2);
console.log('Attendu: 200€ (package 72h WE)');
console.log('---\n');

// Test 3: Mardi à Vendredi (3 jours semaine)
console.log('Test 3: Mardi 10 Fév → Vendredi 13 Fév (3 jours)');
const test3 = calculatePrice(
    new Date('2026-02-10'),
    new Date('2026-02-13'),
    'standard'
);
console.log('Résultat:', test3);
console.log('Attendu: 180€ (3 × 60€)');
console.log('---\n');

// Test 4: Samedi retour (devrait être bloqué)
console.log('Test 4: Vendredi 13 Fév → Samedi 14 Fév (INVALIDE)');
const test4 = calculatePrice(
    new Date('2026-02-13'),
    new Date('2026-02-14'),
    'standard'
);
console.log('Résultat:', test4);
console.log('Attendu: Erreur "Retour impossible le samedi"');
console.log('---\n');

// Test 5: 5 jours semaine consécutifs
console.log('Test 5: Lundi 16 Fév → Samedi 21 Fév (5 jours semaine)');
const test5 = calculatePrice(
    new Date('2026-02-16'),
    new Date('2026-02-21'),
    'standard'
);
console.log('Résultat:', test5);
console.log('Attendu: 250€ (package 5j semaine)');
console.log('---\n');

console.log('=== FIN DES TESTS ===');
