# Gestion des Véhicules - Guide d'Utilisation

## Vue d'ensemble

Le système de gestion des véhicules permet aux administrateurs de :
- **Ajouter** de nouveaux véhicules au parc
- **Modifier** les détails des véhicules existants
- **Supprimer** les véhicules
- **Contrôler** la disponibilité des véhicules

## Structure

### Tables de Base de Données

#### Table `vehicles`
```sql
- id (UUID)
- name (TEXT) - Nom du véhicule
- brand (TEXT) - Marque
- model (TEXT) - Modèle
- registration_number (TEXT) - Immatriculation
- color (TEXT) - Couleur
- year (INTEGER) - Année
- seats (INTEGER) - Nombre de places
- transmission (TEXT) - Automatique/Manuelle
- fuel_type (TEXT) - Type de carburant
- daily_rate (DECIMAL) - Tarif journalier
- weekend_rate (DECIMAL) - Tarif week-end
- mileage_standard_limit (INTEGER) - Kilométrage inclus
- mileage_excess_rate (DECIMAL) - Tarif km supplémentaire
- is_available (BOOLEAN) - Disponibilité
- insurance_until (DATE) - Assurance valide jusqu'au
- inspection_until (DATE) - Inspection valide jusqu'au
- description (TEXT) - Description
- image_url (TEXT) - URL de l'image
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Types TypeScript

```typescript
// src/types/vehicle.ts
export interface Vehicle {
    id: string;
    created_at: string;
    updated_at: string;
    name: string;
    brand: string;
    model: string;
    registration_number: string;
    color?: string;
    year?: number;
    seats: number;
    transmission: 'manual' | 'automatic';
    fuel_type: 'petrol' | 'diesel' | 'hybrid' | 'electric';
    daily_rate: number;
    weekend_rate?: number;
    mileage_standard_limit: number;
    mileage_excess_rate: number;
    is_available: boolean;
    insurance_until?: string;
    inspection_until?: string;
    description?: string;
    image_url?: string;
}
```

### Actions (Server Side)

#### `createVehicle(data: CreateVehicleDTO)`
Crée un nouveau véhicule.

**Paramètres :**
- `data` : Objet avec tous les détails du véhicule

**Retour :**
```typescript
{ success: true, vehicle: Vehicle } | { success: false, error: string }
```

#### `getVehicles()`
Récupère la liste de tous les véhicules.

**Retour :**
```typescript
{ success: true, vehicles: Vehicle[] } | { success: false, error: string }
```

#### `getVehicleById(id: string)`
Récupère un véhicule spécifique.

**Paramètres :**
- `id` : UUID du véhicule

**Retour :**
```typescript
{ success: true, vehicle: Vehicle } | { success: false, error: string }
```

#### `updateVehicle(id: string, data: Partial<CreateVehicleDTO>)`
Met à jour un véhicule existant.

**Paramètres :**
- `id` : UUID du véhicule
- `data` : Champs à mettre à jour

**Retour :**
```typescript
{ success: true, vehicle: Vehicle } | { success: false, error: string }
```

#### `deleteVehicle(id: string)`
Supprime un véhicule.

**Paramètres :**
- `id` : UUID du véhicule

**Retour :**
```typescript
{ success: true } | { success: false, error: string }
```

#### `toggleVehicleAvailability(id: string, isAvailable: boolean)`
Change l'état de disponibilité d'un véhicule.

**Paramètres :**
- `id` : UUID du véhicule
- `isAvailable` : Nouvel état de disponibilité

**Retour :**
```typescript
{ success: true, vehicle: Vehicle } | { success: false, error: string }
```

### Composants

#### `AddVehicleModal`
Modal pour ajouter un nouveau véhicule.

**Props :**
```typescript
{
    onClose: () => void;
    onSuccess?: () => void;
}
```

**Utilisation :**
```tsx
import AddVehicleModal from '@/components/admin/AddVehicleModal';

export default function MyComponent() {
    const [showModal, setShowModal] = useState(false);
    
    return (
        <>
            <button onClick={() => setShowModal(true)}>Ajouter</button>
            {showModal && (
                <AddVehicleModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        // Rafraîchir la liste
                    }}
                />
            )}
        </>
    );
}
```

#### `EditVehicleModal`
Modal pour modifier un véhicule existant.

**Props :**
```typescript
{
    vehicleId: string;
    onClose: () => void;
    onSuccess?: () => void;
}
```

#### `VehicleList`
Composant affichant la liste des véhicules avec actions.

**Props :**
```typescript
{
    vehicles: Vehicle[];
    onRefresh: () => void;
}
```

## Installation & Déploiement

### 1. Créer la table en base de données

Option A - Via Supabase Dashboard :
1. Allez à **SQL Editor**
2. Créez une nouvelle requête
3. Copiez le contenu de `supabase/migrations/20260330_add_vehicles.sql`
4. Exécutez la requête

Option B - Via CLI (si configuré) :
```bash
supabase db push
```

### 2. Accéder à la page de gestion

L'interface de gestion est accessible via :
- **URL** : `/admin/vehicles`
- **Navigation** : Cliquez sur "Véhicules" dans le header du dashboard admin

## Fonctionnalités

### Ajouter un véhicule
1. Cliquez sur le bouton **"Ajouter un véhicule"**
2. Remplissez le formulaire avec les détails du véhicule
3. Cliquez sur **"Ajouter le véhicule"**

### Modifier un véhicule
1. Cliquez sur l'icône **crayon** dans la ligne du véhicule
2. Modifiez les champs souhaités
3. Cliquez sur **"Enregistrer"**

### Supprimer un véhicule
1. Cliquez sur l'icône **poubelle** dans la ligne du véhicule
2. Confirmez la suppression

### Contrôler la disponibilité
1. Cliquez sur l'icône **œil/œil barré** pour marquer le véhicule comme indisponible/disponible

## Champs du formulaire

### Informations de base
- **Nom** : Nom du véhicule (ex: "Audi A4 2024")
- **Marque** : Marque du véhicule
- **Modèle** : Modèle spécifique
- **Immatriculation** : Numéro de plaque d'immatriculation
- **Couleur** : Couleur du véhicule
- **Année** : Année de fabrication

### Spécifications
- **Places** : Nombre de places assises
- **Transmission** : Automatique ou Manuelle
- **Carburant** : Essence, Diesel, Hybride ou Électrique

### Tarification
- **Tarif journalier** : Prix de location par jour (obligatoire)
- **Tarif week-end** : Prix de location le week-end (optionnel)

### Kilométrage
- **Limite incluse** : Kilométrage gratuit par jour (ex: 300 km)
- **Tarif supplémentaire** : Prix par km au-delà de la limite

### Assurance & Inspection
- **Assurance valide jusqu'au** : Date d'expiration de l'assurance
- **Inspection valide jusqu'au** : Date d'expiration de l'inspection technique

### Informations supplémentaires
- **Description** : Description détaillée du véhicule
- **URL de l'image** : Lien vers l'image du véhicule
- **Disponibilité** : Cochez pour rendre le véhicule disponible

## Points à noter

- Les véhicules marqués comme "Indisponible" ne s'afficheront pas aux clients
- La disponibilité peut être rapidement modifiée sans éditer tout le véhicule
- Tous les champs requis doivent être remplis pour ajouter un véhicule
- Les modifications sont automatiquement sauvegardées
- La liste se met à jour automatiquement après chaque action

## Intégration future

Pour intégrer les véhicules aux réservations, vous devrez :
1. Ajouter un champ `vehicle_id` à la table `bookings`
2. Mettre à jour le formulaire de réservation pour sélectionner un véhicule
3. Vérifier la disponibilité du véhicule lors de la création de réservation
4. Afficher les détails du véhicule dans les confirmations de réservation
