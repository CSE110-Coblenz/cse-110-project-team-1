/**
 * Very small helper to load multiple images and store them in a map keyed by a string.
 */
export async function loadImages(map: Record<string, string>) {
    const out = new Map<string, HTMLImageElement>();
    const promises: Promise<void>[] = [];
    for (const key of Object.keys(map)) {
        const url = map[key];
        const img = new Image();
        const p = new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = (e) => reject(new Error(`Failed to load ${url}`));
        });
        img.src = url;
        out.set(key, img);
        promises.push(p);
    }
    await Promise.all(promises);
    return out;
}
