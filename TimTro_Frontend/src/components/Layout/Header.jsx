import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaUser, FaChevronDown, FaLock, FaBell, FaHeadset, FaCommentDots } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';
import { getAuthUser } from '../../utils/auth';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const Header = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotif, setShowNotif] = useState(false);
    const [showSupportDropdown, setShowSupportDropdown] = useState(false);
    const [showSupportQR, setShowSupportQR] = useState(false);
    const [supportInfo, setSupportInfo] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [authUser, setAuthUser] = useState(null);
    const dropdownRef = useRef(null);
    const notifRef = useRef(null);
    const supportRef = useRef(null);
    
    useEffect(() => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            setIsLoggedIn(true);
            setAuthUser(getAuthUser());
            fetchNotifications();
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
            if (supportRef.current && !supportRef.current.contains(event.target)) {
                setShowSupportDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/Notification');
            setNotifications(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/Notification/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, daDoc: true } : n));
        } catch (error) {
            console.error("Failed to mark as read");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        setIsLoggedIn(false);
        navigate('/login');
    };

    const handleSupportClick = async () => {
        if (!supportInfo) {
            try {
                const res = await api.get('/Admin/support-contact');
                setSupportInfo(res.data);
            } catch (error) {
                console.error("Failed to fetch support contact", error);
                alert("Không lấy được thông tin liên lạc của hỗ trợ viên.");
                return;
            }
        }
        setShowSupportDropdown(!showSupportDropdown);
        setShowDropdown(false);
        setShowNotif(false);
    };

    const getHeaderTitle = () => {
        if (!isLoggedIn || !authUser) return 'Khám phá phòng trọ';
        switch (authUser.role) {
            case 'Admin':
            case 'Moderator':
                return 'Quản trị hệ thống';
            case 'ChuTro':
                return 'Quản lý phòng cho thuê';
            default:
                return 'Khám phá phòng trọ';
        }
    };

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-title">{getHeaderTitle()}</div>
            </div>
            <div className="header-right">
                {isLoggedIn ? (
                    <>
                        {/* Support Icon */}
                        {(authUser?.role === 'ChuTro' || authUser?.role === 'NguoiThue') && (
                            <div className="notification-bell" ref={supportRef} onClick={handleSupportClick} title="Liên hệ Hỗ trợ">
                                <FaHeadset style={{fontSize: '19px', color: showSupportDropdown ? 'var(--primary)' : 'var(--text-main)'}} />
                                
                                {showSupportDropdown && supportInfo && (
                                    <div className="notif-dropdown" onClick={e => e.stopPropagation()} style={{ padding: '20px', width: '320px', top: '100%', right: '0' }}>
                                        <h3 style={{marginTop: 0, marginBottom: '20px', textAlign: 'center', color: 'var(--text-main)', fontSize: '18px'}}>Liên hệ Quản trị viên</h3>
                                        
                                        <div style={{display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px'}}>
                                            <div style={{width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 'bold'}}>
                                                {supportInfo.hoTen.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 'bold', fontSize: '16px', color: 'var(--text-main)'}}>{supportInfo.hoTen}</div>
                                                <div style={{color: 'var(--text-muted)', fontSize: '14px'}}>Hỗ trợ viên</div>
                                            </div>
                                        </div>

                                        <div style={{marginBottom: '10px', fontSize: '14px', color: 'var(--text-main)'}}>
                                            <strong>Email:</strong> <a href={`mailto:${supportInfo.email}`} style={{color: 'var(--primary)', textDecoration: 'none'}}>{supportInfo.email}</a>
                                        </div>
                                        <div style={{marginBottom: '20px', fontSize: '14px', color: 'var(--text-main)'}}>
                                            <strong>SĐT:</strong> {supportInfo.soDienThoai}
                                        </div>

                                        <button className="btn-primary" 
                                           style={{display: 'flex', justifyContent: 'center', width: '100%', textDecoration: 'none', backgroundColor: '#0068ff', border: 'none', color: 'white'}}
                                           onClick={() => { setShowSupportDropdown(false); setShowSupportQR(true); }}>
                                            Chat Zalo Ngay
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Notification Bell */}
                        <div className="notification-bell" ref={notifRef} onClick={() => { setShowNotif(!showNotif); setShowDropdown(false); setShowSupportDropdown(false); }}>
                            <FaBell style={{fontSize: '19px', color: showNotif ? 'var(--primary)' : 'var(--text-main)'}} />
                            {notifications.filter(n => !n.daDoc).length > 0 && (
                                <span className="notif-badge">{notifications.filter(n => !n.daDoc).length}</span>
                            )}

                            {showNotif && (
                                <div className="notif-dropdown" onClick={e => e.stopPropagation()}>
                                    {/* Header */}
                                    <div className="notif-header">
                                        <span>🔔 Thông báo</span>
                                        {notifications.filter(n => !n.daDoc).length > 0 && (
                                            <span style={{
                                                fontSize: '11px', fontWeight: '600', padding: '3px 10px',
                                                borderRadius: '999px', backgroundColor: 'rgba(79,70,229,0.2)',
                                                color: 'var(--primary)'
                                            }}>
                                                {notifications.filter(n => !n.daDoc).length} chưa đọc
                                            </span>
                                        )}
                                    </div>

                                    {/* List */}
                                    <div className="notif-list">
                                        {notifications.length === 0 ? (
                                            <div className="notif-empty">
                                                <div style={{fontSize: '36px', marginBottom: '10px', opacity: 0.3}}>🔕</div>
                                                <div>Không có thông báo nào</div>
                                            </div>
                                        ) : (
                                            notifications.map(n => {
                                                const isApproved = n.noiDung?.toLowerCase().includes('duyệt') || n.noiDung?.toLowerCase().includes('kiểm duyệt');
                                                const isRejected = n.noiDung?.toLowerCase().includes('từ chối') || n.noiDung?.toLowerCase().includes('bị từ');
                                                const iconClass = isRejected ? 'warning' : isApproved ? 'success' : '';
                                                const icon = isRejected ? '✕' : isApproved ? '✓' : '🔔';
                                                return (
                                                    <div
                                                        key={n.id}
                                                        className={`notif-item ${!n.daDoc ? 'unread' : ''}`}
                                                        onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }}
                                                    >
                                                        <div className={`notif-icon ${iconClass}`}>{icon}</div>
                                                        <div className="notif-body">
                                                            <div className="notif-content">{n.noiDung}</div>
                                                            <div className="notif-time">
                                                                🕐 {format(new Date(n.ngayTao), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}
                                                            </div>
                                                        </div>
                                                        {!n.daDoc && <div className="notif-unread-dot" />}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>


                        <div className="user-profile" ref={dropdownRef} onClick={() => { setShowDropdown(!showDropdown); setShowNotif(false); setShowSupportDropdown(false); }}>
                            {/* Avatar hiển thị chữ cái tên */}
                            <div className="avatar" style={{fontSize: '16px', fontWeight: 'bold'}}>
                                {authUser?.email ? authUser.email.charAt(0).toUpperCase() : <FaUser />}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                                <div style={{fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                    {authUser?.email || 'Tài khoản'}
                                </div>
                                <div style={{
                                    fontSize: '11px', fontWeight: '700', padding: '1px 7px', borderRadius: '999px',
                                    backgroundColor: authUser?.role === 'Admin' ? '#ef4444' :
                                                     authUser?.role === 'Moderator' ? '#f59e0b' :
                                                     authUser?.role === 'ChuTro' ? '#3b82f6' : '#10b981',
                                    color: 'white', letterSpacing: '0.5px'
                                }}>
                                    {authUser?.role === 'Admin' ? 'Admin' :
                                     authUser?.role === 'Moderator' ? 'Moderator' :
                                     authUser?.role === 'ChuTro' ? 'Chủ trọ' : 'Người thuê'}
                                </div>
                            </div>
                            <FaChevronDown style={{fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px'}} />
                            
                            {showDropdown && (
                                <div className="profile-dropdown" onClick={e => e.stopPropagation()}>
                                    {/* Thông tin tài khoản ở đầu dropdown */}
                                    <div style={{
                                        padding: '16px', borderBottom: '1px solid var(--border-color)',
                                        display: 'flex', alignItems: 'center', gap: '12px'
                                    }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0,
                                            backgroundColor: authUser?.role === 'Admin' ? '#ef4444' :
                                                             authUser?.role === 'Moderator' ? '#f59e0b' :
                                                             authUser?.role === 'ChuTro' ? '#3b82f6' : '#10b981',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'white', fontWeight: 'bold', fontSize: '18px'
                                        }}>
                                            {authUser?.email ? authUser.email.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div style={{minWidth: 0}}>
                                            <div style={{fontWeight: '600', fontSize: '14px', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                                                {authUser?.email}
                                            </div>
                                            <div style={{
                                                display: 'inline-block', marginTop: '4px',
                                                fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '999px',
                                                backgroundColor: authUser?.role === 'Admin' ? '#ef444420' :
                                                                 authUser?.role === 'Moderator' ? '#f59e0b20' :
                                                                 authUser?.role === 'ChuTro' ? '#3b82f620' : '#10b98120',
                                                color: authUser?.role === 'Admin' ? '#ef4444' :
                                                       authUser?.role === 'Moderator' ? '#f59e0b' :
                                                       authUser?.role === 'ChuTro' ? '#3b82f6' : '#10b981',
                                                border: `1px solid currentColor`
                                            }}>
                                                {authUser?.role === 'Admin' ? 'Quản trị viên' :
                                                 authUser?.role === 'Moderator' ? 'Kiểm duyệt viên' :
                                                 authUser?.role === 'ChuTro' ? 'Chủ trọ' : 'Người thuê trọ'}
                                            </div>
                                        </div>
                                    </div>
                                    <Link to="/update-profile" className="dropdown-item">
                                        <FaUser /> Cập nhật tài khoản
                                    </Link>
                                    <Link to="/change-password" className="dropdown-item">
                                        <FaLock /> Đổi mật khẩu
                                    </Link>
                                    <div className="dropdown-item" onClick={handleLogout} style={{ borderTop: '1px solid var(--border-color)', color: '#ef4444' }}>
                                        <FaSignOutAlt /> Đăng xuất
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div style={{display: 'flex', gap: '10px'}}>
                        <Link to="/login" style={{color: 'var(--text-main)'}}>Đăng nhập</Link>
                        <Link to="/register" style={{color: 'var(--primary)', fontWeight: '600'}}>Đăng ký</Link>
                    </div>
                )}
            </div>

            {/* Modal Liên hệ Hỗ trợ (QR Zalo) */}
            {showSupportQR && supportInfo && (
                <div className="modal-overlay" onClick={() => setShowSupportQR(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '350px' }}>
                        <h2 style={{ color: '#0068ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <FaCommentDots /> Chat Zalo Hỗ trợ
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                            Quét mã QR bằng điện thoại để mở cuộc trò chuyện với <strong>{supportInfo.hoTen}</strong> (Hỗ trợ viên).
                        </p>

                        <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                            <QRCodeSVG value={`https://zalo.me/${supportInfo.soDienThoai}`} size={200} level="H" />
                        </div>

                        <div style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            Hoặc bấm vào link: <br />
                            <a href={`https://zalo.me/${supportInfo.soDienThoai}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0068ff', fontWeight: 'bold', textDecoration: 'none' }}>zalo.me/{supportInfo.soDienThoai}</a>
                        </div>
                        
                        <div className="modal-actions" style={{ marginTop: '24px', justifyContent: 'center' }}>
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowSupportQR(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
