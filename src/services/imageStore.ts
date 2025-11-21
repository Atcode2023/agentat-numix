import localforage from 'localforage';

localforage.config({
    name: 'atdolar',
    storeName: 'product_images',
    description: 'Almacena imágenes de productos (base64 o blob)'
});

export async function saveProductImage(id: string, data: string | Blob): Promise<string> {
    await localforage.setItem(id, data);
    return id;
}

export async function getProductImage(id: string): Promise<string | Blob | null> {
    try {
        return await localforage.getItem<string | Blob>(id);
    } catch {
        return null;
    }
}

export async function removeProductImage(id: string): Promise<void> {
    try { await localforage.removeItem(id); } catch { /* ignore */ }
}

export async function clearAllImages() {
    await localforage.clear();
}
