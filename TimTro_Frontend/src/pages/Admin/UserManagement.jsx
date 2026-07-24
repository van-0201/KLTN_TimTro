import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaLock, FaLockOpen, FaTrash, FaKey, FaUserShield, FaUser, FaPlus, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import Pagination from '../../components/Common/Pagination';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ROLE_LABEL = {
    Admin: { label: 'Admin', color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
    Moderator: { label: 'Moderator', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
    ChuTro: { label: 'Chủ trọ', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    NguoiThue: { label: 'Người thuê', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        return format(new Date(dateStr), 'HH:mm:ss dd/MM/yyyy', { locale: vi });
    } catch {
        return dateStr;
    }
};

const UserManagement = () => {
    const [activeTab, setActiveTab] = useState('ChuTro');
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({ hoTen: '', email: '', soDienThoai: '', vaiTro: 'ChuTro' });
    const [creating, setCreating] = useState(false);

    const fetchUsers = useCallback(async (q = '', page = 1, tab = 'ChuTro') => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/users', { 
                params: { 
                    search: q, 
                    vaiTro: tab,
                    page: page, 
                    pageSize: pageSize 
                } 
            });
            setUsers(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (e) {
            alert('Không thể tải danh sách tài khoản.');
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    useEffect(() => {
        fetchUsers(search, currentPage, activeTab);
    }, [fetchUsers, search, currentPage, activeTab]);

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchUsers(search, 1, activeTab);
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearch('');
        setCurrentPage(1);
    };

    const handleResetPassword = async (user) => {
        if (!window.confirm(`Đặt mật khẩu mặc định cho tài khoản "${user.hoTen}" (${user.email})?\nMật khẩu mới sẽ là: 12345678aA@`)) return;
        setActionLoading(user.id);
        try {
            await api.put(`/Admin/users/${user.id}/reset-password`);
            alert('Đã đặt lại mật khẩu mặc định thành công.');
        } catch (e) {
            alert(e.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleToggleLock = async (user) => {
        const action = user.trangThaiTaiKhoan ? 'khóa' : 'mở khóa';
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản "${user.hoTen}" (${user.email})?`)) return;
        setActionLoading(user.id);
        try {
            await api.put(`/Admin/users/${user.id}/toggle-lock`);
            fetchUsers(search, currentPage, activeTab);
        } catch (e) {
            alert(e.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (user) => {
        if (user.vaiTro === 'Admin') {
            alert('Không thể xóa tài khoản Admin.');
            return;
        }
        if (!window.confirm(`Bạn có chắc muốn XÓA tài khoản "${user.hoTen}" (${user.email})?\nHành động này không thể hoàn tác.`)) return;
        setActionLoading(user.id);
        try {
            await api.delete(`/Admin/users/${user.id}`);
            fetchUsers(search, currentPage, activeTab);
            alert('Đã xóa tài khoản thành công.');
        } catch (e) {
            alert(e.response?.data?.message || 'Có lỗi xảy ra.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await api.post('/Admin/users', newUser);
            alert('Tạo tài khoản thành công!');
            setShowModal(false);
            setNewUser({ hoTen: '', email: '', soDienThoai: '', vaiTro: 'ChuTro' });
            if (activeTab === newUser.vaiTro || (activeTab === 'QuanTriVien' && newUser.vaiTro === 'Moderator')) {
                fetchUsers(search, 1, activeTab);
            }
        } catch (e) {
            alert(e.response?.data?.message || 'Không thể tạo tài khoản.');
        } finally {
            setCreating(false);
        }
    };

    const roleInfo = (role) => ROLE_LABEL[role] || { label: role, color: '#6b7280', bg: 'rgba(107,114,128,0.12)' };

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 className="page-title">Quản lý tài khoản</h1>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <FaPlus /> Tạo tài khoản mới
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
                {['ChuTro', 'NguoiThue', 'QuanTriVien'].map(tab => (
                    <div 
                        key={tab} 
                        onClick={() => handleTabChange(tab)}
                        style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab === 'ChuTro' ? 'Chủ trọ' : tab === 'NguoiThue' ? 'Người thuê' : 'Quản trị viên'}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
                    background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                    borderRadius: '10px', padding: '0 16px',
                }}>
                    <FaSearch style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <input
                        type="text"
                        placeholder="Tìm theo họ tên, email, số điện thoại..."
                        value={search}
                        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
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

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Đang tải dữ liệu...</div>
            ) : users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>Không tìm thấy tài khoản nào.</div>
            ) : (
                <div className="form-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
                                    {['Họ tên', 'Email', 'Số điện thoại', 'Vai trò', 'Trạng thái', 'Ngày tạo'].map(h => (
                                        <th key={h} style={{
                                            padding: '14px 16px', textAlign: 'left', fontSize: '13px',
                                            fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap',
                                        }}>{h}</th>
                                    ))}
                                    {activeTab === 'ChuTro' && (
                                        <th style={{
                                            padding: '14px 16px', textAlign: 'left', fontSize: '13px',
                                            fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap',
                                        }}>Ngày hết hạn dịch vụ</th>
                                    )}
                                    <th style={{
                                        padding: '14px 16px', textAlign: 'left', fontSize: '13px',
                                        fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap',
                                    }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, idx) => {
                                    const ri = roleInfo(user.vaiTro);
                                    const isLocked = !user.trangThaiTaiKhoan;
                                    const isAdmin = user.vaiTro === 'Admin';
                                    const isProcessing = actionLoading === user.id;

                                    return (
                                        <tr key={user.id} style={{
                                            borderBottom: '1px solid var(--border-color)',
                                            background: idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-dark)',
                                            opacity: isProcessing ? 0.6 : 1,
                                            transition: 'background 0.2s',
                                        }}>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <div style={{
                                                        width: 36, height: 36, borderRadius: '50%',
                                                        background: ri.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: ri.color, fontSize: 16, flexShrink: 0,
                                                    }}>
                                                        {isAdmin ? <FaUserShield /> : <FaUser />}
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '14px' }}>
                                                        {user.hoTen}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '14px' }}>{user.email}</td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                                                {user.soDienThoai || '—'}
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '4px 10px', borderRadius: 6,
                                                    background: ri.bg, color: ri.color, fontSize: '12px', fontWeight: 700,
                                                }}>
                                                    {ri.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 5,
                                                    padding: '4px 10px', borderRadius: 6, fontSize: '12px', fontWeight: 700,
                                                    background: isLocked ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
                                                    color: isLocked ? '#ef4444' : '#10b981',
                                                }}>
                                                    {isLocked ? <FaLock size={10} /> : <FaLockOpen size={10} />}
                                                    {isLocked ? 'Bị khóa' : 'Hoạt động'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                {formatDate(user.ngayTao)}
                                            </td>
                                            {activeTab === 'ChuTro' && (
                                                <td style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                                                    {user.ngayHetHanDichVu ? formatDate(user.ngayHetHanDichVu) : '—'}
                                                </td>
                                            )}
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                    <button
                                                        onClick={() => handleResetPassword(user)}
                                                        disabled={isProcessing}
                                                        style={{
                                                            padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(99,102,241,0.3)',
                                                            background: 'rgba(99,102,241,0.1)', color: '#818cf8', cursor: 'pointer',
                                                            fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                                                        }}
                                                    >
                                                        <FaKey size={11} /> Đặt MK
                                                    </button>
                                                    {!isAdmin && (
                                                        <button
                                                            onClick={() => handleToggleLock(user)}
                                                            disabled={isProcessing}
                                                            style={{
                                                                padding: '6px 12px', borderRadius: 7, cursor: 'pointer',
                                                                fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5,
                                                                border: 'none',
                                                                background: isLocked ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                                                color: isLocked ? '#10b981' : '#f59e0b',
                                                            }}
                                                        >
                                                            {isLocked ? <><FaLockOpen size={11} /> Mở</> : <><FaLock size={11} /> Khóa</>}
                                                        </button>
                                                    )}
                                                    {!isAdmin && (
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            disabled={isProcessing}
                                                            style={{
                                                                padding: '6px 10px', borderRadius: 7, border: 'none',
                                                                background: 'rgba(239,68,68,0.12)', color: '#ef4444', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', gap: 5, fontSize: '12px', fontWeight: 600,
                                                            }}
                                                        >
                                                            <FaTrash size={11} /> Xóa
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {showModal && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div className="modal-content" style={{
                        background: 'var(--bg-card)', width: '100%', maxWidth: '450px',
                        borderRadius: '16px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div className="modal-header" style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px'
                        }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                                Tạo tài khoản mới
                            </h2>
                            <button onClick={() => setShowModal(false)} style={{
                                background: 'transparent', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '4px', borderRadius: '50%', transition: 'background 0.2s'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Vai trò</label>
                                    <select 
                                        value={newUser.vaiTro}
                                        onChange={e => setNewUser({...newUser, vaiTro: e.target.value})}
                                        required
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '8px',
                                            background: 'var(--bg-dark)', border: '1px solid var(--border-color)',
                                            color: 'var(--text-main)', outline: 'none', fontSize: '14px'
                                        }}
                                    >
                                        <option value="ChuTro">Chủ trọ</option>
                                        <option value="NguoiThue">Người thuê</option>
                                        <option value="Moderator">Moderator</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Họ tên</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nhập họ tên" 
                                        value={newUser.hoTen}
                                        onChange={e => setNewUser({...newUser, hoTen: e.target.value})}
                                        required 
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '8px',
                                            background: 'var(--bg-dark)', border: '1px solid var(--border-color)',
                                            color: 'var(--text-main)', outline: 'none', fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Email</label>
                                    <input 
                                        type="email" 
                                        placeholder="Nhập email hợp lệ" 
                                        value={newUser.email}
                                        onChange={e => setNewUser({...newUser, email: e.target.value})}
                                        required 
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '8px',
                                            background: 'var(--bg-dark)', border: '1px solid var(--border-color)',
                                            color: 'var(--text-main)', outline: 'none', fontSize: '14px'
                                        }}
                                    />
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Số điện thoại</label>
                                    <input 
                                        type="text" 
                                        placeholder="Nhập số điện thoại" 
                                        value={newUser.soDienThoai}
                                        onChange={e => setNewUser({...newUser, soDienThoai: e.target.value})}
                                        required 
                                        style={{
                                            width: '100%', padding: '10px 14px', borderRadius: '8px',
                                            background: 'var(--bg-dark)', border: '1px solid var(--border-color)',
                                            color: 'var(--text-main)', outline: 'none', fontSize: '14px'
                                        }}
                                    />
                                </div>
                                
                                <div style={{ fontSize: '13px', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '10px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FaKey />
                                    <span>Mật khẩu mặc định: <strong>12345678aA@</strong></span>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{
                                    padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)',
                                    background: 'transparent', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 600, fontSize: '14px'
                                }}>
                                    Hủy
                                </button>
                                <button type="submit" disabled={creating} style={{
                                    padding: '10px 20px', borderRadius: '8px', border: 'none',
                                    background: 'var(--primary)', color: 'white', cursor: creating ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '14px',
                                    opacity: creating ? 0.7 : 1
                                }}>
                                    {creating ? 'Đang xử lý...' : 'Xác nhận tạo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
