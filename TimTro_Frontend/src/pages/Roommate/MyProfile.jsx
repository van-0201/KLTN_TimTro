import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../../services/api';
import '../../styles/roommate.css';
import '../../styles/roompost.css';

// Fix Leaflet marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

// Click on map to set position
const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) { setPosition([e.latlng.lat, e.latlng.lng]); },
    });
    return position ? <Marker position={position} /> : null;
};

// Fly to position when changed (e.g., from address search)
const MapUpdater = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, map.getZoom());
    }, [position]);
    return null;
};

const defaultCriteria = {
    thoiGian: 'Truoc23h', sachSe: 'KyTinh', khach: 'Khong',
    tiengOn: 'YenTinh', bepNuc: 'NauNuong', dieuHoa: 'ThoaiMai',
    chiaSeDo: 'DocLap', thuocLa: 'Khong', thuCung: 'Khong', tinhCach: 'HuongNoi'
};

const MyProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [wasInactive, setWasInactive] = useState(false);
    const [position, setPosition] = useState(null); // [lat, lng]
    const [addressSearch, setAddressSearch] = useState('');
    const [searchingMap, setSearchingMap] = useState(false);

    const [formData, setFormData] = useState({
        gioiTinh: 'Nam',
        gioiTinhMongMuon: 'TatCa',
        nganSachToiThieu: '',
        nganSachToiDa: '',
        banKinhTimKiemToiDa: 3000,
        diaChiKhuVuc: '',
        tieuChi: { ...defaultCriteria }
    });

    useEffect(() => { fetchMyProfile(); }, []);

    const fetchMyProfile = async () => {
        try {
            const res = await api.get('/Roommate/profile');
            const data = res.data;
            if (data) {
                setWasInactive(!data.isActive);
                if (data.viDoMucTieu && data.kinhDoMucTieu)
                    setPosition([data.viDoMucTieu, data.kinhDoMucTieu]);

                let parsedCriteria = { ...defaultCriteria };
                if (data.tieuChiLoiSong) {
                    try { parsedCriteria = { ...defaultCriteria, ...JSON.parse(data.tieuChiLoiSong) }; }
                    catch (e) { }
                }
                setFormData({
                    gioiTinh: data.gioiTinh || 'Nam',
                    gioiTinhMongMuon: data.gioiTinhMongMuon || 'TatCa',
                    nganSachToiThieu: data.nganSachToiThieu || '',
                    nganSachToiDa: data.nganSachToiDa || '',
                    banKinhTimKiemToiDa: data.banKinhTimKiemToiDa || 3000,
                    diaChiKhuVuc: data.diaChiKhuVuc || '',
                    tieuChi: parsedCriteria
                });
            }
        } catch (error) { /* chưa có hồ sơ */ }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleCriteriaChange = (key, value) =>
        setFormData({ ...formData, tieuChi: { ...formData.tieuChi, [key]: value } });

    // Handle price formatting
    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setFormData({ ...formData, [e.target.name]: rawValue });
    };

    const formatPriceDisplay = (value) => {
        if (!value) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    // Nominatim geocoding (giống CreateRoomPost)
    const searchAddressOnMap = async () => {
        if (!formData.diaChiKhuVuc) return;
        setSearchingMap(true);
        try {
            const parts = formData.diaChiKhuVuc.split(',').map(p => p.trim());
            let found = false;
            for (let i = 0; i < parts.length; i++) {
                const query = parts.slice(i).join(', ');
                if (!query) continue;
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&email=dauhuyvan23122021@gmail.com`
                );
                const data = await res.json();
                if (data && data.length > 0) {
                    setPosition([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
                    found = true;
                    break;
                }
            }
            if (!found) alert('Không tìm thấy khu vực này. Vui lòng thử địa chỉ khác hoặc nhấp trực tiếp trên bản đồ.');
        } catch (err) {
            alert('Lỗi khi tìm địa chỉ. Vui lòng thử lại.');
        } finally {
            setSearchingMap(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (wasInactive) {
            const confirmed = window.confirm('Bạn đã từng xác nhận ghép nối thành công. Bạn có chắc chắn muốn mở lại hồ sơ để tìm người ở ghép mới không?');
            if (!confirmed) return;
        }
        if (!position) {
            alert('Vui lòng chọn Vị trí tâm tìm kiếm trên bản đồ.');
            return;
        }
        if (!formData.diaChiKhuVuc) {
            alert('Vui lòng nhập Địa chỉ khu vực tìm kiếm (VD: Cầu Giấy, Hà Nội).');
            return;
        }
        setLoading(true);
        const payload = {
            gioiTinh: formData.gioiTinh,
            gioiTinhMongMuon: formData.gioiTinhMongMuon,
            nganSachToiThieu: formData.nganSachToiThieu ? parseFloat(formData.nganSachToiThieu) : null,
            nganSachToiDa: formData.nganSachToiDa ? parseFloat(formData.nganSachToiDa) : null,
            diaChiKhuVuc: formData.diaChiKhuVuc,
            viDoMucTieu: position[0],
            kinhDoMucTieu: position[1],
            banKinhTimKiemToiDa: parseInt(formData.banKinhTimKiemToiDa),
            tieuChiLoiSong: JSON.stringify(formData.tieuChi)
        };
        try {
            await api.post('/Roommate/profile', payload);
            setWasInactive(false);
            alert('Cập nhật hồ sơ thành công!');
            navigate('/roommates');
        } catch (error) {
            alert('Có lỗi xảy ra khi lưu.');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async () => {
        const actionText = wasInactive ? 'MỞ LẠI' : 'TẠM ẨN';
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionText} hồ sơ không?`)) return;
        try {
            await api.put('/Roommate/profile/toggle-active');
            setWasInactive(!wasInactive);
            alert(`Đã ${actionText.toLowerCase()} hồ sơ thành công!`);
        } catch (error) {
            alert('Chưa có hồ sơ để ẩn/mở hoặc có lỗi xảy ra.');
        }
    };

    const renderRadioGroup = (label, key, options) => (
        <div style={{ marginBottom: '16px' }}>
            <label className="form-label" style={{ fontWeight: '600', display: 'block', marginBottom: '8px' }}>{label}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '4px' }}>
                {options.map(opt => (
                    <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px' }}>
                        <input
                            type="radio"
                            name={`tieuChi_${key}`}
                            value={opt.value}
                            checked={formData.tieuChi[key] === opt.value}
                            onChange={() => handleCriteriaChange(key, opt.value)}
                        />
                        {opt.label}
                    </label>
                ))}
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Hồ sơ tìm người ở ghép</h1>
            </div>

            <form onSubmit={handleSubmit}>
                {/* Layout 2 cột giống CreateRoomPost */}
                <div className="create-post-layout">

                    {/* ===== CỘT TRÁI: Thông tin cá nhân + Tiêu chí ===== */}
                    <div className="layout-left">

                        <div className="form-card" style={{ marginBottom: '20px' }}>
                            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--primary)' }}>
                                1. Thông tin cơ bản
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div className="form-group">
                                    <label className="form-label">Giới tính của bạn</label>
                                    <select className="form-control" name="gioiTinh" value={formData.gioiTinh} onChange={handleChange}>
                                        <option value="Nam">Nam</option>
                                        <option value="Nu">Nữ</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Muốn ghép với giới tính</label>
                                    <select className="form-control" name="gioiTinhMongMuon" value={formData.gioiTinhMongMuon} onChange={handleChange}>
                                        <option value="TatCa">Tất cả (Không quan trọng)</option>
                                        <option value="Nam">Nam</option>
                                        <option value="Nu">Nữ</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ngân sách tối thiểu (VNĐ/tháng)</label>
                                    <input type="text" className="form-control" name="nganSachToiThieu"
                                        value={formatPriceDisplay(formData.nganSachToiThieu)} onChange={handlePriceChange} placeholder="VD: 1.000.000" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Ngân sách tối đa (VNĐ/tháng)</label>
                                    <input type="text" className="form-control" name="nganSachToiDa"
                                        value={formatPriceDisplay(formData.nganSachToiDa)} onChange={handlePriceChange} placeholder="VD: 3.000.000" />
                                </div>
                            </div>
                        </div>

                        <div className="form-card">
                            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--primary)' }}>
                                3. Tiêu chí &amp; Lối sống
                            </h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div>
                                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Thói quen sinh hoạt</h4>
                                    {renderRadioGroup('Giờ giấc nghỉ ngơi', 'thoiGian', [
                                        { value: 'Truoc23h', label: 'Ngủ sớm (Trước 23h)' },
                                        { value: 'CuDem', label: 'Cú đêm (Sau 24h)' },
                                        { value: 'LinhHoat', label: 'Giờ giấc linh hoạt' }
                                    ])}
                                    {renderRadioGroup('Không gian sống', 'sachSe', [
                                        { value: 'KyTinh', label: 'Kỹ tính, dọn dẹp mỗi ngày' },
                                        { value: 'CoBan', label: 'Gọn gàng cơ bản' },
                                        { value: 'ThoaiMai', label: 'Thoải mái, đôi chút bừa bộn' }
                                    ])}
                                    {renderRadioGroup('Tiếp đón bạn bè', 'khach', [
                                        { value: 'Khong', label: 'Thích sự riêng tư (Không dẫn khách)' },
                                        { value: 'BaoTruoc', label: 'Thỉnh thoảng (Báo trước)' },
                                        { value: 'ThuongXuyen', label: 'Thường xuyên' },
                                        { value: 'CoiMo', label: 'Cởi mở (Bạn khác giới có thể qua đêm)' }
                                    ])}
                                    {renderRadioGroup('Không gian âm thanh', 'tiengOn', [
                                        { value: 'YenTinh', label: 'Yên tĩnh tuyệt đối' },
                                        { value: 'ThoaiMai', label: 'Thoải mái tiếng ồn vừa phải' }
                                    ])}
                                    {renderRadioGroup('Chuyện bếp núc', 'bepNuc', [
                                        { value: 'NauNuong', label: 'Đam mê nấu nướng' },
                                        { value: 'ThinhThoang', label: 'Thỉnh thoảng vào bếp' },
                                        { value: 'AnNgoai', label: 'Ưu tiên ăn ngoài' }
                                    ])}
                                </div>
                                <div>
                                    <h4 style={{ color: 'var(--text-muted)', marginBottom: '12px', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Đặc điểm cá nhân</h4>
                                    {renderRadioGroup('Khói thuốc', 'thuocLa', [
                                        { value: 'CoHut', label: 'Có sử dụng' },
                                        { value: 'ChapNhan', label: 'Không dùng nhưng chấp nhận' },
                                        { value: 'Khong', label: 'Tuyệt đối không khói thuốc' }
                                    ])}
                                    {renderRadioGroup('Thú cưng', 'thuCung', [
                                        { value: 'DangNuoi', label: 'Đang nuôi' },
                                        { value: 'YeuDongVat', label: 'Không nuôi nhưng yêu động vật' },
                                        { value: 'Khong', label: 'Tránh tiếp xúc' }
                                    ])}
                                    {renderRadioGroup('Tính cách', 'tinhCach', [
                                        { value: 'HuongNoi', label: 'Hướng nội (Thích không gian riêng)' },
                                        { value: 'HuongNgoai', label: 'Hướng ngoại (Thích trò chuyện)' }
                                    ])}
                                    {renderRadioGroup('Sử dụng điều hòa', 'dieuHoa', [
                                        { value: 'ThoaiMai', label: 'Đề cao sự thoải mái (Bật 24/7)' },
                                        { value: 'LucNgu', label: 'Tiết kiệm (Chỉ bật lúc ngủ)' },
                                        { value: 'HanChe', label: 'Rất hạn chế bật' }
                                    ])}
                                    {renderRadioGroup('Chia sẻ đồ dùng', 'chiaSeDo', [
                                        { value: 'DocLap', label: 'Độc lập hoàn toàn' },
                                        { value: 'ChiaSe', label: 'Sẵn sàng chia sẻ đồ dùng chung' }
                                    ])}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== CỘT PHẢI: Khu vực tìm kiếm (map) ===== */}
                    <div className="layout-right">
                        <div className="form-card" style={{ position: 'sticky', top: '20px' }}>
                            <h3 style={{ marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', color: 'var(--primary)' }}>
                                2. Khu vực tìm kiếm
                            </h3>

                            <div className="form-group">
                                <label className="form-label">Bán kính tìm kiếm (mét)</label>
                                <input type="number" name="banKinhTimKiemToiDa" className="form-control"
                                    value={formData.banKinhTimKiemToiDa} onChange={handleChange} min="500" max="20000" />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Địa chỉ khu vực tìm kiếm <span style={{color: 'red'}}>*</span></label>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <input
                                        type="text"
                                        className="form-control"
                                        name="diaChiKhuVuc"
                                        placeholder="VD: Cầu Giấy, Hà Nội..."
                                        value={formData.diaChiKhuVuc}
                                        onChange={handleChange}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddressOnMap())}
                                        style={{ marginBottom: 0 }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={searchAddressOnMap}
                                        disabled={searchingMap}
                                        style={{ padding: '0 14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: '500', minWidth: '90px' }}
                                    >
                                        {searchingMap ? 'Đang tìm...' : 'Tìm kiếm'}
                                    </button>
                                </div>
                                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px', marginBottom: 0 }}>
                                    Hoặc nhấp trực tiếp trên bản đồ để ghim vị trí tâm.
                                </p>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    Vị trí tâm {position ? <span style={{ color: '#10b981', fontSize: '13px' }}>✓ Đã chọn ({position[0].toFixed(4)}, {position[1].toFixed(4)})</span> : <span style={{ color: '#ef4444', fontSize: '13px' }}>* Chưa chọn</span>}
                                </label>
                                <div style={{ height: '340px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                    <MapContainer
                                        center={position || [21.028511, 105.804817]}
                                        zoom={13}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <LocationMarker position={position} setPosition={setPosition} />
                                        {position && (
                                            <>
                                                <Circle
                                                    center={position}
                                                    radius={parseInt(formData.banKinhTimKiemToiDa) || 3000}
                                                    pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.15 }}
                                                />
                                                <MapUpdater position={position} />
                                            </>
                                        )}
                                    </MapContainer>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={loading}
                                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', marginTop: '8px' }}
                            >
                                {loading ? 'Đang lưu...' : '💾 Lưu hồ sơ'}
                            </button>

                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={handleToggleActive}
                                style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', marginTop: '12px', border: '1px solid var(--border-color)', color: wasInactive ? '#10b981' : '#ef4444' }}
                            >
                                {wasInactive ? '👁️ Mở lại hồ sơ' : '🙈 Tạm ẩn hồ sơ'}
                            </button>
                            
                            {wasInactive && (
                                <div style={{padding: '12px', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '6px', marginTop: '16px', border: '1px solid #fee2e2', fontSize: '14px'}}>
                                    ⚠️ Hồ sơ của bạn hiện đang <b>BỊ ẨN</b>. Người khác sẽ không thể tìm thấy bạn trong danh sách ghép phòng.
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </form>
        </div>
    );
};

export default MyProfile;
