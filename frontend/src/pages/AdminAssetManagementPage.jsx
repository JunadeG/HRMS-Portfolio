// src/pages/AdminAssetManagementPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchCompanyAssets, createAsset, allocateAsset, deallocateAsset, fetchAdminUsers } from '../services/apiService';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaTimes } from 'react-icons/fa'; // Import the close icon

// --- Styled Components ---
const PageContainer = styled.div` padding: 30px; max-width: 1400px; margin: 20px auto; `;
const PageTitle = styled.h2` color: var(--text-primary); margin-bottom: 25px; border-bottom: 2px solid var(--text-accent); padding-bottom: 10px; `;
const GridContainer = styled.div` display: grid; grid-template-columns: 1fr 2fr; gap: 30px; align-items: start; @media (max-width: 992px) { grid-template-columns: 1fr; }`;
const FormContainer = styled.div` background-color: var(--background-secondary); padding: 25px; border-radius: 8px; border: 1px solid var(--border-primary); box-shadow: 0 2px 8px var(--shadow-color); `;
const SectionTitle = styled.h3` margin-top: 0; margin-bottom: 20px; color: var(--text-accent); border-bottom: 1px solid var(--border-secondary); padding-bottom: 10px; `;
const Form = styled.form` display: flex; flex-direction: column; gap: 15px; `;
const FormGroup = styled.div` display: flex; flex-direction: column; gap: 5px; label { font-weight: 600; font-size: 0.9em; color: var(--text-secondary); } input, select, .react-datepicker-wrapper input { width: 100%; box-sizing: border-box; padding: 9px 12px; border: 1px solid var(--border-primary); border-radius: 4px; font-size: 1em; background-color: var(--background-secondary); color: var(--text-primary); }`;
const SubmitButton = styled.button` padding: 10px 18px; background-color: var(--text-accent); color: var(--text-on-accent); border: none; border-radius: 5px; cursor: pointer; font-weight: 500; align-self: flex-start; margin-top: 10px; &:disabled { opacity: 0.6; } `;
const AssetTable = styled.table` width: 100%; border-collapse: collapse; background-color: var(--background-secondary); border-radius: 8px; overflow: hidden; border: 1px solid var(--border-primary); th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid var(--border-secondary); } th { background-color: var(--background-tertiary); }`;
const ActionButton = styled.button` padding: 5px 10px; font-size: 0.9em; border-radius: 4px; cursor: pointer; border: none; color: white; &.allocate { background-color: var(--text-success); } &.deallocate { background-color: var(--text-muted); } `;
// MODAL STYLES
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; animation: fadeIn 0.3s; `;
const ModalContent = styled.div` background-color: var(--background-secondary); padding: 25px; border-radius: 8px; width: 90%; max-width: 500px; position: relative; animation: fadeInUp 0.4s ease-out; `;
const CloseButton = styled.button` position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; `;

const AdminAssetManagementPage = () => {
    const [assets, setAssets] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newAsset, setNewAsset] = useState({ assetName: '', assetType: '', serialNumber: '', purchaseDate: null, warrantyEndDate: null });
    
    // State for the new allocation modal
    const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState('');

    const loadData = useCallback(async () => {
        // No need to set loading true on every refresh
        try {
            const [assetsData, usersData] = await Promise.all([fetchCompanyAssets(), fetchAdminUsers()]);
            setAssets(assetsData || []);
            setUsers(usersData.filter(u => u.status === 'APPROVED') || []);
        } catch (err) { setError(err.message || 'Failed to load data.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleCreateAsset = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        try {
            await createAsset(newAsset);
            setSuccess('Asset created successfully!');
            setNewAsset({ assetName: '', assetType: '', serialNumber: '', purchaseDate: null, warrantyEndDate: null });
            await loadData();
        } catch (err) { setError(err.message || 'Failed to create asset.'); }
    };
    
    const openAllocationModal = (asset) => {
        setSelectedAsset(asset);
        setSelectedUserId(''); // Reset selection
        setIsAllocationModalOpen(true);
    };

    const closeAllocationModal = () => {
        setIsAllocationModalOpen(false);
        setSelectedAsset(null);
        setError('');
    };

    const handleAllocate = async () => {
        if (!selectedUserId || !selectedAsset) {
            setError("You must select a user.");
            return;
        }
        setError(''); setSuccess('');
        try {
            await allocateAsset(selectedAsset.id, selectedUserId);
            setSuccess(`Asset "${selectedAsset.assetName}" allocated successfully.`);
            closeAllocationModal();
            await loadData();
        } catch (err) { setError(err.message || "Allocation failed."); }
    };

    const handleDeallocate = async (assetId) => {
        if (!window.confirm("Are you sure you want to deallocate this asset?")) return;
        setError(''); setSuccess('');
        try {
            await deallocateAsset(assetId);
            setSuccess(`Asset has been deallocated.`);
            await loadData();
        } catch (err) { setError(err.message || "Deallocation failed."); }
    };
    
    if (loading) return <PageContainer><PageTitle>Asset Management</PageTitle><p>Loading...</p></PageContainer>;

    return (
        <>
            <PageContainer>
                <PageTitle>Asset Management</PageTitle>
                {error && <p className="message-display error">{error}</p>}
                {success && <p className="message-display success">{success}</p>}
                <GridContainer>
                    <FormContainer>
                        <SectionTitle>Add New Asset</SectionTitle>
                        <Form onSubmit={handleCreateAsset}>
                            <FormGroup><label>Asset Name</label><input type="text" value={newAsset.assetName} onChange={e => setNewAsset({...newAsset, assetName: e.target.value})} required /></FormGroup>
                            <FormGroup><label>Asset Type</label><input type="text" placeholder="e.g., Laptop, Monitor" value={newAsset.assetType} onChange={e => setNewAsset({...newAsset, assetType: e.target.value})} required /></FormGroup>
                            <FormGroup><label>Serial Number</label><input type="text" value={newAsset.serialNumber} onChange={e => setNewAsset({...newAsset, serialNumber: e.target.value})} /></FormGroup>
                            <FormGroup><label>Purchase Date</label><DatePicker selected={newAsset.purchaseDate} onChange={date => setNewAsset({...newAsset, purchaseDate: date})} /></FormGroup>
                            <FormGroup><label>Warranty End Date</label><DatePicker selected={newAsset.warrantyEndDate} onChange={date => setNewAsset({...newAsset, warrantyEndDate: date})} /></FormGroup>
                            <SubmitButton type="submit">Create Asset</SubmitButton>
                        </Form>
                    </FormContainer>
                    <div>
                        <SectionTitle>Company Asset Inventory</SectionTitle>
                        <AssetTable>
                            <thead><tr><th>Name</th><th>Type</th><th>Serial #</th><th>Status</th><th>Allocated To</th><th>Actions</th></tr></thead>
                            <tbody>
                                {assets.map(asset => (
                                    <tr key={asset.id}>
                                        <td>{asset.assetName}</td>
                                        <td>{asset.assetType}</td>
                                        <td>{asset.serialNumber}</td>
                                        <td>{asset.status}</td>
                                        <td>{asset.allocatedToUserName || 'N/A'}</td>
                                        <td>
                                            {asset.status === 'AVAILABLE' && <ActionButton className="allocate" onClick={() => openAllocationModal(asset)}>Allocate</ActionButton>}
                                            {asset.status === 'ALLOCATED' && <ActionButton className="deallocate" onClick={() => handleDeallocate(asset.id)}>Deallocate</ActionButton>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </AssetTable>
                    </div>
                </GridContainer>
            </PageContainer>

            {isAllocationModalOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <CloseButton onClick={closeAllocationModal}><FaTimes /></CloseButton>
                        <SectionTitle>Allocate Asset</SectionTitle>
                        <p>Asset: <strong>{selectedAsset?.assetName}</strong> (S/N: {selectedAsset?.serialNumber})</p>
                        <FormGroup>
                            <label htmlFor="user-select">Assign to Employee:</label>
                            <select id="user-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} required>
                                <option value="" disabled>-- Choose an employee --</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName} ({user.employeeId || user.username})
                                    </option>
                                ))}
                            </select>
                        </FormGroup>
                        <SubmitButton onClick={handleAllocate}>Confirm Allocation</SubmitButton>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
};

export default AdminAssetManagementPage;