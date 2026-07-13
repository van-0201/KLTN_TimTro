import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaCheck, FaTimes } from 'react-icons/fa';
import Pagination from '../../components/Common/Pagination';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const TransactionApproval = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchPendingTransactions(currentPage);
    }, [currentPage]);

    const fetchPendingTransactions = async (page) => {
        setLoading(true);
        try {
            const response = await api.get('/Transaction/pending', {
                params: { page, pageSize }
            });
            setTransactions(response.data.items || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Lỗi lấy danh sách giao dịch:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleApprove = async (id, isApprove) => {
        if (!window.confirm(isApprove ? 'Xác nhận duyệt giao dịch này?' : 'Xác nhận TỪ CHỐI giao dịch này?')) return;
        
        try {
            await api.post(`/Transaction/${id}/approve`, {
                trangThai: isApprove ? 'ThanhCong' : 'TuChoi'
            });
            alert('Xử lý thành công!');
            fetchPendingTransactions(currentPage);
        } catch (error) {
            alert(error.response?.data || 'Có lỗi xảy ra');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Kiểm duyệt giao dịch (Mua Gói)</h1>
            </div>

            <div className="form-card">
                {loading ? (
                    <div style={{padding: '20px', textAlign: 'center'}}>Đang tải dữ liệu...</div>
                ) : transactions.length === 0 ? (
                    <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
                        Không có giao dịch nào đang chờ duyệt.
                    </div>
                ) : (
                    <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '10px'}}>
                        <thead>
                            <tr style={{borderBottom: '2px solid var(--border-color)', textAlign: 'left'}}>
                                <th style={{padding: '12px', color: 'var(--text-muted)'}}>Ngày tạo</th>
                                <th style={{padding: '12px', color: 'var(--text-muted)'}}>Người dùng</th>
                                <th style={{padding: '12px', color: 'var(--text-muted)'}}>Liên hệ</th>
                                <th style={{padding: '12px', color: 'var(--text-muted)'}}>Gói Dịch Vụ</th>
                                <th style={{padding: '12px', color: 'var(--text-muted)'}}>Số tiền</th>
                                <th style={{padding: '12px', color: 'var(--text-muted)'}}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                    <td style={{padding: '12px'}}>{format(new Date(tx.ngayTao), 'HH:mm dd/MM/yyyy', { locale: vi })}</td>
                                    <td style={{padding: '12px'}}><strong>{tx.nguoiDungTen}</strong></td>
                                    <td style={{padding: '12px'}}>
                                        <div style={{fontSize: '13px'}}>{tx.nguoiDungPhone || 'N/A'}</div>
                                        <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>{tx.nguoiDungEmail || 'N/A'}</div>
                                    </td>
                                    <td style={{padding: '12px', color: 'var(--primary)', fontWeight: 'bold'}}>{tx.loaiGoi}</td>
                                    <td style={{padding: '12px', color: '#ef4444', fontWeight: 'bold'}}>{formatCurrency(tx.soTien)}</td>
                                    <td style={{padding: '12px'}}>
                                        <div style={{display: 'flex', gap: '8px'}}>
                                            <button onClick={() => handleApprove(tx.id, true)} style={{background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                <FaCheck /> Duyệt
                                            </button>
                                            <button onClick={() => handleApprove(tx.id, false)} style={{background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                                <FaTimes /> Từ chối
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
};

export default TransactionApproval;
