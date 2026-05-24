// @ts-nocheck
/**
 * Shared Firebase Realtime Database cache.
 *
 * A single `onValue` listener is kept per category key. Every component
 * that calls `subscribe(category, cb)` receives the **same** cached data
 * instantly (if available) and is notified whenever the data changes in
 * the database.  When the last subscriber for a category unsubscribes the
 * listener is torn down to avoid leaking connections.
 */
import { db } from './firebaseClient';
import { ref, onValue } from 'firebase/database';

type Callback = (data: any[] | null) => void;

interface CacheEntry {
    data: any[] | null;
    rawObj: Record<string, any> | null;
    listeners: Set<Callback>;
    unsubscribe: (() => void) | null;
}

const cache: Record<string, CacheEntry> = {};

/** Normalise a Firebase snapshot object into a sorted array. */
function normalise(dataObj: Record<string, any>): any[] {
    const rows = Object.entries(dataObj).map(([key, val]) => {
        const item = { ...val, id: key };
        if (item.variants) {
            if (!Array.isArray(item.variants)) item.variants = Object.values(item.variants);
            item.variants.forEach((v: any) => {
                if (v.transliterations?._empty) delete v.transliterations._empty;
                if (v.titleTransliterations?._empty) delete v.titleTransliterations._empty;
                if (v.authorTransliterations?._empty) delete v.authorTransliterations._empty;
                if (!v.transliterations) v.transliterations = {};
                if (!v.titleTransliterations) v.titleTransliterations = {};
                if (!v.authorTransliterations) v.authorTransliterations = {};
            });
        }
        return item;
    });

    rows.sort((a, b) => {
        const isAPinned = a.is_pinned && a.pin_type === 'permanent';
        const isBPinned = b.is_pinned && b.pin_type === 'permanent';
        if (isAPinned && !isBPinned) return -1;
        if (!isAPinned && isBPinned) return 1;
        if ((a.display_order ?? 0) !== (b.display_order ?? 0))
            return (a.display_order || 0) - (b.display_order || 0);
        const da = new Date(a.publish_date || a.date || 0);
        const db = new Date(b.publish_date || b.date || 0);
        return db - da;
    });

    return rows;
}

function ensureEntry(category: string): CacheEntry {
    if (!cache[category]) {
        cache[category] = { data: null, rawObj: null, listeners: new Set(), unsubscribe: null };
    }
    return cache[category];
}

function startListening(category: string) {
    const entry = cache[category];
    if (entry.unsubscribe) return; // already listening

    const catRef = ref(db, category);
    entry.unsubscribe = onValue(
        catRef,
        (snapshot) => {
            if (snapshot.exists()) {
                entry.rawObj = snapshot.val();
                entry.data = normalise(entry.rawObj);
            } else {
                entry.rawObj = null;
                entry.data = [];
            }
            // Notify all subscribers
            entry.listeners.forEach((cb) => cb(entry.data));
        },
        (error) => {
            console.error(`Firebase cache error [${category}]:`, error);
        }
    );
}

/**
 * Subscribe to a category's data.
 *
 * - If cached data exists the callback is invoked **synchronously** with it.
 * - Returns an unsubscribe function.
 */
export function subscribe(category: string, cb: Callback): () => void {
    const entry = ensureEntry(category);
    entry.listeners.add(cb);

    // Deliver cached data immediately if available
    if (entry.data !== null) {
        cb(entry.data);
    }

    // Start the Firebase listener if not already running
    startListening(category);

    return () => {
        entry.listeners.delete(cb);
        // Tear down listener when no subscribers remain
        if (entry.listeners.size === 0 && entry.unsubscribe) {
            entry.unsubscribe();
            entry.unsubscribe = null;
        }
    };
}

/** Get cached data synchronously (or null if not yet loaded). */
export function getCached(category: string): any[] | null {
    return cache[category]?.data ?? null;
}

/** Get the raw object map (keyed by slug/id) synchronously. */
export function getCachedRaw(category: string): Record<string, any> | null {
    return cache[category]?.rawObj ?? null;
}
