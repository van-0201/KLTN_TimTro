import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FaSearch, FaMapMarkerAlt, FaRulerCombined, FaTag, FaCheckCircle, FaStar, FaEye } from 'react-icons/fa';
import '../../styles/home.css';

const Home = () => {
    const [featuredPosts, setFeaturedPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                // Fetch first page, using the correct endpoint
                const res = await api.get('/RoomPost?page=1&pageSize=6');
                // Temporarily sort by view counts on frontend just in case
                const sorted = res.data.items.sort((a, b) => (b.luotXem || 0) - (a.luotXem || 0));
                setFeaturedPosts(sorted);
            } catch (err) {
                console.error('Error fetching featured posts', err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="home-container">
            {/* HERO SECTION */}
            <div className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1 className="hero-title">Tìm phòng trọ lý tưởng của bạn</h1>
                    <p className="hero-subtitle">Hàng ngàn phòng trọ, nhà nguyên căn, ở ghép đang chờ bạn khám phá</p>
                    <Link to="/room-posts" className="btn-primary hero-btn">
                        <FaSearch style={{ marginRight: '8px' }} /> Khám phá ngay
                    </Link>
                </div>
            </div>

            {/* FEATURED POSTS */}
            <div className="featured-section">
                <div className="section-header">
                    <h2 className="section-title">Phòng trọ nổi bật</h2>
                    <p className="section-subtitle">Những căn phòng được nhiều người quan tâm nhất</p>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</div>
                ) : (
                    <div className="room-grid">
                        {featuredPosts.map(post => (
                            <div key={post.id} className="room-card">
                                <Link to={`/room-posts/${post.id}`}>
                                    <img 
                                        src={post.images && post.images.length > 0 ? post.images[0] : 'https://via.placeholder.com/400x300?text=No+Image'} 
                                        alt={post.tieuDe} 
                                        className="room-image" 
                                    />
                                </Link>
                                <div className="room-info">
                                    <div className="room-price">{formatCurrency(post.giaThue)}/tháng</div>
                                    <Link to={`/room-posts/${post.id}`} style={{ textDecoration: 'none' }}>
                                        <div className="room-title">{post.tieuDe}</div>
                                    </Link>
                                    <div className="room-meta">
                                        <span><FaRulerCombined /> {post.dienTich} m²</span>
                                        <span><FaTag /> {post.loaiBaiDang === 'ChoThuePhong' ? 'Phòng trọ' : (post.loaiBaiDang === 'NhaNguyenCan' ? 'Nhà nguyên căn' : 'Ở ghép')}</span>
                                        <span><FaEye /> {post.luotXem || 0} lượt xem</span>
                                    </div>
                                    <div className="room-address" style={{ marginBottom: '16px' }}>
                                        <FaMapMarkerAlt style={{ marginTop: '3px', flexShrink: 0 }} />
                                        <span>{post.diaChiChiTiet}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                <div style={{ textAlign: 'center', marginTop: '40px' }}>
                    <Link to="/room-posts" className="btn-secondary" style={{ display: 'inline-flex', padding: '12px 32px' }}>
                        Xem tất cả phòng trọ
                    </Link>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <div className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Tính năng nổi bật của Phongtro.vn</h2>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><FaMapMarkerAlt /></div>
                        <h3>Tìm kiếm trên bản đồ</h3>
                        <p>Tích hợp bản đồ trực quan giúp bạn dễ dàng khoanh vùng và tìm kiếm phòng trọ xung quanh vị trí hiện tại của mình.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><FaStar /></div>
                        <h3>Đặt lịch xem phòng trực tuyến</h3>
                        <p>Tiết kiệm tối đa thời gian với tính năng đặt lịch xem phòng trực tiếp với chủ nhà ngay trên hệ thống.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><FaCheckCircle /></div>
                        <h3>Tìm bạn ở ghép thông minh</h3>
                        <p>Chức năng tìm người ở ghép với hồ sơ chi tiết, hỗ trợ gửi yêu cầu và ghép nối dễ dàng dành riêng cho người thuê.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
