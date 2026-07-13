import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPlus, FaMapMarkerAlt, FaRulerCombined, FaTag, FaSearch, FaCheck, FaLocationArrow } from 'react-icons/fa';
import api from '../../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import Pagination from '../../components/Common/Pagination';
import 'leaflet/dist/leaflet.css';
import '../../styles/roompost.css';

import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom icon cho Tâm tìm kiếm (màu đỏ)
const userLocationIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" width="24" height="40">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 28 12 28S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#ef4444" stroke="#b91c1c" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [0, -40],
    className: ''
});

// Custom icon cho Phòng trọ kết quả (màu tím primary)
const roomPostIcon = L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 40" width="24" height="40">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 28 12 28S24 21 24 12C24 5.373 18.627 0 12 0z" fill="#4f46e5" stroke="#3730a3" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [24, 40],
    iconAnchor: [12, 40],
    popupAnchor: [0, -40],
    className: ''
});

const AMENITY_GROUPS = {
    group1: [
        'Vệ sinh riêng', 'Giờ giấc tự do', 'Có khu vực nấu ăn',
        'Chỗ để xe', 'Điều hòa', 'Nóng lạnh'
    ],
    group2: [
        'Camera an ninh', 'Không chung chủ'
    ],
    group3: [
        'Giường tủ', 'Wifi', 'Dịch vụ dọn vệ sinh',
        'Thiết bị vệ sinh', 'Gác', 'Ban công, tầng thượng', 'Thang máy'
    ]
};

// Component to handle map clicks and move marker
const MapClickHandler = ({ setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return null;
};

// Component to fly to new position when it changes
const FlyToLocation = ({ position }) => {
    const map = useMapEvents({});
    useEffect(() => {
        if (position) {
            map.flyTo([position.lat, position.lng], map.getZoom(), {
                animate: true,
                duration: 1.5
            });
        }
    }, [position, map]);
    return null;
};

const RoomPostList = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 12;

    // Filter states
    const [filters, setFilters] = useState({
        search: '',
        minPrice: '',
        maxPrice: '',
        minArea: '',
        maxArea: '',
        loaiPhong: ''
    });

    // Advanced Filter states
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [userLocation, setUserLocation] = useState(null);
    const [radius, setRadius] = useState('5'); // Default 5km
    const [locationError, setLocationError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts(currentPage);
        // eslint-disable-next-line
    }, [currentPage]);

    const fetchPosts = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('pageSize', pageSize);
            if (filters.search) params.append('search', filters.search);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.minArea) params.append('minArea', filters.minArea);
            if (filters.maxArea) params.append('maxArea', filters.maxArea);
            if (filters.loaiPhong) params.append('loaiPhong', filters.loaiPhong);

            if (selectedAmenities.length > 0) {
                selectedAmenities.forEach(a => params.append('amenities', a));
            }
            if (userLocation && radius) {
                params.append('userLat', userLocation.lat);
                params.append('userLng', userLocation.lng);
                params.append('radiusKm', radius);
            }

            const response = await api.get(`/RoomPost?${params.toString()}`);
            setPosts(response.data.items || []);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error("Lỗi khi tải danh sách bài đăng:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const toggleAmenity = (amenity) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const handleGetGPSLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Trình duyệt không hỗ trợ vị trí.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocationError('');
            },
            (err) => setLocationError('Vui lòng cấp quyền vị trí.')
        );
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleBookAppointment = async (chuTroId, postId) => {
        navigate(`/room-posts/${postId}?scrollTo=appointment`);
    };

    // Prepare amenities for rendering
    const allAmenities = [...AMENITY_GROUPS.group1, ...AMENITY_GROUPS.group2, ...AMENITY_GROUPS.group3];

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Tìm phòng trọ</h1>
            </div>

            <div className="room-list-layout">
                {/* ---------------- SIDEBAR BỘ LỌC ---------------- */}
                <div className="filter-sidebar">
                    {/* Basic Filters */}
                    <div className="filter-section">
                        <div className="filter-section-title">Tìm kiếm</div>
                        <input
                            type="text" name="search" placeholder="Từ khóa, địa chỉ..."
                            className="form-control" style={{ marginBottom: '12px' }}
                            value={filters.search} onChange={handleFilterChange}
                        />
                        <select name="loaiPhong" className="form-control" value={filters.loaiPhong} onChange={handleFilterChange}>
                            <option value="">Tất cả loại phòng</option>
                            <option value="ChoThuePhong">Phòng trọ</option>
                            <option value="NhaNguyenCan">Nguyên căn</option>
                            <option value="TimNguoiOGhep">Tìm người ở ghép</option>
                        </select>
                    </div>

                    <div className="filter-section">
                        <div className="filter-section-title">Mức giá (VNĐ)</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number" name="minPrice" placeholder="Từ..."
                                className="form-control"
                                value={filters.minPrice} onChange={handleFilterChange}
                            />
                            <input
                                type="number" name="maxPrice" placeholder="Đến..."
                                className="form-control"
                                value={filters.maxPrice} onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    <div className="filter-section">
                        <div className="filter-section-title">Diện tích (m2)</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number" name="minArea" placeholder="Từ..."
                                className="form-control"
                                value={filters.minArea} onChange={handleFilterChange}
                            />
                            <input
                                type="number" name="maxArea" placeholder="Đến..."
                                className="form-control"
                                value={filters.maxArea} onChange={handleFilterChange}
                            />
                        </div>
                    </div>

                    {/* Amenities Filters */}
                    <div className="filter-section">
                        <div className="filter-section-title">Tiện ích bắt buộc</div>
                        <div className="filter-checkbox-list">
                            {allAmenities.map(amenity => (
                                <label key={amenity} className="filter-checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={selectedAmenities.includes(amenity)}
                                        onChange={() => toggleAmenity(amenity)}
                                    />
                                    {amenity}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Location Filters */}
                    <div className="filter-section">
                        <div className="filter-section-title">Tìm quanh đây</div>
                        <button
                            className={`btn-outline ${userLocation ? 'active' : ''}`}
                            onClick={handleGetGPSLocation}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', width: '100%', justifyContent: 'center',
                                backgroundColor: userLocation ? 'rgba(79,70,229,0.1)' : '',
                                borderColor: userLocation ? 'var(--primary)' : ''
                            }}
                        >
                            <FaLocationArrow color={userLocation ? 'var(--primary)' : ''} />
                            {userLocation ? 'Lấy lại vị trí GPS' : 'Lấy vị trí của tôi'}
                        </button>

                        <div style={{ marginBottom: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                            Hoặc click vào bản đồ để thả ghim tùy ý:
                        </div>

                        <div style={{ height: '200px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginBottom: '12px', zIndex: 0 }}>
                            <MapContainer
                                center={userLocation ? [userLocation.lat, userLocation.lng] : [21.0285, 105.8542]}
                                zoom={12}
                                style={{ height: "100%", width: "100%", zIndex: 0 }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <MapClickHandler setPosition={(latlng) => setUserLocation({ lat: latlng.lat, lng: latlng.lng })} />
                                {userLocation && <FlyToLocation position={userLocation} />}
                                {userLocation && (
                                    <>
                                        <Marker icon={userLocationIcon} position={[userLocation.lat, userLocation.lng]}>
                                            <Popup><strong style={{ color: '#ef4444' }}>📍 Vị trí của bạn</strong></Popup>
                                        </Marker>
                                        {/* Vẽ bán kính */}
                                        {radius && (
                                            <Circle
                                                center={[userLocation.lat, userLocation.lng]}
                                                radius={parseFloat(radius) * 1000}
                                                pathOptions={{ color: 'var(--primary)', fillColor: 'var(--primary)', fillOpacity: 0.1 }}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Hiển thị các phòng trọ tìm được lên bản đồ */}
                                {posts.map(post => (
                                    post.viDoThucTe && post.kinhDoThucTe && (
                                        <Marker icon={roomPostIcon} key={`map-${post.id}`} position={[post.viDoThucTe, post.kinhDoThucTe]}>
                                            <Popup>
                                                <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '13px' }}>{post.tieuDe}</div>
                                                <div style={{ color: 'var(--primary)', fontWeight: '700', marginBottom: '4px' }}>{formatCurrency(post.giaThue)}</div>
                                                <Link to={`/room-posts/${post.id}`} style={{ fontSize: '12px', color: '#4f46e5' }}>Xem chi tiết</Link>
                                            </Popup>
                                        </Marker>
                                    )
                                ))}
                            </MapContainer>
                        </div>

                        {userLocation && (
                            <select
                                className="form-control"
                                value={radius}
                                onChange={(e) => setRadius(e.target.value)}
                                style={{ width: '100%' }}
                            >
                                <option value="1">Bán kính 1km</option>
                                <option value="2">Bán kính 2km</option>
                                <option value="3">Bán kính 3km</option>
                                <option value="5">Bán kính 5km</option>
                                <option value="10">Bán kính 10km</option>
                            </select>
                        )}
                        {locationError && <span style={{ color: '#ef4444', fontSize: '13px' }}>{locationError}</span>}
                    </div>

                    <button className="btn-search-apply" onClick={() => { setCurrentPage(1); fetchPosts(1); }}>
                        <FaSearch /> Áp dụng bộ lọc
                    </button>
                </div>

                {/* ---------------- CỘT MAIN (KẾT QUẢ) ---------------- */}
                <div className="post-grid-main">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px' }}>Đang tải dữ liệu...</div>
                    ) : posts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                            Chưa có bài đăng nào khớp với điều kiện tìm kiếm.
                        </div>
                    ) : (
                        <div className="room-grid">
                            {posts.map((post) => (
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
                                            <span><FaTag /> {post.loaiBaiDang === 'ChoThuePhong' ? 'Phòng trọ' : (post.loaiBaiDang === 'NhaNguyenCan' ? 'Nguyên căn' : 'Ở ghép')}</span>
                                        </div>

                                        <div className="room-address" style={{ marginBottom: '16px' }}>
                                            <FaMapMarkerAlt style={{ marginTop: '3px', flexShrink: 0 }} />
                                            <span>{post.diaChiChiTiet}</span>
                                        </div>

                                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleBookAppointment(post.chuTroId, post.id)}>
                                            Đặt lịch xem phòng
                                        </button>
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
            </div>
        </div>
    );
};

export default RoomPostList;
