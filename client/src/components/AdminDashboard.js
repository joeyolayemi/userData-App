import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Toolbar,
} from '@mui/material';
import { Delete, Edit, Refresh } from '@mui/icons-material';
import config from '../config';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, userId: null });

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Failed to fetch users. Please try again.',
      });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/users/${editDialog.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify(editDialog.user),
      });

      if (!response.ok) throw new Error('Failed to update user');

      setStatus({ type: 'success', message: 'User updated successfully' });
      setEditDialog({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/users/${deleteDialog.userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete user');

      setStatus({ type: 'success', message: 'User deleted successfully' });
      setDeleteDialog({ open: false, userId: null });
      fetchUsers();
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2 }}>
        <Toolbar sx={{ 
          pl: { sm: 2 }, 
          pr: { xs: 1, sm: 1 },
          background: 'linear-gradient(45deg, #2196f3 30%, #f50057 90%)',
          borderRadius: '8px 8px 0 0',
        }}>
          <Typography
            sx={{ flex: '1 1 100%', color: 'white' }}
            variant="h6"
            component="div"
          >
            User Management
          </Typography>
          <Button
            startIcon={<Refresh />}
            onClick={fetchUsers}
            sx={{ color: 'white' }}
          >
            Refresh
          </Button>
        </Toolbar>

        {status.message && (
          <Alert 
            severity={status.type} 
            sx={{ m: 2 }}
            onClose={() => setStatus({ type: '', message: '' })}
          >
            {status.message}
          </Alert>
        )}

        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone}</TableCell>
                    <TableCell>{user.address}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={() => setEditDialog({ open: true, user })}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => setDeleteDialog({ open: true, userId: user.id })}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={users.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null })}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="Name"
              fullWidth
              value={editDialog.user?.name || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                user: { ...editDialog.user, name: e.target.value }
              })}
            />
            <TextField
              label="Email"
              fullWidth
              value={editDialog.user?.email || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                user: { ...editDialog.user, email: e.target.value }
              })}
            />
            <TextField
              label="Phone"
              fullWidth
              value={editDialog.user?.phone || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                user: { ...editDialog.user, phone: e.target.value }
              })}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              rows={3}
              value={editDialog.user?.address || ''}
              onChange={(e) => setEditDialog({
                ...editDialog,
                user: { ...editDialog.user, address: e.target.value }
              })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, user: null })}>Cancel</Button>
          <Button onClick={handleEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, userId: null })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this user?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, userId: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AdminDashboard; 