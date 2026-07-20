import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaUsers, FaClipboardList, FaMoneyBillWave, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [growthChartData, setGrowthChartData] = useState([]);
    const [revenueChartData, setRevenueChartData] = useState([]);
    
    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingGrowth, setLoadingGrowth] = useState(true);
    const [loadingRevenue, setLoadingRevenue] = useState(true);
    const [loaiBaiDang, setLoaiBaiDang] = useState('TatCa');
    const [vaiTro, setVaiTro] = useState('TatCa');
    const currentYear = new Date().getFullYear();
    const [revenueYear, setRevenueYear] = useState(currentYear);
    const [growthYear, setGrowthYear] = useState(currentYear);
    
    // Generate years from 2026 to current year
    const availableYears = Array.from({ length: Math.max(1, currentYear - 2026 + 1) }, (_, i) => 2026 + i);

    const fetchStats = async () => {
        setLoadingStats(true);
        try {
            // Không truyền filter để lấy tổng quan toàn hệ thống
            const res = await api.get(`/Admin/statistics`);
            setStats(res.data);
        } catch (error) {
            console.error("Lỗi khi tải thống kê", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchGrowthChart = async () => {
        setLoadingGrowth(true);
        try {
            const res = await api.get(`/Admin/chart-statistics?year=${growthYear}&loaiBaiDang=${loaiBaiDang}&vaiTro=${vaiTro}`);
            setGrowthChartData(res.data);
        } catch (error) {
            console.error("Lỗi khi tải biểu đồ tăng trưởng", error);
        } finally {
            setLoadingGrowth(false);
        }
    };

    const fetchRevenueChart = async () => {
        setLoadingRevenue(true);
        try {
            const res = await api.get(`/Admin/chart-statistics?year=${revenueYear}`);
            setRevenueChartData(res.data);
        } catch (error) {
            console.error("Lỗi khi tải biểu đồ doanh thu", error);
        } finally {
            setLoadingRevenue(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchGrowthChart();
    }, [loaiBaiDang, vaiTro, growthYear]);

    useEffect(() => {
        fetchRevenueChart();
    }, [revenueYear]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loadingStats && !stats) return <div className="page-container">Đang tải dữ liệu...</div>;
    
    return (
        <div className="page-container">
            <div className="page-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px'}}>
                <h1 className="page-title" style={{margin: 0}}>Tổng quan Hệ thống</h1>
            </div>

            {stats && (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '30px' }}>
                    <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                        <div style={{ padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))', color: 'var(--primary)', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.1)' }}>
                            <FaUsers size={32} />
                        </div>
                        <div style={{width: '100%'}}>
                            <div style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '500' }}>Tổng người dùng</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{stats.tongNguoiDung}</div>
                            <div style={{ fontSize: '13px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>+{stats.nguoiDungMoiThangNay} trong tháng này</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                                <span>Thuê: <strong style={{color: 'var(--text-main)'}}>{stats.nguoiThueCount}</strong></span>
                                <span>Chủ: <strong style={{color: 'var(--text-main)'}}>{stats.chuTroCount}</strong></span>
                            </div>
                        </div>
                    </div>

                    <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                        <div style={{ padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', color: '#10b981', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.1)' }}>
                            <FaCheckCircle size={32} />
                        </div>
                        <div style={{width: '100%'}}>
                            <div style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '500' }}>Tổng bài đăng</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{stats.tongBaiDang}</div>
                            <div style={{ fontSize: '13px', color: '#10b981', marginTop: '4px', fontWeight: '600' }}>+{stats.baiDangMoiThangNay} bài mới tháng này</div>
                        </div>
                    </div>

                    <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                        <div style={{ padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))', color: '#f59e0b', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)' }}>
                            <FaClipboardList size={32} />
                        </div>
                        <div style={{width: '100%'}}>
                            <div style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '500' }}>Bài đăng cần duyệt</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{stats.baiDangChoDuyet}</div>
                            <Link to="/admin/approval" style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>Xem chi tiết &rarr;</Link>
                        </div>
                    </div>

                    <div className="form-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '24px', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
                        <div style={{ padding: '18px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.05))', color: '#ef4444', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.1)' }}>
                            <FaExclamationTriangle size={32} />
                        </div>
                        <div style={{width: '100%'}}>
                            <div style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: '500' }}>Báo cáo vi phạm</div>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>{stats.tongBaoCaoChoXuLy}</div>
                            <Link to="/admin/reports" style={{ fontSize: '14px', color: '#ef4444', fontWeight: '600', marginTop: '4px', display: 'inline-block' }}>Xử lý ngay &rarr;</Link>
                        </div>
                    </div>
                </div>

                {/* Biểu đồ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                    
                    {/* Biểu đồ Doanh Thu */}
                    <div className="form-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>Doanh thu theo thời gian</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>Xu hướng doanh thu theo năm</p>
                            </div>
                            <select 
                                className="premium-input" 
                                value={revenueYear} 
                                onChange={e => setRevenueYear(Number(e.target.value))} 
                                style={{padding: '6px 12px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px'}}
                            >
                                {availableYears.map(y => (
                                    <option key={y} value={y} style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Năm {y}</option>
                                ))}
                            </select>
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            {loadingRevenue ? <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>Đang tải...</div> : 
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueChartData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis dataKey="thang" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} interval={0} />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fill: 'var(--text-muted)', fontSize: 12}}
                                        tickFormatter={(value) => `${value >= 1000000 ? (value/1000000).toFixed(1) + 'M' : value >= 1000 ? (value/1000).toFixed(0) + 'K' : value}`}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                        itemStyle={{ color: '#fff' }}
                                        formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                                    <Line type="monotone" dataKey="doanhThu" name="Doanh Thu" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} connectNulls={false} />
                                </LineChart>
                            </ResponsiveContainer>
                            }
                        </div>
                    </div>

                    {/* Biểu đồ Tăng trưởng */}
                    <div className="form-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-main)' }}>Tăng trưởng hệ thống</h3>
                                <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--text-muted)' }}>Xu hướng tăng trưởng theo năm</p>
                            </div>
                            <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                                <select 
                                    className="premium-input" 
                                    value={growthYear} 
                                    onChange={e => setGrowthYear(Number(e.target.value))} 
                                    style={{padding: '6px 12px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px'}}
                                >
                                    {availableYears.map(y => (
                                        <option key={y} value={y} style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Năm {y}</option>
                                    ))}
                                </select>
                                <select 
                                    className="premium-input" 
                                    value={vaiTro} 
                                    onChange={e => setVaiTro(e.target.value)} 
                                    style={{padding: '6px 12px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px'}}
                                >
                                    <option value="TatCa" style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Tất cả tài khoản</option>
                                    <option value="NguoiThue" style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Người thuê</option>
                                    <option value="ChuTro" style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Chủ trọ</option>
                                </select>
                                <select 
                                    className="premium-input" 
                                    value={loaiBaiDang} 
                                    onChange={e => setLoaiBaiDang(e.target.value)} 
                                    style={{padding: '6px 12px', background: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '6px'}}
                                >
                                    <option value="TatCa" style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Tất cả bài đăng</option>
                                    <option value="ChoThuePhong" style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Phòng trọ</option>
                                    <option value="NhaNguyenCan" style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Nhà nguyên căn</option>
                                    <option value="TimNguoiOGhep" style={{backgroundColor: '#1E293B', color: '#F8FAFC'}}>Tìm người ở ghép</option>
                                </select>
                            </div>
                        </div>
                        <div style={{ height: '300px', width: '100%' }}>
                            {loadingGrowth ? <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>Đang tải...</div> : 
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={growthChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                    <XAxis dataKey="thang" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} dy={10} interval={0} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                                        itemStyle={{ color: '#fff' }}
                                        cursor={{fill: 'var(--hover-bg)', opacity: 0.4}}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px'}} />
                                    <Bar dataKey="nguoiDungMoi" name="Người dùng mới" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="baiDangMoi" name="Bài đăng mới" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                            }
                        </div>
                    </div>

                </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
