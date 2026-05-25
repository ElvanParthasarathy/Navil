/**
 * Migration script: Decrypt all ENC: prefixed urai/notes in Firebase
 * 
 * Usage: node scratch/decrypt_firebase_data.js YOUR_PASSWORD
 * 
 * This will:
 * 1. Connect to Firebase
 * 2. Read all collections (poems, quotes, blog, articles, stories, diary)
 * 3. Find items with ENC: prefixed urai or notes
 * 4. Decrypt them using the provided password
 * 5. Write decrypted plaintext back to Firebase
 */

import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update } from 'firebase/database';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import CryptoJS from 'crypto-js';

const firebaseConfig = {
    apiKey: "AIzaSyCA__Mtb9oNy_NnglGfn3WDkb47dbbi8tI",
    authDomain: "elvanparthasarathy.firebaseapp.com",
    databaseURL: "https://elvanparthasarathy-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "elvanparthasarathy",
    storageBucket: "elvanparthasarathy.firebasestorage.app",
    messagingSenderId: "388935758553",
    appId: "1:388935758553:web:9da2868cd8c03d937dc4c8"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const DECRYPT_PASSWORD = process.argv[2];
const AUTH_EMAIL = process.argv[3];
const AUTH_PASSWORD = process.argv[4];

if (!DECRYPT_PASSWORD || !AUTH_EMAIL || !AUTH_PASSWORD) {
    console.error('❌ Usage: node scratch/decrypt_firebase_data.js DECRYPT_PASSWORD AUTH_EMAIL AUTH_PASSWORD');
    console.error('   Example: node scratch/decrypt_firebase_data.js "navami" "admin@example.com" "mypassword"');
    process.exit(1);
}

const COLLECTIONS = ['poems', 'quotes', 'blog', 'articles', 'stories', 'diary'];

function decrypt(encryptedStr, password) {
    if (!encryptedStr || !encryptedStr.startsWith('ENC:')) return null;
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedStr.substring(4), password);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) return null;
        return decrypted;
    } catch {
        return null;
    }
}

async function migrate() {
    // Sign in first
    console.log('🔑 Signing in to Firebase...');
    try {
        await signInWithEmailAndPassword(auth, AUTH_EMAIL, AUTH_PASSWORD);
        console.log('✅ Signed in successfully.\n');
    } catch (err) {
        console.error('❌ Auth failed:', err.message);
        process.exit(1);
    }

    console.log('🔍 Scanning Firebase for encrypted content...\n');
    
    const updates = {};
    let totalFound = 0;
    let totalDecrypted = 0;
    let totalFailed = 0;

    for (const collection of COLLECTIONS) {
        const snapshot = await get(ref(db, collection));
        if (!snapshot.exists()) continue;

        const data = snapshot.val();
        // data can be an object (keyed) or array
        const entries = Array.isArray(data) ? data.map((item, i) => [i, item]) : Object.entries(data);

        for (const [key, item] of entries) {
            if (!item) continue;

            // Check urai
            if (item.urai && item.urai.startsWith('ENC:')) {
                totalFound++;
                const decrypted = decrypt(item.urai, PASSWORD);
                if (decrypted) {
                    updates[`${collection}/${key}/urai`] = decrypted;
                    totalDecrypted++;
                    console.log(`  ✅ ${collection}/${key} — urai decrypted (${decrypted.substring(0, 50)}...)`);
                } else {
                    totalFailed++;
                    console.log(`  ❌ ${collection}/${key} — urai FAILED to decrypt`);
                }
            }

            // Check notes
            if (item.notes && item.notes.startsWith('ENC:')) {
                totalFound++;
                const decrypted = decrypt(item.notes, PASSWORD);
                if (decrypted) {
                    updates[`${collection}/${key}/notes`] = decrypted;
                    totalDecrypted++;
                    console.log(`  ✅ ${collection}/${key} — notes decrypted (${decrypted.substring(0, 50)}...)`);
                } else {
                    totalFailed++;
                    console.log(`  ❌ ${collection}/${key} — notes FAILED to decrypt`);
                }
            }
        }
    }

    console.log(`\n📊 Results: ${totalFound} encrypted fields found, ${totalDecrypted} decrypted, ${totalFailed} failed.`);

    if (totalFailed > 0) {
        console.log('\n⚠️  Some fields failed to decrypt. The password might be wrong for those items.');
        console.log('    Only successfully decrypted fields will be updated.');
    }

    if (Object.keys(updates).length === 0) {
        console.log('\n✨ Nothing to update. All clean!');
        process.exit(0);
    }

    console.log(`\n📝 Writing ${Object.keys(updates).length} decrypted fields back to Firebase...`);
    
    try {
        await update(ref(db), updates);
        console.log('✅ Done! All encrypted content has been replaced with plaintext.');
    } catch (err) {
        console.error('❌ Error writing to Firebase:', err.message);
    }

    process.exit(0);
}

migrate();
