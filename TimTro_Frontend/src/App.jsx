import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import './styles/layout.css';
import { getAuthUser, isLoggedIn } from './utils/auth';

// Pages
import RoomPostList from './pages/RoomPost/RoomPostList';
import RoomPostDetail from './pages/RoomPost/RoomPostDetail';
import MyRoomPosts from './pages/RoomPost/MyRoomPosts';
import CreateRoomPost from './pages/RoomPost/CreateRoomPost';
import EditRoomPost from './pages/RoomPost/EditRoomPost';
import RoommateList from './pages/Roommate/RoommateList';
import RoommateDetail from './pages/Roommate/RoommateDetail';
import MatchRequests from './pages/Roommate/MatchRequests';
import MyProfile from './pages/Roommate/MyProfile';
import AppointmentList from './pages/Appointment/AppointmentList';

// Auth Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ChangePassword from './pages/Auth/ChangePassword';
import UpdateProfile from './pages/Auth/UpdateProfile';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import ApprovalDashboard from './pages/Admin/ApprovalDashboard';
import ReportList from './pages/Admin/ReportList';
import TransactionApproval from './pages/Admin/TransactionApproval';
import UserManagement from './pages/Admin/UserManagement';
import Packages from './pages/Transaction/Packages';
import TransactionHistory from './pages/Transaction/TransactionHistory';

/**
 * PrivateRoute: Chỉ cần đăng nhập, không phân biệt Role.
 */
const PrivateRoute = ({ children }) => {
    return isLoggedIn() ? children : <Navigate to="/login" replace />;
};

/**
 * RoleRoute: Đăng nhập VÀ phải đúng role mới vào được.
 * Nếu chưa đăng nhập → redirect về /login
 * Nếu đã đăng nhập nhưng sai role → redirect về trang chủ /
 */
const RoleRoute = ({ children, allowedRoles }) => {
    if (!isLoggedIn()) return <Navigate to="/login" replace />;
    const user = getAuthUser();
    if (!allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Auth Routes (không có Sidebar/Header) */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Main App Routes - có Layout đầy đủ */}
                <Route path="*" element={
                    <div className="layout-container">
                        <Sidebar />
                        <div className="main-content">
                            <Header />
                            <div className="content-area">
                                <Routes>
                                    {/* Public - Ai cũng xem được kể cả chưa đăng nhập */}
                                    <Route path="/" element={<RoomPostList />} />
                                    <Route path="/room-posts" element={<RoomPostList />} />
                                    <Route path="/room-posts/:id" element={<RoomPostDetail />} />

                                    {/* Chỉ cần đăng nhập */}
                                    <Route path="/my-posts" element={<PrivateRoute><MyRoomPosts /></PrivateRoute>} />
                                    <Route path="/my-profile" element={<PrivateRoute><MyProfile /></PrivateRoute>} />
                                    <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />
                                    <Route path="/update-profile" element={<PrivateRoute><UpdateProfile /></PrivateRoute>} />

                                    {/* Đăng bài / Sửa bài: ChuTro đăng phòng, NguoiThue đăng tìm ghép */}
                                    <Route path="/create-post" element={
                                        <RoleRoute allowedRoles={['ChuTro', 'NguoiThue', 'Admin', 'Moderator']}>
                                            <CreateRoomPost />
                                        </RoleRoute>
                                    } />
                                    <Route path="/edit-post/:id" element={
                                        <RoleRoute allowedRoles={['ChuTro', 'NguoiThue', 'Admin', 'Moderator']}>
                                            <EditRoomPost />
                                        </RoleRoute>
                                    } />

                                    {/* Lịch hẹn: ChuTro và NguoiThue */}
                                    <Route path="/appointments" element={
                                        <RoleRoute allowedRoles={['ChuTro', 'NguoiThue']}>
                                            <AppointmentList />
                                        </RoleRoute>
                                    } />

                                    {/* Tìm bạn ở ghép: CHỈ NguoiThue theo yêu cầu nghiệp vụ */}
                                    <Route path="/roommates" element={
                                        <RoleRoute allowedRoles={['NguoiThue']}>
                                            <RoommateList />
                                        </RoleRoute>
                                    } />
                                    <Route path="/roommate/:id" element={
                                        <RoleRoute allowedRoles={['NguoiThue']}>
                                            <RoommateDetail />
                                        </RoleRoute>
                                    } />
                                    <Route path="/match-requests" element={
                                        <RoleRoute allowedRoles={['NguoiThue']}>
                                            <MatchRequests />
                                        </RoleRoute>
                                    } />

                                    {/* Mua gói dịch vụ: Chỉ ChuTro */}
                                    <Route path="/packages" element={
                                        <RoleRoute allowedRoles={['ChuTro']}>
                                            <Packages />
                                        </RoleRoute>
                                    } />

                                    {/* Lịch sử giao dịch: ChuTro, Admin, Moderator */}
                                    <Route path="/transaction-history" element={
                                        <RoleRoute allowedRoles={['ChuTro', 'Admin', 'Moderator']}>
                                            <TransactionHistory />
                                        </RoleRoute>
                                    } />

                                    {/* === ADMIN / MODERATOR ROUTES === */}
                                    <Route path="/admin/dashboard" element={
                                        <RoleRoute allowedRoles={['Admin']}>
                                            <AdminDashboard />
                                        </RoleRoute>
                                    } />
                                    <Route path="/admin/approval" element={
                                        <RoleRoute allowedRoles={['Admin', 'Moderator']}>
                                            <ApprovalDashboard />
                                        </RoleRoute>
                                    } />
                                    <Route path="/admin/reports" element={
                                        <RoleRoute allowedRoles={['Admin', 'Moderator']}>
                                            <ReportList />
                                        </RoleRoute>
                                    } />
                                    <Route path="/admin/transactions" element={
                                        <RoleRoute allowedRoles={['Admin', 'Moderator']}>
                                            <TransactionApproval />
                                        </RoleRoute>
                                    } />
                                    <Route path="/admin/users" element={
                                        <RoleRoute allowedRoles={['Admin']}>
                                            <UserManagement />
                                        </RoleRoute>
                                    } />
                                </Routes>
                            </div>
                        </div>
                    </div>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;