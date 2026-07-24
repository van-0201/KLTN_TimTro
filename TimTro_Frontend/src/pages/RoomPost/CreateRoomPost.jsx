import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { getAuthUser } from '../../utils/auth';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../styles/roompost.css';

// Fix Leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

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
const MapUpdater = ({ position }) => {
    const map = useMap();
    map.flyTo([position.lat, position.lng], map.getZoom());
    return null;
};

const CreateRoomPost = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // Map position state (Default to Hanoi center)
    const [position, setPosition] = useState({ lat: 21.0285, lng: 105.8542 });
    const [searchingMap, setSearchingMap] = useState(false);

    // Amenities state
    const [selectedAmenities, setSelectedAmenities] = useState([]);
    const [customAmenities, setCustomAmenities] = useState([]);

    const authUser = getAuthUser();
    const role = authUser?.role;

    // NguoiThue chỉ được đăng tìm người ở ghép
    const defaultLoai = role === 'NguoiThue' ? 'TimNguoiOGhep' : 'ChoThuePhong';

    const checkRef = useRef(false);

    useEffect(() => {
        if (!checkRef.current && (role === 'NguoiThue' || role === 'ChuTro')) {
            checkRef.current = true;
            api.get('/RoomPost/check-eligibility').then(res => {
                if (res.data && !res.data.eligible) {
                    alert(res.data.reason);
                    navigate('/my-posts');
                }
            }).catch(err => {
                console.error("Lỗi khi kiểm tra điều kiện đăng bài:", err);
            });
        }
    }, [role, navigate]);

    const [formData, setFormData] = useState({
        tieuDe: '',
        moTaChiTiet: '',
        giaThue: '',
        dienTich: '',
        diaChiChiTiet: '',
        loaiBaiDang: defaultLoai
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setFormData({ ...formData, giaThue: rawValue });
    };

    const formatPriceDisplay = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImageFiles(files);
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const toggleAmenity = (amenity) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const addCustomAmenity = () => {
        setCustomAmenities([...customAmenities, '']);
    };

    const updateCustomAmenity = (index, value) => {
        const newCustom = [...customAmenities];
        newCustom[index] = value;
        setCustomAmenities(newCustom);
    };

    const removeCustomAmenity = (index) => {
        const newCustom = [...customAmenities];
        newCustom.splice(index, 1);
        setCustomAmenities(newCustom);
    };

    const searchAddressOnMap = async () => {
        if (!formData.diaChiChiTiet) return;
        setSearchingMap(true);
        try {
            // Tách địa chỉ theo dấu phẩy
            const addressParts = formData.diaChiChiTiet.split(',').map(p => p.trim());
            let found = false;

            // Thuật toán Tìm kiếm Lùi (Fallback Geocoding)
            for (let i = 0; i < addressParts.length; i++) {
                const query = addressParts.slice(i).join(', ');
                if (!query) continue;

                // Nominatim OpenStreetMap API
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&email=dauhuyvan23122021@gmail.com`);
                const data = await response.json();

                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);
                    setPosition({ lat, lng });
                    found = true;
                    break;
                }
            }

            if (!found) {
                alert("Không tìm thấy khu vực này trên bản đồ. Vui lòng di chuyển ghim thủ công.");
            }
        } catch (err) {
            console.error("Lỗi tìm kiếm địa chỉ:", err);
            alert("Có lỗi xảy ra khi tìm kiếm địa chỉ trên bản đồ.");
        } finally {
            setSearchingMap(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('tieuDe', formData.tieuDe);
            formDataToSend.append('moTaChiTiet', formData.moTaChiTiet);
            formDataToSend.append('giaThue', formData.giaThue);
            formDataToSend.append('dienTich', formData.dienTich);
            formDataToSend.append('diaChiChiTiet', formData.diaChiChiTiet);

            // NguoiThue luôn được gửi TimNguoiOGhep bất kể state
            const finalLoai = role === 'NguoiThue' ? 'TimNguoiOGhep' : formData.loaiBaiDang;
            formDataToSend.append('loaiBaiDang', finalLoai);

            // Append map coordinates
            formDataToSend.append('viDoThucTe', position.lat);
            formDataToSend.append('kinhDoThucTe', position.lng);

            // Combine and append amenities
            const validCustomAmenities = customAmenities.filter(a => a.trim() !== '');
            const combinedAmenities = [...selectedAmenities, ...validCustomAmenities];
            formDataToSend.append('tienIch', JSON.stringify(combinedAmenities));

            imageFiles.forEach((file) => {
                formDataToSend.append('Images', file);
            });

            await api.post('/RoomPost', formDataToSend, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('Dăng tin mới thành công! Bài viết của bạn đang chờ kiểm duyệt.');
            navigate('/my-posts');
        } catch (err) {
            console.error(err);
            setError(err.response?.data || 'Có lỗi xảy ra khi tạo bài đăng. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Đăng tin mới</h1>
            </div>

            <div className="form-card">
                {error && (
                    <div className="alert-error" style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: '1px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <strong style={{ display: 'block', marginBottom: '4px' }}>⚠️ Thất bại</strong>
                            {typeof error === 'string' ? error : 'Có lỗi xảy ra. Vui lòng thử lại.'}
                        </div>
                        {typeof error === 'string' && error.includes('hết hạn') && (
                            <Link to="/packages" className="btn-primary" style={{ backgroundColor: '#ef4444', textDecoration: 'none', flexShrink: 0, marginLeft: '16px' }}>
                                Gia hạn ngay
                            </Link>
                        )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="create-post-layout">
                        {/* ---------------- CỘT TRÁI ---------------- */}
                        <div className="layout-left">
                            <div className="form-group">
                                <label className="form-label">Tiêu đề bài đăng</label>
                                <input type="text" name="tieuDe" className="form-control" placeholder="Vd: Cho thuê phòng trọ khép kín trung tâm Cầu Giấy..." required value={formData.tieuDe} onChange={handleChange} />
                            </div>

                            <div className="form-row">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Giá thuê (VNĐ/tháng)</label>
                                    <input type="text" name="giaThue" className="form-control" placeholder="Vd: 3.500.000" required value={formatPriceDisplay(formData.giaThue)} onChange={handlePriceChange} />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Diện tích (m²)</label>
                                    <input type="number" name="dienTich" className="form-control" placeholder="Vd: 25" required value={formData.dienTich} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Loại bài đăng</label>
                                    {role === 'NguoiThue' ? (
                                        // NguoiThue: khóa cứng, chỉ được đăng tìm người ở ghép
                                        <>
                                            <select name="loaiBaiDang" className="form-control" value="TimNguoiOGhep" disabled>
                                                <option value="TimNguoiOGhep">Tìm người ở ghép</option>
                                            </select>
                                            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
                                                Người thuê trọ chỉ được đăng bài tìm người ở ghép.
                                            </p>
                                        </>
                                    ) : (
                                        // ChuTro / Admin / Mod: được chọn tất cả trừ Tìm người ở ghép
                                        <select name="loaiBaiDang" className="form-control" value={formData.loaiBaiDang} onChange={handleChange}>
                                            <option value="ChoThuePhong">Cho thuê phòng trọ</option>
                                            <option value="NhaNguyenCan">Cho thuê nhà nguyên căn</option>
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Mô tả chi tiết</label>
                                <textarea name="moTaChiTiet" className="form-control" rows="8" placeholder="Mô tả về phòng trọ, điện nước, tiện ích xung quanh..." required value={formData.moTaChiTiet} onChange={handleChange}></textarea>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Hình ảnh phòng (Chọn nhiều)</label>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="form-control" style={{ padding: '9px' }} />

                                {imagePreviews.length > 0 && (
                                    <div className="image-preview-container">
                                        {imagePreviews.map((src, idx) => (
                                            <img key={idx} src={src} alt="preview" className="image-preview" />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ---------------- CỘT PHẢI ---------------- */}
                        <div className="layout-right">
                            {/* Khối Thông tin Vị trí & Bản đồ */}
                            <div className="form-group" style={{ backgroundColor: 'var(--bg-dark)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '20px' }}>
                                <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Thông tin Vị trí & Bản đồ</h4>

                                <div className="form-group">
                                    <label className="form-label">Địa chỉ chi tiết</label>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input type="text" name="diaChiChiTiet" className="form-control" placeholder="Số nhà, Ngõ, Đường, Phường, Quận..." required value={formData.diaChiChiTiet} onChange={handleChange} style={{ marginBottom: 0 }} />
                                        <button type="button" onClick={searchAddressOnMap} disabled={searchingMap} style={{ padding: '0 16px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500' }}>
                                            {searchingMap ? 'Đang tìm...' : 'Tìm trên bản đồ'}
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic', lineHeight: '1.4' }}>
                                        * Tự động tìm kiếm lùi về tên Đường/Phường nếu địa chỉ quá chi tiết. Tọa độ của ghim xanh trên bản đồ bên dưới mới là vị trí thực tế sẽ được lưu lại.
                                    </p>
                                </div>

                                <label className="form-label" style={{ marginTop: '20px' }}>Ghim vị trí trên bản đồ</label>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                    Kéo thả bản đồ và nhấp chuột để điều chỉnh chính xác vị trí nhà của bạn. Tọa độ hiện tại: {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                                </p>
                                <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                    <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                        <TileLayer
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        />
                                        <Marker position={position} />
                                        <MapClickHandler setPosition={setPosition} />
                                        <MapUpdater position={position} />
                                    </MapContainer>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Tiện ích đi kèm */}
                    <div className="form-group" style={{ backgroundColor: 'var(--bg-dark)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '30px' }}>
                        <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>Tiện ích đi kèm</h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '15px' }}>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-main)' }}>Được quan tâm nhất:</strong>
                                {AMENITY_GROUPS.group1.map(amenity => (
                                    <label key={amenity} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} style={{ marginRight: '8px', accentColor: '#3b82f6' }} />
                                        {amenity}
                                    </label>
                                ))}
                            </div>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-main)' }}>An ninh & Thoải mái:</strong>
                                {AMENITY_GROUPS.group2.map(amenity => (
                                    <label key={amenity} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} style={{ marginRight: '8px', accentColor: '#3b82f6' }} />
                                        {amenity}
                                    </label>
                                ))}
                            </div>
                            <div>
                                <strong style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-main)' }}>Nội thất & Dịch vụ:</strong>
                                {AMENITY_GROUPS.group3.map(amenity => (
                                    <label key={amenity} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                        <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} style={{ marginRight: '8px', accentColor: '#3b82f6' }} />
                                        {amenity}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Tiện ích tự nhập */}
                        <div style={{ maxWidth: '800px', marginTop: '20px' }}>
                            {customAmenities.map((val, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nhập tên tiện ích..."
                                        value={val}
                                        onChange={(e) => updateCustomAmenity(idx, e.target.value)}
                                        style={{ flex: 1, marginBottom: 0 }}
                                    />
                                    <button type="button" onClick={() => removeCustomAmenity(idx)} style={{ marginLeft: '10px', padding: '10px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                        X
                                    </button>
                                </div>
                            ))}

                            <button type="button" onClick={addCustomAmenity} style={{ padding: '8px 16px', backgroundColor: 'transparent', color: '#3b82f6', border: '1px dashed #3b82f6', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '500', width: 'fit-content' }}>
                                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>+</span> Thêm tiện ích tự chọn
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', fontWeight: '600' }}>
                            {loading ? 'Đang xử lý (Upload ảnh)...' : 'Hoàn tất đăng tin'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoomPost;
