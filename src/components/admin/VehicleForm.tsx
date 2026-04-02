'use client';

import { useState, useRef, useEffect } from 'react';
import { Car, Image as ImageIcon, X, Plus, Upload, Loader2 } from 'lucide-react';
import { Vehicle } from '@/types/vehicle';
import Image from 'next/image';

interface VehicleFormProps {
    initialData?: Vehicle;
    onSubmit: (formData: FormData) => Promise<void>;
    loading: boolean;
    buttonText: string;
}

export default function VehicleForm({ initialData, onSubmit, loading, buttonText }: VehicleFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [trim, setTrim] = useState(initialData?.trim || '');
    const [description, setDescription] = useState(initialData?.description || '');
    
    // Images state
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
    const [newFiles, setNewFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial fields (hidden but required by DB)
    const [brand] = useState(initialData?.brand || 'Default');
    const [model] = useState(initialData?.model || 'Default');
    const [regNum] = useState(initialData?.registration_number || `TEMP-${Math.random().toString(36).substring(7).toUpperCase()}`);
    const [dailyRate] = useState(initialData?.daily_rate?.toString() || '100');

    useEffect(() => {
        // Create previews for new files
        const newPreviews = newFiles.map(file => URL.createObjectURL(file));
        setPreviews(newPreviews);
        
        // Cleanup previews
        return () => {
            newPreviews.forEach(url => URL.revokeObjectURL(url));
        };
    }, [newFiles]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setNewFiles(prev => [...prev, ...filesArray]);
        }
    };

    const removeExistingImage = (index: number) => {
        setExistingImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeNewFile = (index: number) => {
        setNewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', name);
        formData.append('trim', trim);
        formData.append('description', description);
        formData.append('brand', brand);
        formData.append('model', model);
        formData.append('registration_number', regNum);
        formData.append('daily_rate', dailyRate);
        formData.append('is_available', 'true');
        
        // Send list of existing images to keep
        formData.append('existingImages', JSON.stringify(existingImages));
        
        // Add new files
        newFiles.forEach(file => {
            formData.append('images', file);
        });

        await onSubmit(formData);
    };

    const Label = ({ children }: { children: React.ReactNode }) => (
        <label className="text-xs text-gray-500 uppercase font-oswald tracking-widest block mb-2 ml-1">{children}</label>
    );

    return (
        <form id="vehicle-form" onSubmit={handleSubmit} className="space-y-8 p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Vehicle Name */}
                <div>
                    <Label>Nom du véhicule</Label>
                    <input
                        type="text" placeholder="ex: CLIO V" required
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 glass-input rounded-2xl text-lg font-bold tracking-tight focus:ring-2 focus:ring-alpine/50"
                    />
                </div>

                {/* Vehicle Trim */}
                <div>
                    <Label>Finition (Trim)</Label>
                    <input
                        type="text" placeholder="ex: ESPRIT ALPINE" required
                        value={trim} onChange={(e) => setTrim(e.target.value)}
                        className="w-full p-4 glass-input rounded-2xl text-lg font-bold text-alpine tracking-tight focus:ring-2 focus:ring-alpine/50"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <Label>Description (Détails Hero)</Label>
                <textarea
                    rows={4}
                    value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 glass-input rounded-2xl text-sm resize-none leading-relaxed"
                    placeholder="ex: Finition Bleu Fusion. Hybride E-Tech 145ch. L'élégance radicale."
                />
            </div>

            {/* Image Upload Zone */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label>Galerie d'images (Upload)</Label>
                    <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 text-[10px] bg-alpine/10 text-alpine hover:bg-alpine hover:text-white px-4 py-2 rounded-xl border border-alpine/20 transition-all uppercase font-bold tracking-widest"
                    >
                        <Upload className="w-3 h-3" />
                        Choisir des images
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        multiple 
                        accept="image/*" 
                        className="hidden" 
                    />
                </div>

                {/* Previews Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {/* Existing Images */}
                    {existingImages.map((url, index) => (
                        <div key={`existing-${index}`} className="relative aspect-video rounded-xl overflow-hidden border border-white/10 group bg-white/5">
                            <Image src={url} alt="Gallery" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" onClick={() => removeExistingImage(index)} className="p-1.5 bg-red-500 rounded-lg text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            {index === 0 && (
                                <div className="absolute top-2 left-2 bg-alpine text-[8px] font-bold uppercase py-0.5 px-1.5 rounded">Principale</div>
                            )}
                        </div>
                    ))}
                    
                    {/* New File Previews */}
                    {previews.map((url, index) => (
                        <div key={`new-${index}`} className="relative aspect-video rounded-xl overflow-hidden border border-alpine/30 group bg-alpine/5">
                            <Image src={url} alt="Preview" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button type="button" onClick={() => removeNewFile(index)} className="p-1.5 bg-red-500 rounded-lg text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            {existingImages.length === 0 && index === 0 && (
                                <div className="absolute top-2 left-2 bg-alpine text-[8px] font-bold uppercase py-0.5 px-1.5 rounded">Principale</div>
                            )}
                        </div>
                    ))}
                    
                    {/* Add More button */}
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-video rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-alpine hover:border-alpine/50 hover:bg-alpine/5 transition-all"
                    >
                        <Plus className="w-6 h-6" />
                        <span className="text-[10px] uppercase font-bold tracking-widest">Ajouter</span>
                    </button>
                </div>
                
                {existingImages.length === 0 && newFiles.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-600 gap-3">
                        <ImageIcon className="w-8 h-8 opacity-20" />
                        <p className="text-xs uppercase font-bold tracking-widest opacity-40">Aucune image sélectionnée</p>
                    </div>
                )}
            </div>

            {/* Spacer for overflow */}
            <div className="h-4" />
        </form>
    );
}
