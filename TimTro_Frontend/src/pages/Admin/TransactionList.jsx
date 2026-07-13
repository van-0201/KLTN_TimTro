import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const TransactionList = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/Transaction/pending');
            setTransactions(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleApprove = async (id, status) => {
        if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'ThanhCong' ? 'DUYỆT' : 'TỪ CHỐI'} giao dịch này?`)) return;
        try {
            await api.post(`/Transaction/${id}/approve`, { trangThai: status });
            fetchTransactions();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data || error.message));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Duyệt Giao Dịch (Admin)</h1>
            </div>

            {loading ? (
                <div>Đang tải dữ liệu...</div>
            ) : transactions.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
                    Không có giao dịch nào đang chờ duyệt.
                </div>
            ) : (
                <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                        <thead>
                            <tr style={{borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>
                                <th style={{padding: '12px'}}>Ngày tạo</th>
                                <th style={{padding: '12px'}}>Người dùng</th>
                                <th style={{padding: '12px'}}>Gói dịch vụ</th>
                                <th style={{padding: '12px'}}>Số tiền</th>
                                <th style={{padding: '12px'}}>Mã GD</th>
                                <th style={{padding: '12px'}}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map(tx => (
                                <tr key={tx.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                    <td style={{padding: '12px'}}>{formatDate(tx.ngayTao)}</td>
                                    <td style={{padding: '12px'}}>{tx.nguoiDungTen}</td>
                                    <td style={{padding: '12px', fontWeight: 'bold'}}>{tx.loaiGoi}</td>
                                    <td style={{padding: '12px', color: 'var(--primary)', fontWeight: 'bold'}}>{formatCurrency(tx.soTien)}</td>
                                    <td style={{padding: '12px'}}>{tx.noiDungChuyenKhoan}</td>
                                    <td style={{padding: '12px', display: 'flex', gap: '8px'}}>
                                        <button onClick={() => handleApprove(tx.id, 'ThanhCong')} style={{padding: '6px 12px', background: '#10B981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            <FaCheck /> Duyệt
                                        </button>
                                        <button onClick={() => handleApprove(tx.id, 'TuChoi')} style={{padding: '6px 12px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                                            <FaTimes /> Từ chối
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default TransactionList;
