import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEyeSlash, FaEye, FaMapMarkerAlt, FaRulerCombined, FaTag, FaPlus } from 'react-icons/fa';
import api from '../../services/api';
import Pagination from '../../components/Common/Pagination';

const MyRoomPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        const fetchMyPosts = async () => {
            try {
                const res = await api.get('/RoomPost/my-posts', {
                    params: { page: currentPage, pageSize }
                });
                setPosts(res.data.items || []);
                setTotalPages(res.data.totalPages || 1);
            } catch (error) {
                console.error('Error fetching my posts', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyPosts();
    }, [currentPage]);

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài đăng này?')) {
            try {
                await api.delete(`/RoomPost/${id}`);
                setPosts(posts.filter(p => p.id !== id));
            } catch (error) {
                alert(error.response?.data || error.response?.data?.message || 'Không thể xóa bài đăng. Vui lòng thử lại.');
            }
        }
    };

    const handleToggleHide = async (post) => {
        try {
            await api.put(`/RoomPost/toggle-hide/${post.id}`);
            setPosts(posts.map(p => p.id === post.id ? { ...p, isHidden: !post.isHidden } : p));
        } catch (error) {
            alert('Không thể thay đổi trạng thái ẩn hiện.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'DaDuyet': return <span style={{ backgroundColor: '#10b981', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Đã duyệt</span>;
            case 'ChoDuyet': return <span style={{ backgroundColor: '#f59e0b', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Chờ duyệt</span>;
            case 'TuChoi': return <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Từ chối</span>;
            case 'ViPham': return <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Vi phạm</span>;
            default: return null;
        }
    };

    const getRoomStatusBadge = (status) => {
        switch (status) {
            case 'ConTrong': return <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Còn trống</span>;
            case 'DaChoThue': return <span style={{ backgroundColor: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>Đã cho thuê</span>;
            default: return null;
        }
    };

    if (loading) return <div>Đang tải danh sách bài đăng...</div>;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Quản lý bài đăng của tôi</h1>
                <Link to="/create-post" className="btn-primary">
                    <FaPlus /> Thêm bài mới
                </Link>
            </div>
            <div className="room-grid">
                {posts.map(post => (
                    <div key={post.id} className={`room-card ${post.isHidden ? 'hidden-post' : ''}`} style={{ position: 'relative' }}>
                        {post.isHidden && (
                            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#6b7280', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', zIndex: 1 }}>Bị ẩn</div>
                        )}
                        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                            {getStatusBadge(post.trangThaiKiemDuyet)}
                            {getRoomStatusBadge(post.trangThaiPhong)}
                            <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaEye /> {post.luotXem || 0} lượt xem
                            </span>
                        </div>

                        <Link to={`/room-posts/${post.id}`} state={{ context: 'owner' }}>
                            <img
                                src={post.images && post.images.length > 0 ? post.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'}
                                alt={post.tieuDe}
                                className="room-image"
                            />
                        </Link>
                        <div className="room-info">
                            <div className="room-price">{formatCurrency(post.giaThue)}/tháng</div>
                            <Link to={`/room-posts/${post.id}`} state={{ context: 'owner' }} style={{ textDecoration: 'none' }}>
                                <div className="room-title">{post.tieuDe}</div>
                            </Link>

                            <div className="room-meta">
                                <span><FaRulerCombined /> {post.dienTich} m²</span>
                                <span><FaTag /> {post.loaiBaiDang === 'ChoThuePhong' ? 'Phòng trọ' : (post.loaiBaiDang === 'NhaNguyenCan' ? 'Nhà nguyên căn' : 'Ở ghép')}</span>
                            </div>

                            <div className="room-address" style={{ marginBottom: '16px' }}>
                                <FaMapMarkerAlt style={{ marginTop: '3px', flexShrink: 0 }} />
                                <span>{post.diaChiChiTiet}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                <Link to={`/edit-post/${post.id}`} style={{ flex: 1, padding: '8px', border: '1px solid var(--primary)', background: 'transparent', color: 'var(--primary)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', textDecoration: 'none' }}>
                                    <FaEdit /> Sửa
                                </Link>
                                <button onClick={() => handleToggleHide(post)} style={{ flex: 1, padding: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    {post.isHidden ? <><FaEye /> Hiện</> : <><FaEyeSlash /> Ẩn</>}
                                </button>
                                <button onClick={() => handleDelete(post.id)} style={{ flex: 1, padding: '8px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <FaTrash /> Xóa
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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

export default MyRoomPosts;
