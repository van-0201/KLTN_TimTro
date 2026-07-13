import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Pagination from '../../components/Common/Pagination';
import '../../styles/roompost.css';

const ApprovalDashboard = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 12;

    useEffect(() => {
        fetchPendingPosts(currentPage);
    }, [currentPage]);

    const fetchPendingPosts = async (page) => {
        setLoading(true);
        try {
            const res = await api.get('/Admin/pending-posts', {
                params: { page, pageSize }
            });
            setPosts(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, isApprove) => {
        if (!window.confirm(`Bạn có chắc chắn muốn ${isApprove ? 'duyệt' : 'từ chối'} bài đăng này?`)) return;
        try {
            const endpoint = isApprove ? `/Admin/approve-post/${id}` : `/Admin/reject-post/${id}`;
            await api.put(endpoint);
            fetchPendingPosts(currentPage); // reload
        } catch (error) {
            alert("Có lỗi xảy ra: " + (error.response?.data || error.message));
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Kiểm duyệt bài đăng (Admin/Moderator)</h1>
            </div>

            {loading ? (
                <div>Đang tải dữ liệu...</div>
            ) : posts.length === 0 ? (
                <div style={{color: 'var(--text-muted)'}}>Không có bài đăng nào đang chờ duyệt.</div>
            ) : (
                <div className="room-grid">
                    {posts.map(post => (
                        <div key={post.id} className="room-card" style={{border: '1px solid #f59e0b'}}>
                            <Link to={`/room-posts/${post.id}`} state={{ context: 'moderator' }}>
                                <img 
                                    src={post.images && post.images.length > 0 ? post.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
                                    alt={post.tieuDe} 
                                    className="room-image" 
                                />
                            </Link>
                            <div className="room-info">
                                <Link to={`/room-posts/${post.id}`} state={{ context: 'moderator' }} style={{textDecoration: 'none'}}>
                                    <div className="room-title">{post.tieuDe}</div>
                                </Link>
                                <div style={{color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px'}}>
                                    <strong>Người đăng:</strong> {post.nguoiDangTen} - {post.nguoiDangPhone}
                                </div>
                                <div style={{color: 'var(--text-muted)', fontSize: '13px', marginBottom: '12px'}}>
                                    <strong>Trạng thái:</strong> {post.trangThaiKiemDuyet}
                                </div>
                                
                                <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                                    <button className="btn-primary" style={{backgroundColor: '#10b981', flex: 1, justifyContent: 'center'}} onClick={() => handleAction(post.id, true)}>
                                        Duyệt
                                    </button>
                                    <button className="btn-primary" style={{backgroundColor: '#ef4444', flex: 1, justifyContent: 'center'}} onClick={() => handleAction(post.id, false)}>
                                        Từ chối
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
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

export default ApprovalDashboard;
