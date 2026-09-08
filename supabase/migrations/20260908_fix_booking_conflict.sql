-- Migration : corrige la detection de chevauchement des reservations
-- Date : 2026-09-08
--
-- NON APPLIQUEE AUTOMATIQUEMENT. A passer manuellement apres sauvegarde.
--
-- PROBLEME CONSTATE EN PRODUCTION
-- La version actuelle (20260402_multi_vehicles_stock_v2.sql) enumere des cas de
-- chevauchement au lieu de comparer des instants. Trois situations passent au travers,
-- verifiees sur la base reelle contre la reservation
-- « 2026-07-24 10:00 -> 2026-07-31 10:00 » du vehicule 13b659b5 :
--
--   creneau strictement identique            -> repond « libre »
--   meme date de debut, fin plus tot         -> repond « libre »
--   debut plus tard, meme date de fin        -> repond « libre »
--
-- Cause : dans le cas multi-jours, lorsque la date de bord est partagee, le test porte
-- sur `p_start_time < end_time` (l'heure de DEBUT demandee comparee a l'heure de FIN de
-- l'existante), avec des inegalites strictes qui echouent des que les heures sont egales.
-- Aucune branche ne couvre le cas ou les deux dates coincident.
--
-- CORRECTION
-- Une reservation occupe l'intervalle [date_debut + heure_debut, date_fin + heure_fin].
-- Deux intervalles se chevauchent si, et seulement si :
--     nouveau_debut < existante_fin  ET  nouveau_fin > existante_debut
-- Une seule expression, sans enumeration de cas, qui traite aussi le meme jour.
-- Les locations bout a bout (retour a 10:00, depart suivant a 10:00) restent autorisees.
--
-- AJOUT : p_exclude_booking_id permet de reverifier une reservation qu'on MODIFIE
-- sans qu'elle se detecte elle-meme. C'est ce qui manquait pour appeler ce garde-fou
-- depuis updateAdminBooking et approveBooking.

CREATE OR REPLACE FUNCTION check_booking_conflict(
    p_vehicle_id UUID,
    p_start_date DATE,
    p_end_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_overlapping_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_overlapping_count
    FROM bookings
    WHERE
        vehicle_id = p_vehicle_id
        AND status IN ('approved', 'paid')
        AND (p_exclude_booking_id IS NULL OR id <> p_exclude_booking_id)
        AND (
            (p_start_date + p_start_time) < (end_date + COALESCE(end_time::TIME, TIME '23:59'))
            AND
            (p_end_date + p_end_time) > (start_date + COALESCE(start_time::TIME, TIME '00:00'))
        );

    RETURN v_overlapping_count > 0;
END;
$$;

-- Verification a passer apres application. Attendu : true pour les trois premieres lignes.
--
-- SELECT check_booking_conflict(
--   '13b659b5-acaa-4ce3-b091-d6a8485327d9', '2026-07-24', '2026-07-31', '10:00', '10:00') AS identique;
-- SELECT check_booking_conflict(
--   '13b659b5-acaa-4ce3-b091-d6a8485327d9', '2026-07-24', '2026-07-29', '10:00', '10:00') AS meme_debut;
-- SELECT check_booking_conflict(
--   '13b659b5-acaa-4ce3-b091-d6a8485327d9', '2026-07-26', '2026-07-31', '10:00', '10:00') AS meme_fin;
-- SELECT check_booking_conflict(
--   '13b659b5-acaa-4ce3-b091-d6a8485327d9', '2026-08-05', '2026-08-10', '10:00', '10:00') AS sans_conflit;
