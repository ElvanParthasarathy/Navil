import React, { useState, useEffect } from 'react';
import { Box, Card, Typography, CircularProgress, IconButton, Avatar } from '@mui/material';
import { MdComment, MdDelete, MdFavorite } from 'react-icons/md';
import { db, auth } from '../../../lib/firebaseClient';
import { ref, onValue, remove, set } from 'firebase/database';
import { addComment } from '../../../lib/engagement';

export default function CommentsManager({ username, profilePic }: { username: string, profilePic: string }) {
    const [allComments, setAllComments] = useState({});
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const engRef = ref(db, 'engagement');
        const unsubscribe = onValue(engRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const processed = {};
                const likes = data.likes || {};
                const commentsMap = data.comments || {};
                const allPostIds = new Set([...Object.keys(likes), ...Object.keys(commentsMap)]);
                allPostIds.forEach(id => {
                    const postComments = commentsMap[id] ? Object.entries(commentsMap[id]).map(([cId, val]) => ({ ...val, id: cId })) : [];
                    const likeData = likes[id];
                    const likeCount = typeof likeData === 'object' ? Object.keys(likeData).length : (likeData || 0);
                    processed[id] = {
                        likes: likeCount,
                        comments: postComments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    };
                });
                setAllComments(processed);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (postId, commentId) => {
        if (window.confirm('Delete this comment permanently?')) {
            await remove(ref(db, `engagement/comments/${postId}/${commentId}`));
        }
    };

    const handleReply = async (postId, parentId, nirvaagiName) => {
        if (!replyText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await addComment(postId, {
                name: 'Author',
                text: replyText.trim(),
                userId: auth.currentUser?.uid || 'nirvaagi',
                isNirvaagi: true,
                parentId: parentId
            });
            setReplyText('');
            setReplyingTo(null);
        } catch (err) {
            console.error("Reply failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return (
        <Box className="flex items-center justify-center p-16">
            <CircularProgress size={32} />
        </Box>
    );

    const postsWithEngagement = Object.entries(allComments);

    return (
        <Box sx={{ p: { xs: 3, md: 4, lg: 6 }, overflowY: 'auto', flex: 1 }}>
            <Typography variant="h4" className="mb-2" sx={{ fontWeight: 700 }}>Engagement</Typography>
            <Typography variant="body2" color="text.secondary" className="mb-8">
                Manage comments and monitor likes across all posts.
            </Typography>

            <Box className="flex flex-col gap-6">
                {postsWithEngagement.length === 0 ? (
                    <Box className="text-center py-16 opacity-50">
                        <Typography>No comments or likes found.</Typography>
                    </Box>
                ) : (
                    postsWithEngagement.map(([postId, data]) => (
                        <Card key={postId} elevation={0} sx={{ p: 3, borderRadius: 4 }}>
                            <Box className="flex items-center justify-between mb-4 pb-3" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">பதிவு</Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{postId}</Typography>
                                </Box>
                                <Box className="flex items-center gap-1" sx={{ color: 'error.main' }}>
                                    <MdFavorite size={16} />
                                    <Typography sx={{ fontWeight: 700 }}>{data.likes}</Typography>
                                </Box>
                            </Box>

                            <Box className="flex flex-col gap-4">
                                {data.comments.filter(c => !c.parentId).map(comment => (
                                    <Box key={comment.id} className="mb-4">
                                        <Box className="flex items-start gap-3">
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: comment.isNirvaagi ? 'primary.dark' : 'action.selected', fontSize: '0.8rem' }}>
                                                {comment.isNirvaagi && profilePic ? (
                                                    <img src={profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                                                ) : comment.name[0]}
                                            </Avatar>
                                            <Box className="flex-1 min-w-0">
                                                <Box className="flex items-center gap-2 mb-1">
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        {comment.isNirvaagi ? 'Author' : comment.name}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {comment.timestamp ? new Date(comment.timestamp).toLocaleString() : ''}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="body2">{comment.text}</Typography>
                                                <Box className="flex gap-2 mt-2">
                                                    <IconButton size="small" onClick={() => setReplyingTo(replyingTo?.commentId === comment.id ? null : { postId, commentId: comment.id })}>
                                                        <MdComment size={14} />
                                                    </IconButton>
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(postId, comment.id)}>
                                                        <MdDelete size={14} />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Replies */}
                                        <Box className="ml-10 mt-3 flex flex-col gap-3">
                                            {data.comments.filter(r => r.parentId === comment.id).map(reply => (
                                                <Box key={reply.id} className="flex items-start gap-3">
                                                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.65rem', bgcolor: reply.isNirvaagi ? 'primary.dark' : 'action.selected' }}>
                                                        {reply.isNirvaagi && profilePic ? (
                                                            <img src={profilePic} alt="" className="w-full h-full rounded-full object-cover" />
                                                        ) : reply.name[0]}
                                                    </Avatar>
                                                    <Box className="flex-1 min-w-0">
                                                        <Box className="flex items-center gap-2 mb-0.5">
                                                            <Typography variant="caption" sx={{ fontWeight: 600 }}>{reply.isNirvaagi ? 'Author' : reply.name}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{reply.timestamp ? new Date(reply.timestamp).toLocaleString() : ''}</Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>{reply.text}</Typography>
                                                    </Box>
                                                    <IconButton size="small" color="error" onClick={() => handleDelete(postId, reply.id)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}>
                                                        <MdDelete size={12} />
                                                    </IconButton>
                                                </Box>
                                            ))}
                                        </Box>

                                        {/* Reply Input */}
                                        {replyingTo?.commentId === comment.id && (
                                            <Box className="ml-10 mt-3" sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'primary.main', bgcolor: 'background.paper' }}>
                                                <textarea
                                                    className="w-full bg-transparent text-(--color-on-surface) outline-none resize-y min-h-[60px] text-sm"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write your nirvaagi reply..."
                                                    autoFocus
                                                />
                                                <Box className="flex justify-end gap-2 mt-2">
                                                    <button className="text-xs px-3 py-1.5 rounded-full text-on-surface-variant hover:bg-white/5 transition-colors" onClick={() => setReplyingTo(null)}>Cancel</button>
                                                    <button
                                                        className="text-xs px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                                                        onClick={() => handleReply(postId, comment.id, username)}
                                                        disabled={!replyText.trim() || isSubmitting}
                                                    >
                                                        {isSubmitting ? 'Sending...' : 'Reply'}
                                                    </button>
                                                </Box>
                                            </Box>
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Card>
                    ))
                )}
            </Box>
        </Box>
    );
}

