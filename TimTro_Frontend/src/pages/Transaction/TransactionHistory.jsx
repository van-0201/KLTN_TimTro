import React, { useEffect, useState } from 'react';
import { FaSearch, FaImage } from 'react-icons/fa';
import api from '../../services/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getAuthUser } from '../../utils/auth';
import Pagination from '../../components/Common/Pagination';

const TransactionHistory = () => {
    const user = getAuthUser();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const fetchHistory = async (currentPage = 1, searchQuery = search) => {
        setLoading(true);
        try {
            const params = { page: currentPage, pageSize: 10 };
            if (searchQuery) {
                params.search = searchQuery;
            }
            const res = await api.get('/Transaction/history', { params });
            setTransactions(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory(page, search);
    }, [page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchHistory(1, search);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: vi });
        } catch {
            return dateString;
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ThanhCong': return { color: '#10B981', fontWeight: 'bold' };
            case 'TuChoi': return { color: '#EF4444', fontWeight: 'bold' };
            case 'ChoDuyet': return { color: '#F59E0B', fontWeight: 'bold' };
            case 'DaHuy': return { color: '#6B7280', fontWeight: 'bold' };
            default: return {};
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'ThanhCong': return 'Thành công';
            case 'TuChoi': return 'Từ chối';
            case 'ChoDuyet': return 'Chờ duyệt';
            case 'DaHuy': return 'Đã hủy';
            default: return status;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Lịch Sử Giao Dịch</h1>
            </div>

            {(user?.role === 'Admin' || user?.role === 'Moderator') && (
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                    <div style={{
                        flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                        background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                        borderRadius: '10px', padding: '0 16px',
                    }}>
                        <FaSearch style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Tìm người dùng..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            style={{
                                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                                color: 'var(--text-main)', fontSize: '15px', padding: '12px 0',
                            }}
                        />
                    </div>
                    <button type="submit" className="btn-primary" style={{ padding: '0 24px', whiteSpace: 'nowrap' }}>
                        Tìm kiếm
                    </button>
                </form>
            )}

            {loading ? (
                <div>Đang tải dữ liệu...</div>
            ) : transactions.length === 0 ? (
                <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
                    Không có giao dịch nào.
                </div>
            ) : (
                <>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                            <thead>
                                <tr style={{borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)'}}>
                                    <th style={{padding: '12px'}}>Người dùng</th>
                                    <th style={{padding: '12px'}}>Ngày tạo</th>
                                    <th style={{padding: '12px'}}>Ngày duyệt</th>
                                    <th style={{padding: '12px'}}>Gói dịch vụ</th>
                                    <th style={{padding: '12px'}}>Số tiền</th>
                                    <th style={{padding: '12px', textAlign: 'center'}}>Minh chứng</th>
                                    {(user?.role === 'Admin' || user?.role === 'Moderator') && (
                                        <th style={{padding: '12px'}}>Người duyệt</th>
                                    )}
                                    <th style={{padding: '12px'}}>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map(tx => (
                                    <tr key={tx.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                        <td style={{padding: '12px'}}>{tx.nguoiDungTen || '—'}</td>
                                        <td style={{padding: '12px'}}>{formatDate(tx.ngayTao)}</td>
                                        <td style={{padding: '12px'}}>{formatDate(tx.ngayDuyet)}</td>
                                        <td style={{padding: '12px', fontWeight: 'bold'}}>{tx.loaiGoi || '—'}</td>
                                        <td style={{padding: '12px', color: 'var(--primary)', fontWeight: 'bold'}}>{formatCurrency(tx.soTien)}</td>
                                        <td style={{padding: '12px', textAlign: 'center'}}>
                                            {tx.minhChung ? (
                                                <button onClick={() => setSelectedImage(tx.minhChung)} style={{background: 'transparent', color: '#3b82f6', border: 'none', cursor: 'pointer', fontSize: '18px'}} title="Xem minh chứng">
                                                    <FaImage />
                                                </button>
                                            ) : '—'}
                                        </td>
                                        {(user?.role === 'Admin' || user?.role === 'Moderator') && (
                                            <td style={{padding: '12px'}}>{tx.nguoiDuyetTen || '—'}</td>
                                        )}
                                        <td style={{padding: '12px'}}>
                                            <span style={getStatusStyle(tx.trangThai)}>
                                                {getStatusText(tx.trangThai)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <Pagination 
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}

            {/* Modal hiển thị ảnh minh chứng */}
            {selectedImage && (
                <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}} onClick={() => setSelectedImage(null)}>
                    <div style={{position: 'relative', maxWidth: '90%', maxHeight: '90%'}} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedImage(null)} style={{position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer'}}>
                            &times; Đóng
                        </button>
                        <img src={selectedImage} alt="Minh chứng" style={{maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px'}} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
