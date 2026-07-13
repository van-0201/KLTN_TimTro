import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FaHome, FaList, FaSearch, FaPlus, FaUsers, FaCalendarAlt, FaShoppingCart, FaTachometerAlt, FaClipboardCheck, FaFlag, FaCreditCard, FaUserCog, FaHandshake, FaHistory } from 'react-icons/fa';
import { getAuthUser } from '../../utils/auth';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const user = getAuthUser();
  const role = user?.role;

  const isAdmin = role === 'Admin';
  const isModerator = role === 'Moderator';
  const isAdminOrMod = isAdmin || isModerator;
  const isChuTro = role === 'ChuTro';
  const isNguoiThue = role === 'NguoiThue';

  // Highlight logic khi xem chi tiết bài đăng
  const isHomeActive = currentPath === '/';
  const isRoomPostListActive = currentPath === '/room-posts';
  const isMyPostsActive = currentPath === '/my-posts';
  const isApprovalActive = currentPath === '/admin/approval' ||
    (currentPath.startsWith('/room-posts/') && isAdminOrMod);

  return (
    <div className="sidebar">
      <NavLink to="/" className="sidebar-logo">
        <FaHome /> <span>Phongtro.vn</span>
      </NavLink>

      <div className="sidebar-menu">

        {/* ===== MENU DÀNH CHO CHỦ TRỌ VÀ NGƯỜI THUÊ ===== */}
        {(isChuTro || isNguoiThue) && (
          <>
            <NavLink to="/" className={() => isHomeActive ? 'menu-item active' : 'menu-item'}>
              <FaHome /> Trang chủ
            </NavLink>

            <NavLink to="/room-posts" className={() => isRoomPostListActive ? 'menu-item active' : 'menu-item'}>
              <FaSearch /> Tìm phòng trọ
            </NavLink>

            <NavLink to="/my-posts" className={() => isMyPostsActive ? 'menu-item active' : 'menu-item'}>
              <FaList /> Bài đăng của tôi
            </NavLink>

            <NavLink to="/create-post" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
              <FaPlus /> Đăng tin mới
            </NavLink>

            {/* Tìm bạn ở ghép: CHỈ NguoiThue */}
            {isNguoiThue && (
              <>
                <NavLink to="/roommates" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                  <FaUsers /> Tìm bạn ở ghép
                </NavLink>
                <NavLink to="/match-requests" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                  <FaHandshake /> Yêu cầu ghép nối
                </NavLink>
              </>
            )}

            <NavLink to="/appointments" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
              <FaCalendarAlt /> Lịch hẹn của tôi
            </NavLink>

            {/* Mua gói dịch vụ: CHỈ ChuTro */}
            {isChuTro && (
              <>
                <NavLink
                  to="/packages"
                  className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
                >
                  <FaShoppingCart /> Mua gói dịch vụ
                </NavLink>
                <NavLink
                  to="/transaction-history"
                  className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}
                >
                  <FaHistory /> Lịch sử giao dịch
                </NavLink>
              </>
            )}
          </>
        )}

        {/* ===== MENU DÀNH CHO ADMIN / MODERATOR ===== */}
        {isAdminOrMod && (
          <>
            <div className="sidebar-section" style={{
              fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)',
              marginTop: '20px', marginBottom: '10px', textTransform: 'uppercase',
              paddingLeft: '16px', letterSpacing: '1px'
            }}>
              Quản trị viên
            </div>

            {/* Dashboard: CHỈ Admin */}
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                <FaTachometerAlt /> Tổng quan (Dashboard)
              </NavLink>
            )}

            {/* Kiểm duyệt, Báo cáo, Giao dịch: Admin + Moderator */}
            <NavLink to="/admin/approval" className={() => isApprovalActive ? 'menu-item active' : 'menu-item'}>
              <FaClipboardCheck /> Kiểm duyệt bài đăng
            </NavLink>

            <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
              <FaFlag /> Xử lý Báo cáo
            </NavLink>

            <NavLink to="/admin/transactions" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
              <FaCreditCard /> Duyệt mua gói dịch vụ
            </NavLink>

            <NavLink to="/transaction-history" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
              <FaHistory /> Lịch sử giao dịch
            </NavLink>

            {/* Quản lý tài khoản: CHỈ Admin */}
            {isAdmin && (
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'menu-item active' : 'menu-item'}>
                <FaUserCog /> Quản lý tài khoản
              </NavLink>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default Sidebar;
