
-- ⚠️ ATTENTION : Ce script supprime TOUTES les données !

-- 1. Supprimer les fichiers du bucket 'booking-documents'
-- Cela supprime les entrées de la base de données. 
-- Supabase devrait nettoyer les fichiers physiques correspondants si les triggers sont actifs.
DELETE FROM storage.objects 
WHERE bucket_id = 'booking-documents';

-- 2. Vider la table des dates bloquées (celles liées aux réservations et celles manuelles)
TRUNCATE TABLE blocked_dates CASCADE;

-- 3. Vider la table des réservations
TRUNCATE TABLE bookings CASCADE;

-- Confirmation
SELECT 'Base de données nettoyée avec succès' as result;
