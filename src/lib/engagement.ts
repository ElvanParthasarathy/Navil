import { db } from './firebaseClient';
import { ref, push, set, onValue, runTransaction, remove, serverTimestamp } from 'firebase/database';

/**
 * Engagement Utility
 * Handles Real-time Likes and Comments using Firebase RTDB.
 */

// Structure:
// /engagement/likes/{postId} -> count (number)
// /engagement/comments/{postId}/{commentId} -> { name, text, timestamp, isNirvaagi }

/**
 * Adds a like to a post using the visitor's unique ID.
 * Returns true if like was added, false if already liked.
 */
export const addLike = async (postId: string, userId: string) => {
    const likeRef = ref(db, `engagement/likes/${postId}/${userId}`);
    try {
        await set(likeRef, true);
        return true;
    } catch (error) {
        console.error("Error adding like:", error);
        return false;
    }
};

/**
 * Removes a like (Unlike).
 */
export const removeLike = async (postId: string, userId: string) => {
    const likeRef = ref(db, `engagement/likes/${postId}/${userId}`);
    try {
        await remove(likeRef);
    } catch (error) {
        console.error("Error removing like:", error);
    }
};

/**
 * Adds a comment to a post.
 */
export const addComment = async (postId: string, commentData: { name: string; text: string; userId: string; isNirvaagi?: boolean; parentId?: string }) => {
    const commentsRef = ref(db, `engagement/comments/${postId}`);
    const newCommentRef = push(commentsRef);
    
    // Firebase RTDB doesn't like undefined. We must remove undefined keys.
    const cleanData = Object.fromEntries(
        Object.entries(commentData).filter(([_, v]) => v !== undefined)
    );

    try {
        await set(newCommentRef, {
            ...cleanData,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding comment:", error);
    }
};

/**
 * Deletes a specific comment (Nirvaagi only logic should be enforced in DB rules, 
 * but this is the client-side trigger).
 */
export const deleteComment = async (postId: string, commentId: string) => {
    const commentRef = ref(db, `engagement/comments/${postId}/${commentId}`);
    try {
        await remove(commentRef);
    } catch (error) {
        console.error("Error deleting comment:", error);
    }
};

/**
 * Updates a specific comment text.
 */
export const updateComment = async (postId: string, commentId: string, text: string) => {
    const commentRef = ref(db, `engagement/comments/${postId}/${commentId}/text`);
    try {
        await set(commentRef, text);
    } catch (error) {
        console.error("Error updating comment:", error);
    }
};

// --- Caching Layer ---
interface EngagementCache {
    [postId: string]: {
        data: { likes: number, comments: any[], likedByUser: (uid: string) => boolean };
        listeners: Set<(data: any) => void>;
        unsub: (() => void) | null;
    }
}

const engagementCache: EngagementCache = {};

/**
 * Subscribes to engagement data for a post.
 * Returns an unsubscribe function.
 */
export const subscribeToEngagement = (postId: string, callback: (data: { likes: number, comments: any[], likedByUser: (uid: string) => boolean }) => void) => {
    if (!engagementCache[postId]) {
        engagementCache[postId] = {
            data: { likes: 0, comments: [], likedByUser: () => false },
            listeners: new Set(),
            unsub: null
        };
    }

    const entry = engagementCache[postId];
    entry.listeners.add(callback);

    // Deliver cached data immediately if we have it
    if (entry.unsub) {
        callback(entry.data);
    }

    if (!entry.unsub) {
        const likesRef = ref(db, `engagement/likes/${postId}`);
        const commentsRef = ref(db, `engagement/comments/${postId}`);

        let likesMap: Record<string, boolean> = {};
        let comments: any[] = [];

        const notify = () => {
            entry.data = { 
                likes: Object.keys(likesMap).length, 
                comments,
                likedByUser: (uid: string) => !!likesMap[uid]
            };
            entry.listeners.forEach(cb => cb(entry.data));
        };

        const unsubLikes = onValue(likesRef, (snapshot) => {
            likesMap = snapshot.val() || {};
            notify();
        });

        const unsubComments = onValue(commentsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                comments = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ ...val, id }))
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            } else {
                comments = [];
            }
            notify();
        });

        entry.unsub = () => {
            unsubLikes();
            unsubComments();
        };
    }

    return () => {
        entry.listeners.delete(callback);
        if (entry.listeners.size === 0 && entry.unsub) {
            entry.unsub();
            entry.unsub = null;
        }
    };
};

