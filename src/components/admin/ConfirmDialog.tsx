import React from 'react';
import ReactDOM from 'react-dom';

export const ConfirmDialog = ({ open, title, message, onCancel, onProceed }) => {
    if (!open) return null;

    return ReactDOM.createPortal(
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <h3>{title || 'Are you sure?'}</h3>
                <p>{message || 'This action cannot be undone.'}</p>
                <div className="confirm-actions">
                    <button className="confirm-pill cancel" onClick={onCancel}>Cancel</button>
                    <button className="confirm-pill proceed" onClick={onProceed}>Proceed</button>
                </div>
            </div>
        </div>,
        document.body
    );
};
