import React, { useState, useEffect, useRef } from 'react';
import { FiHeart, FiMessageCircle, FiSend, FiUser, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { ref, get } from 'firebase/database';
import { db } from '../lib/firebaseClient';
import { addLike, removeLike, addComment, deleteComment, updateComment, subscribeToEngagement } from '../lib/engagement';
import { auth } from '../lib/firebaseClient';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { ConfirmDialog } from './admin/ConfirmDialog';

interface Comment {
    id: string;
    name: string;
    text: string;
    userId: string;
    timestamp: number;
    isAdmin?: boolean;
    parentId?: string;
}

interface EngagementProps {
    postId: string;
    category: string;
    isDark?: boolean;
    hideComments?: boolean;
    minimal?: boolean;
}

export const Engagement: React.FC<EngagementProps> = ({ postId, category, hideComments = false, minimal = false }) => {
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLiking, setIsLiking] = useState(false);
    const [hasLiked, setHasLiked] = useState(false);
    const [name, setName] = useState('');
    const [text, setText] = useState('');
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [identifier, setIdentifier] = useState<string | null>(() => {
        // Try to get existing user ID immediately for faster loading
        try {
            return localStorage.getItem('engagement_user_id');
        } catch (e) {
            return null;
        }
    });
    const [showForm, setShowForm] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [editingComment, setEditingComment] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [adminProfile, setAdminProfile] = useState<any>(null);

    // Generate a unique user ID that persists in the browser storage
    const getOrCreateUserId = () => {
        let userId = localStorage.getItem('engagement_user_id');
        if (!userId) {
            userId = 'u_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
            localStorage.setItem('engagement_user_id', userId);
        }
        return userId;
    };

    useEffect(() => {
        // Load saved name from device
        const savedName = localStorage.getItem('engagement_name');
        if (savedName) setName(savedName);

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest('.more-menu-wrapper')) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        const initIdentity = () => {
            const userId = getOrCreateUserId();
            setIdentifier(userId);
        };

        initIdentity();

        // Check if Admin is logged in
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setIsAdmin(!!user && !user.isAnonymous);
        });

        // Fetch Admin profile for avatars
        const profileRef = ref(db, 'config/profile');
        get(profileRef).then(snap => {
            if (snap.exists()) {
                const data = snap.val();
                setAdminProfile({
                    ...data,
                    avatar: data.profilePic || data.avatar
                });
            }
        });

        return () => {
            unsubscribeAuth();
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!identifier) return;

        // 2. Subscribe to real-time data
        const unsubscribeEng = subscribeToEngagement(postId, (data) => {
            setLikes(data.likes);
            setComments(data.comments);
            setHasLiked(data.likedByUser(identifier));
        });

        return () => unsubscribeEng();
    }, [postId, identifier]);

    const handleLike = async () => {
        if (!identifier) return;
        
        // Optimistic Update: Change UI immediately
        const willLike = !hasLiked;
        setHasLiked(willLike);
        setLikes(prev => willLike ? prev + 1 : Math.max(0, prev - 1));

        try {
            if (hasLiked) {
                await removeLike(postId, identifier);
            } else {
                await addLike(postId, identifier);
            }
        } catch (error) {
            // Rollback on error
            setHasLiked(!willLike);
            setLikes(prev => !willLike ? prev + 1 : Math.max(0, prev - 1));
            console.error("Like failed:", error);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, setter: (val: string) => void) => {
        setter(e.target.value);
        e.target.style.height = 'auto';
        e.target.style.height = `${e.target.scrollHeight}px`;
    };

    const handleSubmitComment = async (e: React.FormEvent, parentId?: string) => {
        e.preventDefault();
        const content = parentId ? replyText : text;
        if (!content.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const finalName = name.trim() || 'பெயரிலி'; // Anonymous in Tamil
            
            // Save name for next time
            if (name.trim()) {
                localStorage.setItem('engagement_name', name.trim());
            }

            await addComment(postId, {
                name: (isAdmin && !name.trim()) ? 'Author' : finalName,
                text: content.trim(),
                userId: identifier,
                isAdmin: isAdmin && !name.trim(),
                parentId: parentId
            });
            
            if (parentId) {
                setReplyText('');
                setReplyingTo(null);
            } else {
                setText('');
                // Reset height of main textarea
                const el = document.getElementById('comment-input');
                if (el) el.style.height = 'auto';
            }
        } catch (error) {
            console.error("Failed to post comment:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await deleteComment(postId, confirmDeleteId);
            setConfirmDeleteId(null);
            setActiveMenu(null);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const handleSaveEdit = async (id: string) => {
        if (!editingText.trim()) return;
        try {
            await updateComment(postId, id, editingText.trim());
            setEditingComment(null);
            setEditingText('');
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const formatDate = (ts: number) => {
        if (!ts) return '';
        const date = new Date(ts);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    };

    if (minimal) {
        return (
            <div className="engagement-minimal">
                <button 
                    className={`mini-like-btn ${isLiking ? 'liking' : ''} ${hasLiked ? 'active' : ''}`} 
                    onClick={(e) => { e.stopPropagation(); handleLike(); }}
                >
                    <FiHeart className="eng-icon" fill={hasLiked ? 'currentColor' : 'none'} />
                    <span className="mini-count">{likes}</span>
                </button>
            </div>
        );
    }

    return (
        <div className="engagement-container">
            {/* Header with counts */}
            <div className={`discussion-header ${hideComments ? 'compact-header' : ''}`}>
                {!hideComments && (
                    <div className="discussion-title">
                        <span className="title-ta">கருத்துரையாடல்</span>
                        <span className="title-en">{`Discussion (${comments.length})`}</span>
                    </div>
                )}
                
                <div className={`engagement-actions-mini ${hideComments ? 'solo-action' : ''}`}>
                    <button 
                        className={`mini-like-btn ${isLiking ? 'liking' : ''} ${hasLiked ? 'active' : ''}`} 
                        onClick={handleLike}
                    >
                        <FiHeart className="eng-icon" fill={hasLiked ? 'currentColor' : 'none'} />
                        <span className="mini-count">{likes}</span>
                    </button>
                </div>
            </div>

            {/* Comment Form */}
            {!hideComments && (
                <>
                    {/* Comment Form */}
                    <form className="discussion-form-flat" onSubmit={handleSubmitComment}>
                        <div className="flat-input-group-container">
                        <div className="flat-input-group">
                            <FiUser className="flat-icon" />
                            <div className="bilingual-input-wrapper">
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="flat-name-input"
                                    id="name-input"
                                    placeholder=" "
                                />
                                <label htmlFor="name-input" className="bilingual-placeholder">
                                    <span className="ph-ta">பெயர்</span>
                                    <span className="ph-en">Name</span>
                                </label>
                            </div>
                        </div>
                        <span className="input-helper-text">பெயர் கட்டாயமில்லை | Name is optional</span>
                    </div>
                        
                        <div className="flat-textarea-group">
                            <div className="bilingual-input-wrapper">
                                <textarea 
                                    rows={3}
                                    className="flat-text-input auto-expand"
                                    value={text}
                                    onChange={(e) => handleTextChange(e, setText)}
                                    id="comment-input"
                                    placeholder=" "
                                    required
                                ></textarea>
                                <label htmlFor="comment-input" className="bilingual-placeholder">
                                    <span className="ph-ta">உங்கள் கருத்தைப் பகிரவும்...</span>
                                    <span className="ph-en">Write a comment...</span>
                                </label>
                            </div>
                        </div>

                        <div className="flat-form-footer">
                            {text.trim() && (
                                <button 
                                    type="button"
                                    className="flat-cancel-btn"
                                    onClick={() => {
                                        setText('');
                                        const el = document.getElementById('comment-input');
                                        if (el) el.style.height = 'auto';
                                    }}
                                >
                                    <FiX className="btn-icon-mini" />
                                    <div className="btn-text-stack">
                                        <span className="action-ta">ரத்து</span>
                                        <span className="action-en">cancel</span>
                                    </div>
                                </button>
                            )}
                            <button 
                                type="submit"
                                className={`flat-submit-btn ${!text.trim() || isSubmitting ? 'disabled' : ''}`}
                                disabled={!text.trim() || isSubmitting}
                            >
                                <FiSend className="btn-icon-mini" />
                                <div className="btn-text-stack">
                                    <span className="action-ta">தூதிடு</span>
                                    <span className="action-en">send</span>
                                </div>
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    <div className="comments-thread">
                        {comments.filter(c => !c.parentId).map((comment) => (
                            <div key={comment.id} className="comment-group">
                                <article className="comment-article">
                                    <footer className="comment-footer">
                                        <div className="author-meta">
                                            <div className="author-avatar">
                                                {comment.isAdmin && adminProfile?.avatar ? (
                                                    <img src={adminProfile.avatar} alt="Author" className="admin-pfp" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="guest-avatar">{comment.name[0]}</div>
                                                )}
                                            </div>
                                            <div className="author-info">
                                                <p className="author-name">
                                                    {comment.isAdmin ? 'Author' : comment.name}
                                                </p>
                                                <p className="comment-date">
                                                    <time dateTime={new Date(comment.timestamp).toISOString()}>
                                                        {formatDate(comment.timestamp)}
                                                    </time>
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="comment-actions">
                                            <button className="comment-reply-btn" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
                                                <FiMessageCircle className="reply-icon" />
                                                <div className="action-text-stack">
                                                    <span className="action-ta">பதில்</span>
                                                    <span className="action-en">reply</span>
                                                </div>
                                            </button>
                                             {(identifier === comment.userId && !comment.isAdmin) && (
                                                 <div className="more-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                                                     <button 
                                                         className="comment-more-btn"
                                                         onClick={() => setActiveMenu(activeMenu === comment.id ? null : comment.id)}
                                                     >
                                                         <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                             <circle cx="5" cy="12" r="2" />
                                                             <circle cx="12" cy="12" r="2" />
                                                             <circle cx="19" cy="12" r="2" />
                                                         </svg>
                                                     </button>
                                                     <div className={`more-dropdown ${activeMenu === comment.id ? 'open' : ''}`}>
                                                         {!comment.isAdmin && (
                                                             <button onClick={() => { 
                                                                 setEditingComment(comment.id); 
                                                                 setEditingText(comment.text);
                                                                 setActiveMenu(null); 
                                                             }}>
                                                                 <FiEdit2 /> 
                                                                 <div className="action-text-stack">
                                                                     <span className="action-ta">திருத்து</span>
                                                                     <span className="action-en">edit</span>
                                                                 </div>
                                                             </button>
                                                         )}
                                                         <button className="delete-opt" onClick={() => { handleDelete(comment.id); setActiveMenu(null); }}>
                                                             <FiTrash2 /> 
                                                             <div className="action-text-stack">
                                                                 <span className="action-ta">நீக்கு</span>
                                                                 <span className="action-en">delete</span>
                                                             </div>
                                                         </button>
                                                     </div>
                                                 </div>
                                             )}
                                        </div>
                                    </footer>
                                    {editingComment === comment.id ? (
                                        <div className="discussion-form-flat edit-mode">
                                            <div className="flat-textarea-group">
                                                <div className="bilingual-input-wrapper">
                                                    <textarea 
                                                        className="flat-text-input auto-expand"
                                                        value={editingText}
                                                        onChange={(e) => handleTextChange(e, setEditingText)}
                                                        autoFocus
                                                        rows={3}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flat-form-footer">
                                                <button className="flat-cancel-btn" onClick={() => setEditingComment(null)}>
                                                    <FiX className="btn-icon-mini" />
                                                    <div className="btn-text-stack">
                                                        <span className="action-ta">ரத்து</span>
                                                        <span className="action-en">cancel</span>
                                                    </div>
                                                </button>
                                                <button className="flat-submit-btn" onClick={() => handleSaveEdit(comment.id)}>
                                                    <FiCheck className="btn-icon-mini" />
                                                    <div className="btn-text-stack">
                                                        <span className="action-ta">சேமி</span>
                                                        <span className="action-en">save</span>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="comment-body">{comment.text}</p>
                                    )}
                                </article>

                                {/* Nested Replies */}
                                <div className="replies-container">
                                    {comments.filter(r => r.parentId === comment.id).map(reply => (
                                        <article key={reply.id} className="comment-article reply-article">
                                            <footer className="comment-footer">
                                                <div className="author-meta">
                                                    <div className="author-avatar mini">
                                                        {reply.isAdmin && adminProfile?.avatar ? (
                                                            <img src={adminProfile.avatar} alt="Author" className="admin-pfp" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                                        ) : (
                                                            <div className="guest-avatar">{reply.name[0]}</div>
                                                        )}
                                                    </div>
                                                    <div className="author-info">
                                                        <p className="author-name">
                                                            {reply.isAdmin ? 'Author' : reply.name}
                                                        </p>
                                                        <p className="comment-date">{formatDate(reply.timestamp)}</p>
                                                    </div>
                                                </div>
                                                
                                                {(identifier === reply.userId && !reply.isAdmin) && (
                                                    <div className="more-menu-wrapper" onClick={(e) => e.stopPropagation()}>
                                                        <button 
                                                            className="comment-more-btn"
                                                            onClick={() => setActiveMenu(activeMenu === reply.id ? null : reply.id)}
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                                <circle cx="5" cy="12" r="2" />
                                                                <circle cx="12" cy="12" r="2" />
                                                                <circle cx="19" cy="12" r="2" />
                                                            </svg>
                                                        </button>
                                                        <div className={`more-dropdown ${activeMenu === reply.id ? 'open' : ''}`}>
                                                            {!reply.isAdmin && (
                                                                <button onClick={() => { 
                                                                    setEditingComment(reply.id); 
                                                                    setEditingText(reply.text);
                                                                    setActiveMenu(null); 
                                                                }}>
                                                                    <FiEdit2 />
                                                                    <div className="action-text-stack">
                                                                        <span className="action-ta">திருத்து</span>
                                                                        <span className="action-en">edit</span>
                                                                    </div>
                                                                </button>
                                                            )}
                                                            <button className="delete-opt" onClick={() => handleDelete(reply.id)}>
                                                                <FiTrash2 />
                                                                <div className="action-text-stack">
                                                                    <span className="action-ta">நீக்கு</span>
                                                                    <span className="action-en">delete</span>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </footer>
                                              {editingComment === reply.id ? (
                                                  <div className="discussion-form-flat edit-mode">
                                                      <div className="flat-textarea-group">
                                                          <div className="bilingual-input-wrapper">
                                                               <textarea 
                                                                   className="flat-text-input auto-expand"
                                                                   value={editingText}
                                                                   onChange={(e) => handleTextChange(e, setEditingText)}
                                                                   autoFocus
                                                                   rows={3}
                                                               />
                                                          </div>
                                                      </div>
                                                      <div className="flat-form-footer">
                                                          <button className="flat-cancel-btn" onClick={() => setEditingComment(null)}>
                                                              <FiX className="btn-icon-mini" />
                                                              <div className="btn-text-stack">
                                                                  <span className="action-ta">ரத்து</span>
                                                                  <span className="action-en">cancel</span>
                                                              </div>
                                                          </button>
                                                          <button className="flat-submit-btn" onClick={() => handleSaveEdit(reply.id)}>
                                                              <FiCheck className="btn-icon-mini" />
                                                              <div className="btn-text-stack">
                                                                  <span className="action-ta">சேமி</span>
                                                                  <span className="action-en">save</span>
                                                              </div>
                                                          </button>
                                                      </div>
                                                  </div>
                                              ) : (
                                                <p className="comment-body">{reply.text}</p>
                                            )}
                                        </article>
                                    ))}
                                </div>
                                
                                {/* Reply Form */}
                                {replyingTo === comment.id && (
                                     <div className="discussion-form-flat nested-reply">
                                         <div className="flat-textarea-group">
                                             <div className="bilingual-input-wrapper">
                                                  <textarea 
                                                      className="flat-text-input auto-expand"
                                                      value={replyText}
                                                      onChange={(e) => handleTextChange(e, setReplyText)}
                                                      id={`reply-input-${comment.id}`}
                                                      placeholder=" "
                                                      autoFocus
                                                      rows={3}
                                                  />
                                                 <label htmlFor={`reply-input-${comment.id}`} className="bilingual-placeholder">
                                                     <span className="ph-ta">தங்கள் பதில்</span>
                                                     <span className="ph-en">Your reply</span>
                                                 </label>
                                             </div>
                                         </div>
                                         <div className="flat-form-footer">
                                             <button className="flat-cancel-btn" onClick={() => setReplyingTo(null)}>
                                                 <FiX className="btn-icon-mini" />
                                                 <div className="btn-text-stack">
                                                     <span className="action-ta">ரத்து</span>
                                                     <span className="action-en">cancel</span>
                                                 </div>
                                             </button>
                                             <button 
                                                 className="flat-submit-btn"
                                                 onClick={(e) => handleSubmitComment(e, comment.id)}
                                             >
                                                 <FiSend className="btn-icon-mini" />
                                                 <div className="btn-text-stack">
                                                     <span className="action-ta">பதில்</span>
                                                     <span className="action-en">reply</span>
                                                 </div>
                                             </button>
                                         </div>
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            <ConfirmDialog 
                open={!!confirmDeleteId}
                title="Delete comment?"
                message="This will remove the comment permanently."
                onCancel={() => setConfirmDeleteId(null)}
                onProceed={handleConfirmDelete}
            />
        </div>
    );
};
