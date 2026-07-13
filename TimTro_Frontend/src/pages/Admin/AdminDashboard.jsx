import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaUsers, FaClipboardList, FaMoneyBillWave, FaExclamationTriangle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/Admin/statistics?month=${month}&year=${year}`);
            setStats(res.data);
        } catch (error) {
            console.error("Lỗi khi tải thống kê", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [month, year]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading && !stats) return <div className="page-container">Đang tải dữ liệu...</div>;
    
    return (
        <div className="page-container">
            <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1 className="page-title">Tổng quan Hệ thống</h1>
                <div style={{display: 'flex', gap: '10px'}}>
                    <select className="premium-input" value={month} onChange={e => setMonth(Number(e.target.value))} style={{width: '120px', padding: '8px 16px'}}>
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                            <option key={m} value={m}>Tháng {m}</option>
                        ))}
                    </select>
                    <select className="premium-input" value={year} onChange={e => setYear(Number(e.target.value))} style={{width: '120px', padding: '8px 16px'}}>
                        {[2024, 2025, 2026, 2027].map(y => (
                            <option key={y} value={y}>Năm {y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {stats && (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                    <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                            <FaUsers size={32} />
                        </div>
                        <div style={{width: '100%'}}>
                            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tổng người dùng</div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.tongNguoiDung}</div>
                            <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>+{stats.nguoiDungMoiThangNay} trong kỳ</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '4px' }}>
                                <span>Thê: {stats.nguoiThueCount}</span>
                                <span>Chủ: {stats.chuTroCount}</span>
                                <span>Mod: {stats.moderatorCount}</span>
                            </div>
                        </div>
                    </div>

                <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <FaMoneyBillWave size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Doanh thu tháng này</div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>{formatCurrency(stats.doanhThuThangNay)}</div>
                    </div>
                </div>

                <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                        <FaClipboardList size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Bài đăng cần duyệt</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.baiDangChoDuyet}</div>
                        <Link to="/admin/approval" style={{ fontSize: '13px', color: 'var(--primary)' }}>Xem chi tiết &rarr;</Link>
                    </div>
                </div>

                <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px' }}>
                    <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                        <FaExclamationTriangle size={32} />
                    </div>
                    <div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Báo cáo vi phạm</div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.tongBaoCaoChoXuLy}</div>
                        <Link to="/admin/reports" style={{ fontSize: '13px', color: 'var(--primary)' }}>Xử lý ngay &rarr;</Link>
                    </div>
                </div>
                </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
