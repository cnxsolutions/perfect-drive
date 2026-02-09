import { addDays, isFriday, differenceInCalendarDays } from 'date-fns';

const start = new Date('2026-02-10'); // Mardi
const end = new Date('2026-02-15');   // Dimanche
const days = differenceInCalendarDays(end, start);

console.log('Start:', start.toDateString());
console.log('End:', end.toDateString());
console.log('Days:', days);
console.log('\nChecking each day:');

for (let i = 0; i <= days; i++) {
    const day = addDays(start, i);
    const isFri = isFriday(day);
    console.log(`  i=${i}: ${day.toDateString()} - isFriday=${isFri}`);

    if (isFri) {
        const sunday = addDays(day, 2);
        const afterDays = differenceInCalendarDays(end, sunday);
        console.log(`    Sunday: ${sunday.toDateString()}`);
        console.log(`    afterDays: ${afterDays}`);
        console.log(`    sunday === end? ${sunday.getTime() === end.getTime()}`);
    }
}
