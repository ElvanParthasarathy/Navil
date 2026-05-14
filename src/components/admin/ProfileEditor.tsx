import React from 'react';
import { FiEdit3, FiX, FiCheck } from 'react-icons/fi';

export const ProfileEditor = ({
    profileData,
    isProfileEditing,
    setIsProfileEditing,
    onUpdateProfile,
    onSave
}) => {
    return (
        <div className="admin-content-area">
            <div className="admin-editor-full">
                <div className="admin-editor-toolbar">
                    <h2>Profile Details</h2>
                    <div className="admin-editor-toolbar-actions">
                        {!isProfileEditing ? (
                            <button className="adm-btn primary" onClick={() => setIsProfileEditing(true)}>
                                <FiEdit3 size={14} /> Edit Profile
                            </button>
                        ) : (
                            <>
                                <button className="adm-btn ghost" onClick={() => setIsProfileEditing(false)}>
                                    <FiX size={14} /> Cancel
                                </button>
                                <button className="adm-btn primary" onClick={onSave}>
                                    <FiCheck size={14} /> Save Profile
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="admin-editor-body">
                    {!isProfileEditing ? (
                        <div className="adm-profile-view">
                            <div className="adm-profile-card">
                                <div className="adm-profile-avatar">
                                    {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'A'}
                                </div>
                                <div className="adm-profile-info">
                                    <h3>{profileData.name}</h3>
                                    <p className="adm-profile-bio">{profileData.bio}</p>

                                    <div className="adm-profile-stats-row">
                                        <div className="adm-profile-stat">
                                            <span className="adm-stat-value">{profileData.followers || 0}</span>
                                            <span className="adm-stat-label">Followers</span>
                                        </div>
                                        <div className="adm-profile-stat">
                                            <span className="adm-stat-value">{profileData.following || 0}</span>
                                            <span className="adm-stat-label">Following</span>
                                        </div>
                                        <div className="adm-profile-stat">
                                            <span className="adm-stat-value">{profileData.postsCount || 0}</span>
                                            <span className="adm-stat-label">Posts</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="adm-form adm-profile-edit-form">
                            <div className="adm-grid">
                                <div className="adm-field">
                                    <label className="adm-label">Full Name</label>
                                    <input className="adm-input" value={profileData.name || ''} onChange={(e) => onUpdateProfile('name', e.target.value)} />
                                </div>
                                <div className="adm-field" style={{ gridColumn: '1 / -1' }}>
                                    <label className="adm-label">Bio</label>
                                    <textarea className="adm-input" rows={4} style={{ minHeight: '96px' }} value={profileData.bio || ''} onChange={(e) => onUpdateProfile('bio', e.target.value)} />
                                </div>
                            </div>

                            <div className="adm-section">
                                <span className="adm-section-title">Instagram Stats</span>
                                <div className="adm-stats-grid" style={{ marginTop: '12px' }}>
                                    <div className="adm-field">
                                        <label className="adm-label">Followers</label>
                                        <input className="adm-input" type="number" value={profileData.followers || 0} onChange={(e) => onUpdateProfile('followers', parseInt(e.target.value))} />
                                    </div>
                                    <div className="adm-field">
                                        <label className="adm-label">Following</label>
                                        <input className="adm-input" type="number" value={profileData.following || 0} onChange={(e) => onUpdateProfile('following', parseInt(e.target.value))} />
                                    </div>
                                    <div className="adm-field">
                                        <label className="adm-label">Posts</label>
                                        <input className="adm-input" type="number" value={profileData.postsCount || 0} onChange={(e) => onUpdateProfile('postsCount', parseInt(e.target.value))} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
