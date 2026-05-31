import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export const ConfirmDialog = ({ open, title, message, onCancel, onProceed }: { open: boolean, title?: string, message?: string, onCancel: () => void, onProceed: () => void }) => {
    return (
        <Dialog 
            open={open} 
            onClose={onCancel}
            slotProps={{ paper: {
                sx: { borderRadius: 4, minWidth: 320 }
            } }}
        >
            <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{title || 'Are you sure?'}</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {message || 'This action cannot be undone.'}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
                <Button onClick={onCancel} color="inherit" sx={{ borderRadius: 3 }}>
                    Cancel
                </Button>
                <Button onClick={onProceed} variant="contained" color="error" sx={{ borderRadius: 3, boxShadow: 'none' }}>
                    Proceed
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
