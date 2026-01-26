// src/pages/PayslipPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { fetchMyPayslips, fetchPayslipDetails, API_BASE_URL } from '../services/apiService';
import { FaFilePdf, FaTimes, FaCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// --- Styled Components ---
const PageContainer = styled.div`
  padding: 30px;
  max-width: 1000px;
  margin: 20px auto;
  background-color: var(--background-secondary);
  border-radius: 8px;
  box-shadow: 0 2px 10px var(--shadow-color);
  border: 1px solid var(--border-primary);
`;
const PageTitle = styled.h2`
  color: var(--text-primary);
  margin-bottom: 25px;
  border-bottom: 2px solid var(--text-accent);
  padding-bottom: 10px;
`;
const HeaderControls = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-bottom: 20px;
    gap: 10px;
`;
const DatePickerInput = styled.button`
    background-color: var(--background-tertiary);
    border: 1px solid var(--border-primary);
    padding: 8px 15px;
    border-radius: 6px;
    color: var(--text-primary);
    font-size: 0.95em;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    &:hover { border-color: var(--border-accent); }
`;
const PayslipList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 20px;
`;
const PayslipListItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid var(--border-secondary);
  transition: background-color 0.2s ease;
  &:hover { background-color: var(--background-hover); }
  &:last-child { border-bottom: none; }
`;
const Button = styled.button`
  padding: 8px 15px; border: none; border-radius: 4px; cursor: pointer;
  background-color: var(--text-accent); color: var(--text-on-accent);
  font-weight: 500;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const ModalOverlay = styled.div` position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.7); display: flex; align-items: center; justify-content: center; z-index: 1050; `;
const ModalContent = styled.div` background: var(--background-secondary); padding: 25px; border-radius: 8px; width: 90%; max-width: 700px; max-height: 90vh; overflow-y: auto; position: relative; `;
const CloseButton = styled.button` position: absolute; top: 10px; right: 10px; background: transparent; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; `;
const PayslipHeader = styled.div` text-align: center; margin-bottom: 20px; border-bottom: 1px solid var(--border-secondary); padding-bottom: 15px;`;
const PayslipDetailGrid = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; p { margin: 2px 0; }`;
const PayslipSection = styled.div` margin-top: 20px; `;
const PayslipTable = styled.table` width: 100%; border-collapse: collapse; th, td { padding: 10px; text-align: left; } .amount { text-align: right; } tbody tr:nth-child(even) { background-color: var(--background-tertiary); }`;
const PayslipTotals = styled.div` margin-top: 20px; padding-top: 15px; border-top: 2px solid var(--text-primary); text-align: right; font-size: 1.1em; font-weight: bold;`;

const PayslipPage = () => {
    const [payslips, setPayslips] = useState([]);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // CRITICAL FIX: The useEffect hook now depends on selectedDate.
    useEffect(() => {
        const loadPayslips = async () => {
            setLoading(true);
            setError(''); // Clear previous errors
            try {
                const data = await fetchMyPayslips(selectedDate.getFullYear(), selectedDate.getMonth() + 1);
                setPayslips(data || []);
            } catch (err) {
                setError(`Failed to load payslips: ${err.message}`);
                setPayslips([]); // Clear payslips on error
            } finally {
                setLoading(false);
            }
        };

        loadPayslips();
    }, [selectedDate]); // This dependency array is the key to the fix.

    const handleViewDetails = async (payslipId) => {
        setDetailLoading(true);
        setError('');
        try {
            const details = await fetchPayslipDetails(payslipId);
            setSelectedPayslip(details);
        } catch (err) {
            setError(`Could not load payslip details: ${err.message}`);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDownloadPdf = () => {
        alert("PDF download functionality is a future enhancement.");
    };

    const renderPayslipModal = () => (
        <ModalOverlay onClick={() => setSelectedPayslip(null)}>
            <ModalContent onClick={e => e.stopPropagation()}>
                <CloseButton onClick={() => setSelectedPayslip(null)}><FaTimes /></CloseButton>
                <PayslipHeader>
                    <h2>Payslip</h2>
                    <h4>For the period: {selectedPayslip.payPeriodStart} to {selectedPayslip.payPeriodEnd}</h4>
                </PayslipHeader>
                <PayslipDetailGrid>
                    <div>
                        <p><strong>Employee:</strong> {selectedPayslip.userFullName}</p>
                        <p><strong>Username:</strong> {selectedPayslip.userName}</p>
                    </div>
                    <div>
                        <p><strong>Department:</strong> {selectedPayslip.departmentName}</p>
                        <p><strong>Generation Date:</strong> {selectedPayslip.generationDate}</p>
                    </div>
                </PayslipDetailGrid>
                
                <PayslipSection>
                    <PayslipTable>
                        <thead><tr><th>Earnings</th><th className="amount">Amount</th></tr></thead>
                        <tbody>
                            {selectedPayslip.items.filter(i => i.type === 'ALLOWANCE').map((item, index) => (
                                <tr key={`earn-${index}`}><td>{item.componentName}</td><td className="amount">{item.amount.toFixed(2)}</td></tr>
                            ))}
                        </tbody>
                    </PayslipTable>
                </PayslipSection>

                <PayslipSection>
                    <PayslipTable>
                        <thead><tr><th>Deductions</th><th className="amount">Amount</th></tr></thead>
                        <tbody>
                            {selectedPayslip.items.filter(i => i.type === 'DEDUCTION').map((item, index) => (
                                <tr key={`deduct-${index}`}><td>{item.componentName}</td><td className="amount">{item.amount.toFixed(2)}</td></tr>
                            ))}
                        </tbody>
                    </PayslipTable>
                </PayslipSection>
                
                <PayslipTotals>
                    <p>Gross Earnings: <span className="amount">{selectedPayslip.grossSalary.toFixed(2)}</span></p>
                    <p>Total Deductions: <span className="amount">{selectedPayslip.totalDeductions.toFixed(2)}</span></p>
                    <p>Net Salary: <span className="amount">{selectedPayslip.netSalary.toFixed(2)}</span></p>
                </PayslipTotals>

                <div style={{marginTop: '30px', textAlign: 'right'}}>
                    <Button onClick={handleDownloadPdf}><FaFilePdf /> Download as PDF</Button>
                </div>
            </ModalContent>
        </ModalOverlay>
    );

    const CustomDatePickerInput = React.forwardRef(({ value, onClick }, ref) => (
        <DatePickerInput onClick={onClick} ref={ref}>
            <FaCalendarAlt /> {value}
        </DatePickerInput>
    ));

    return (
        <PageContainer>
            <PageTitle>My Payslips</PageTitle>
            {error && <p className="message-display error">{error}</p>}
            
            <HeaderControls>
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="MMMM yyyy"
                    showMonthYearPicker
                    customInput={<CustomDatePickerInput value={selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })} />}
                />
            </HeaderControls>
            
            {loading ? <p>Loading payslips...</p> : (
                <PayslipList>
                    {payslips.length === 0 ? <p>No payslips found for this period.</p> : payslips.map(p => (
                        <PayslipListItem key={p.id}>
                            <div>
                                <strong>Pay Period:</strong> {p.payPeriodStart} - {p.payPeriodEnd}
                                <br/>
                                <span style={{color: 'var(--text-secondary)', fontSize: '0.9em'}}>Net Salary: {p.netSalary.toFixed(2)}</span>
                            </div>
                            <Button onClick={() => handleViewDetails(p.id)} disabled={detailLoading}>
                                {detailLoading && selectedPayslip?.id !== p.id ? 'View Details' : detailLoading ? 'Loading...' : 'View Details'}
                            </Button>
                        </PayslipListItem>
                    ))}
                </PayslipList>
            )}

            {selectedPayslip && renderPayslipModal()}
        </PageContainer>
    );
};

export default PayslipPage;