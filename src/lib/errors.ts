/**
 * Traduction des erreurs techniques en messages lisibles par un humain.
 *
 * Pourquoi ce fichier existe : partout dans l'application, les blocs catch
 * renvoyaient « Une erreur est survenue », qui ne distingue pas une panne
 * reseau d'une immatriculation en double ou d'une migration manquante.
 * L'utilisateur ne savait pas quoi faire, et le support ne savait pas quoi
 * chercher. Une seule fabrique ici, appelee partout, rend ce cas impossible.
 *
 * Regle : le message dit CE QUI s'est passe et CE QU'IL FAUT FAIRE.
 */

/** Forme minimale d'une erreur Supabase / PostgREST. */
interface SupabaseLikeError {
    code?: string;
    message?: string;
    details?: string | null;
    hint?: string | null;
}

function asSupabaseError(error: unknown): SupabaseLikeError {
    if (typeof error === 'object' && error !== null) {
        return error as SupabaseLikeError;
    }
    return { message: String(error) };
}

/** Extrait le nom de colonne cite par Postgres, ex. "colonne « daily_rate »". */
function extractColumn(message: string): string | null {
    const patterns = [
        /column "([^"]+)"/i,
        /colonne « ([^»]+) »/i,
        /the '([^']+)' column/i,
        /Could not find the '([^']+)'/i,
    ];
    for (const p of patterns) {
        const m = message.match(p);
        if (m) return m[1];
    }
    return null;
}

/** Extrait le nom de contrainte cite par Postgres. */
function extractConstraint(message: string): string | null {
    const m = message.match(/constraint "([^"]+)"/i) ?? message.match(/contrainte « ([^»]+) »/i);
    return m ? m[1] : null;
}

/**
 * Contexte metier, pour que le meme code d'erreur produise la bonne phrase
 * selon l'ecran d'ou il vient.
 */
export type ErrorContext =
    | 'vehicule'
    | 'reservation'
    | 'document'
    | 'email'
    | 'auth'
    | 'disponibilite'
    | 'generique';

const LIBELLE: Record<ErrorContext, string> = {
    vehicule: 'du vehicule',
    reservation: 'de la reservation',
    document: 'du document',
    email: "de l'e-mail",
    auth: 'de la connexion',
    disponibilite: 'de la disponibilite',
    generique: 'de l’operation',
};

/**
 * Transforme n'importe quelle erreur en message francais precis et actionnable.
 * Ne renvoie JAMAIS une chaine vide ni un message generique sans indice.
 */
export function messageErreur(error: unknown, contexte: ErrorContext = 'generique'): string {
    const e = asSupabaseError(error);
    const code = e.code ?? '';
    const brut = e.message ?? '';
    const quoi = LIBELLE[contexte];

    // --- Configuration / connectivite -------------------------------------
    if (/Invalid API key/i.test(brut)) {
        return "La connexion a la base de donnees est refusee (cle d'API invalide). "
            + 'Verifiez NEXT_PUBLIC_SUPABASE_ANON_KEY et SUPABASE_SERVICE_ROLE_KEY dans le fichier .env.local, puis redemarrez le serveur.';
    }
    if (/JWT expired|token is expired/i.test(brut)) {
        return 'Votre session a expire. Reconnectez-vous pour poursuivre.';
    }
    if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|network|Failed to fetch/i.test(brut)) {
        return "Le serveur de donnees est injoignable. Verifiez votre connexion internet, "
            + 'puis reessayez dans quelques instants. Si le probleme persiste, le service Supabase est peut-etre indisponible.';
    }

    // --- Schema de base desynchronise du code ------------------------------
    if (code === 'PGRST204' || /schema cache/i.test(brut)) {
        const col = extractColumn(brut);
        return col
            ? `Le code tente d'enregistrer le champ « ${col} », qui n'existe pas (ou plus) dans la base. `
              + 'Une migration a ete appliquee sans mettre le code a jour : corrigez le champ ou appliquez la migration manquante.'
            : "Le schema de la base ne correspond pas au code de l'application. Une migration est manquante ou incomplete.";
    }
    if (code === '42703') {
        const col = extractColumn(brut);
        return `La colonne ${col ? `« ${col} » ` : ''}est absente de la base. Appliquez les migrations en attente (dossier supabase/migrations).`;
    }
    if (code === '42P01') {
        return "La table visee n'existe pas dans la base. Appliquez les migrations en attente (dossier supabase/migrations).";
    }

    // --- Contraintes d'integrite -------------------------------------------
    if (code === '23505') {
        const contrainte = extractConstraint(brut) ?? '';
        if (/registration|immatricul/i.test(contrainte + brut)) {
            return "Ce numero d'immatriculation est deja utilise par un autre vehicule. Saisissez une immatriculation differente.";
        }
        return `Cet enregistrement existe deja${contrainte ? ` (contrainte ${contrainte})` : ''}. Modifiez la valeur en double avant d'enregistrer.`;
    }
    if (code === '23503') {
        if (contexte === 'vehicule') {
            return 'Ce vehicule ne peut pas etre supprime : des reservations y sont rattachees. '
                + 'Masquez-le aux clients, ou supprimez d\'abord ses reservations.';
        }
        return "Cet element est reference ailleurs et ne peut pas etre supprime tant que ces liens existent.";
    }
    if (code === '23502') {
        const col = extractColumn(brut);
        return col
            ? `Le champ obligatoire « ${col} » est vide. Renseignez-le avant d'enregistrer.`
            : "Un champ obligatoire est vide. Verifiez le formulaire avant d'enregistrer.";
    }
    if (code === '23514') {
        const contrainte = extractConstraint(brut);
        return contrainte
            ? `Une valeur saisie n'est pas autorisee (regle « ${contrainte} »). Verifiez les champs a choix limite.`
            : "Une valeur saisie n'est pas autorisee par la base. Verifiez les champs a choix limite.";
    }
    if (code === '22P02' || /invalid input syntax/i.test(brut)) {
        if (/type time/i.test(brut)) {
            return "Heure de depart ou de retour invalide. Utilisez le format HH:MM (ex. 09:30) et ne laissez pas le champ vide.";
        }
        if (/type date|timestamp/i.test(brut)) {
            return 'Date invalide. Selectionnez les dates dans le calendrier.';
        }
        if (/type numeric|integer|double/i.test(brut)) {
            return 'Un montant ou un nombre est mal saisi. Utilisez un point comme separateur decimal (ex. 187.50).';
        }
        return 'Une valeur saisie est dans un format invalide. Verifiez les champs du formulaire.';
    }
    if (code === '22001') {
        return 'Une valeur saisie est trop longue pour ce champ. Raccourcissez le texte.';
    }
    if (code === '22003') {
        return 'Un montant saisi est trop grand. Verifiez les tarifs saisis.';
    }

    // --- Droits ------------------------------------------------------------
    if (code === '42501' || /row-level security|RLS/i.test(brut)) {
        return "L'operation est refusee par les regles de securite de la base. "
            + 'Verifiez que vous etes bien connecte en administrateur.';
    }
    if (code === 'PGRST301' || /permission denied/i.test(brut)) {
        return "Vous n'avez pas les droits necessaires pour cette operation.";
    }

    // --- Absence de resultat ------------------------------------------------
    if (code === 'PGRST116') {
        return `Aucun enregistrement trouve. L'element a peut-etre ete supprime entre-temps ; rechargez la page.`;
    }

    // --- Stockage de fichiers ----------------------------------------------
    if (/Payload too large|exceeded the maximum allowed size|body exceeded/i.test(brut)) {
        return 'Le fichier envoye est trop volumineux (limite : 10 Mo au total). '
            + 'Compressez vos images ou envoyez-les une par une.';
    }
    if (/Bucket not found/i.test(brut)) {
        return "L'espace de stockage des fichiers est introuvable. Le bucket Supabase Storage n'a pas ete cree ; "
            + 'appliquez la migration 20260402_add_storage_bucket.sql.';
    }
    if (/mime type|not supported/i.test(brut)) {
        return "Ce format de fichier n'est pas accepte. Envoyez une image (JPG, PNG) ou un PDF.";
    }
    if (/Duplicate|already exists/i.test(brut) && contexte === 'document') {
        return 'Un fichier du meme nom existe deja. Renommez le fichier et reessayez.';
    }

    // --- Envoi d'e-mails ----------------------------------------------------
    if (contexte === 'email') {
        if (/API key is invalid|Missing API key|unauthorized/i.test(brut)) {
            return "L'envoi d'e-mails est mal configure (cle Resend invalide ou absente). "
                + 'Renseignez RESEND_API_KEY dans .env.local.';
        }
        if (/domain is not verified|not verified/i.test(brut)) {
            return "Le domaine d'expedition n'est pas verifie chez Resend : les e-mails ne partiront pas tant qu'il ne l'est pas.";
        }
        if (/rate limit|too many requests/i.test(brut)) {
            return "Trop d'e-mails envoyes en peu de temps. Patientez une minute avant de reessayer.";
        }
    }

    // --- Authentification ---------------------------------------------------
    if (contexte === 'auth' || /Invalid login credentials/i.test(brut)) {
        if (/Invalid login credentials/i.test(brut)) {
            return 'E-mail ou mot de passe incorrect.';
        }
        if (/Email not confirmed/i.test(brut)) {
            return "Cette adresse e-mail n'a pas encore ete confirmee. Consultez votre boite de reception.";
        }
        if (/rate limit|too many/i.test(brut)) {
            return 'Trop de tentatives de connexion. Patientez quelques minutes avant de reessayer.';
        }
        if (/User not found/i.test(brut)) {
            return 'Aucun compte administrateur ne correspond a cette adresse e-mail.';
        }
    }

    // --- Repli : on n'invente rien, on montre la cause technique -----------
    const detail = brut || (code ? `code ${code}` : 'cause inconnue');
    return `Echec ${quoi}. Cause technique : ${detail}`;
}

/**
 * Journalise l'erreur cote serveur avec son contexte, et renvoie le message
 * destine a l'ecran. Un seul appel remplace le couple console.error + message.
 */
export function echec(
    operation: string,
    error: unknown,
    contexte: ErrorContext = 'generique'
): { success: false; error: string } {
    const e = asSupabaseError(error);
    console.error(`[${operation}] echec`, {
        code: e.code ?? null,
        message: e.message ?? String(error),
        details: e.details ?? null,
        hint: e.hint ?? null,
    });
    return { success: false, error: messageErreur(error, contexte) };
}
