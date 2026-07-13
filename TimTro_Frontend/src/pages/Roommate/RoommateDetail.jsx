import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../../services/api';
import '../../styles/roommate.css';
import '../../styles/roompost.css';
import { FaArrowLeft } from 'react-icons/fa';

const RoommateDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [myProfile, setMyProfile] = useState(null);
    const [matchStatus, setMatchStatus] = useState(null); // { status, isSender, requestId }
    const [sendingRequest, setSendingRequest] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [targetRes, myRes, statusRes] = await Promise.all([
                api.get(`/Roommate/profile/by-user/${id}`),
                api.get(`/Roommate/profile`).catch(() => ({ data: null })),
                api.get(`/Roommate/match-status/${id}`).catch(() => ({ data: null }))
            ]);
            setProfile(targetRes.data);
            setMyProfile(myRes.data);
            setMatchStatus(statusRes.data);
        } catch (error) {
            console.error(error);
            alert('Không thể tải hồ sơ hoặc hồ sơ đã bị ẩn.');
            navigate('/roommates');
        } finally {
            setLoading(false);
        }
    };

    const handleSendRequest = async () => {
        setSendingRequest(true);
        try {
            await api.post(`/Roommate/match/${profile.userId}`);
            // Cập nhật trạng thái ngay, không cần reload
            setMatchStatus({ status: 'Pending', isSender: true });
        } catch (error) {
            alert(error.response?.data || 'Có lỗi xảy ra');
        } finally {
            setSendingRequest(false);
        }
    };

    const parseCriteria = (jsonString) => {
        if (!jsonString) return {};
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            return { raw: jsonString };
        }
    };

    if (loading) return <div className="page-container">Đang tải...</div>;
    if (!profile) return null;
    const CRITERIA_MAP = {
        thoiGian: { Truoc23h: 'Ngủ sớm (<23h)', CuDem: 'Cú đêm (>24h)', LinhHoat: 'Giờ giấc linh hoạt' },
        sachSe: { KyTinh: 'Kỹ tính, dọn dẹp mỗi ngày', CoBan: 'Gọn gàng cơ bản', ThoaiMai: 'Thoải mái, đôi chút bừa bộn' },
        khach: { Khong: 'Không dẫn khách', BaoTruoc: 'Thỉnh thoảng (Báo trước)', ThuongXuyen: 'Thường xuyên dẫn khách', CoiMo: 'Cởi mở' },
        tiengOn: { YenTinh: 'Yên tĩnh tuyệt đối', ThoaiMai: 'Thoải mái tiếng ồn vừa phải' },
        bepNuc: { NauNuong: 'Đam mê nấu nướng', ThinhThoang: 'Thỉnh thoảng vào bếp', AnNgoai: 'Ưu tiên ăn ngoài' },
        dieuHoa: { ThoaiMai: 'Bật 24/7', LucNgu: 'Chỉ bật lúc ngủ', HanChe: 'Rất hạn chế bật' },
        chiaSeDo: { DocLap: 'Độc lập hoàn toàn', ChiaSe: 'Sẵn sàng chia sẻ đồ dùng chung' },
        thuocLa: { CoHut: 'Có sử dụng', ChapNhan: 'Không dùng nhưng chấp nhận', Khong: 'Tuyệt đối không khói thuốc' },
        thuCung: { DangNuoi: 'Đang nuôi', YeuDongVat: 'Không nuôi nhưng yêu động vật', Khong: 'Tránh tiếp xúc' },
        tinhCach: { HuongNoi: 'Hướng nội (Thích không gian riêng)', HuongNgoai: 'Hướng ngoại (Thích trò chuyện)' }
    };

    const criteria = parseCriteria(profile.tieuChiLoiSong);
    const myCriteria = myProfile ? parseCriteria(myProfile.tieuChiLoiSong) : {};

    const renderCriteriaItem = (label, key) => {
        const targetValEnum = criteria[key];
        const myValEnum = myCriteria[key];
        const isMatch = targetValEnum && myValEnum && targetValEnum === myValEnum;
        
        const targetValStr = CRITERIA_MAP[key]?.[targetValEnum] || targetValEnum;

        return (
            <div style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)'}}>
                <span style={{color: 'var(--text-muted)'}}>{label}</span>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <span style={{fontWeight: 500}}>{targetValStr || 'Không rõ'}</span>
                    {isMatch && <span style={{fontSize: '12px', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981'}}>Trùng khớp</span>}
                </div>
            </div>
        );
    };

    // Calculate map bounds if both profiles have locations
    const hasTargetLocation = profile.viDoMucTieu && profile.kinhDoMucTieu;
    const hasMyLocation = myProfile?.viDoMucTieu && myProfile?.kinhDoMucTieu;
    
    let center = [21.028511, 105.804817];
    if (hasTargetLocation) center = [profile.viDoMucTieu, profile.kinhDoMucTieu];

    return (
        <div className="page-container">
            <div className="page-header">
                <button className="btn-secondary" onClick={() => navigate(-1)} style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <FaArrowLeft /> Quay lại
                </button>
                <h1 className="page-title">Chi tiết hồ sơ</h1>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
                {/* Left column: Profile info */}
                <div className="form-card">
                    <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px'}}>
                        <div className="roommate-avatar" style={{width: '64px', height: '64px', fontSize: '28px'}}>
                            {profile.hoTen.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 style={{margin: '0 0 8px 0'}}>{profile.hoTen}</h2>
                            <div className="roommate-status status-need-room">
                                Đang tìm người cùng ghép phòng
                            </div>
                            {profile.matchPercentage > 0 && (
                                <div style={{marginTop: '8px', display: 'inline-block', fontSize: '14px', padding: '4px 12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold'}}>
                                    Hợp nhau {profile.matchPercentage}%
                                </div>
                            )}
                        </div>
                    </div>

                    <h3 style={{marginBottom: '16px', color: 'var(--primary)'}}>Thông tin cơ bản</h3>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px'}}>
                        <div>
                            <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Giới tính</div>
                            <div style={{fontWeight: 500}}>{profile.gioiTinh === 'Nam' ? 'Nam' : profile.gioiTinh === 'Nu' ? 'Nữ' : 'Chưa rõ'}</div>
                        </div>
                        <div>
                            <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Giới tính mong muốn ghép</div>
                            <div style={{fontWeight: 500}}>{profile.gioiTinhMongMuon === 'TatCa' ? 'Tất cả' : profile.gioiTinhMongMuon === 'Nam' ? 'Nam' : 'Nữ'}</div>
                        </div>
                        <div>
                            <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Ngân sách tối thiểu</div>
                            <div style={{fontWeight: 500}}>{profile.nganSachToiThieu ? profile.nganSachToiThieu.toLocaleString() + ' đ' : 'Không có'}</div>
                        </div>
                        <div>
                            <div style={{fontSize: '13px', color: 'var(--text-muted)'}}>Ngân sách tối đa</div>
                            <div style={{fontWeight: 500}}>{profile.nganSachToiDa ? profile.nganSachToiDa.toLocaleString() + ' đ' : 'Không có'}</div>
                        </div>
                    </div>

                    <h3 style={{marginBottom: '16px', color: 'var(--primary)'}}>Tiêu chí lối sống</h3>
                    {criteria.raw ? (
                        <p>{criteria.raw}</p>
                    ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                            {renderCriteriaItem('Giờ giấc nghỉ ngơi', 'thoiGian')}
                            {renderCriteriaItem('Gọn gàng sạch sẽ', 'sachSe')}
                            {renderCriteriaItem('Tiếp đón khách', 'khach')}
                            {renderCriteriaItem('Không gian âm thanh', 'tiengOn')}
                            {renderCriteriaItem('Chuyện bếp núc', 'bepNuc')}
                            {renderCriteriaItem('Sử dụng điều hòa', 'dieuHoa')}
                            {renderCriteriaItem('Chia sẻ đồ dùng', 'chiaSeDo')}
                            {renderCriteriaItem('Khói thuốc', 'thuocLa')}
                            {renderCriteriaItem('Thú cưng', 'thuCung')}
                            {renderCriteriaItem('Tính cách', 'tinhCach')}
                        </div>
                    )}

                    <div style={{marginTop: '32px'}}>
                        {(() => {
                            const status = matchStatus?.status; // 'Confirmed', 'Pending', 'Rejected', 'NotSent'
                            const isSender = matchStatus?.isSender;

                            // 1. Đã được xác nhận (Đã đồng ý) -> Ẩn nút, hiện thông báo thành công
                            if (status === 'Confirmed') return (
                                <div style={{
                                    padding: '14px', borderRadius: '8px', textAlign: 'center',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.4)',
                                    color: '#10b981', fontWeight: '600', fontSize: '16px'
                                }}>
                                    ✅ Hai bạn đã ghép nối thành công!
                                </div>
                            );

                            // 2. Đã gửi yêu cầu (Đang chờ) -> Ẩn nút, hiện thông báo chờ
                            if (status === 'Pending') return (
                                <button
                                    className="btn-primary"
                                    disabled
                                    style={{
                                        width: '100%', justifyContent: 'center',
                                        padding: '12px', fontSize: '16px',
                                        opacity: 0.6, cursor: 'not-allowed',
                                        backgroundColor: isSender ? 'var(--bg-card)' : '#f59e0b',
                                        border: '1px solid var(--border-color)',
                                        color: isSender ? 'var(--text-muted)' : 'white'
                                    }}
                                >
                                    {isSender ? '⏳ Đang chờ xác nhận' : '🔔 Đối phương đang chờ bạn xác nhận'}
                                </button>
                            );

                            // 3. Chưa gửi hoặc đã bị từ chối -> Hiện nút cho phép gửi/gửi lại
                            return (
                                <button
                                    className="btn-primary"
                                    style={{
                                        width: '100%', justifyContent: 'center',
                                        padding: '12px', fontSize: '16px',
                                        opacity: sendingRequest ? 0.7 : 1
                                    }}
                                    onClick={handleSendRequest}
                                    disabled={sendingRequest}
                                >
                                    {sendingRequest ? 'Đang gửi...' : (status === 'Rejected' ? '🔄 Gửi lại yêu cầu' : 'Gửi yêu cầu ghép nối')}
                                </button>
                            );
                        })()}
                    </div>
                </div>

                {/* Right column: Map */}
                <div className="form-card" style={{display: 'flex', flexDirection: 'column'}}>
                    <h3 style={{marginBottom: '16px', color: 'var(--primary)'}}>Khu vực giao thoa tìm kiếm</h3>
                    
                    {profile.diaChiKhuVuc && (
                        <div style={{marginBottom: '16px', padding: '12px', backgroundColor: 'var(--bg-dark)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <span style={{fontSize: '20px'}}>📍</span>
                            <div>
                                <div style={{fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Khu vực mục tiêu của {profile.hoTen}</div>
                                <div style={{fontWeight: '600', color: 'var(--text-main)'}}>{profile.diaChiKhuVuc}</div>
                            </div>
                        </div>
                    )}

                    <p style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px'}}>
                        Biểu đồ hiển thị khu vực bạn (Màu xanh) và {profile.hoTen} (Màu đỏ) đang muốn tìm kiếm trọ. Vùng giao thoa là khu vực lý tưởng cho cả hai.
                    </p>
                    
                    <div style={{flex: 1, minHeight: '400px', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden'}}>
                        {(hasTargetLocation || hasMyLocation) ? (
                            <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                
                                {hasMyLocation && (
                                    <Circle 
                                        center={[myProfile.viDoMucTieu, myProfile.kinhDoMucTieu]} 
                                        radius={myProfile.banKinhTimKiemToiDa || 3000} 
                                        pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} 
                                    />
                                )}
                                
                                {hasTargetLocation && (
                                    <Circle 
                                        center={[profile.viDoMucTieu, profile.kinhDoMucTieu]} 
                                        radius={profile.banKinhTimKiemToiDa || 3000} 
                                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.2 }} 
                                    />
                                )}
                            </MapContainer>
                        ) : (
                            <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'}}>
                                Người dùng chưa thiết lập vị trí tìm kiếm.
                            </div>
                        )}
                    </div>
                    <div style={{display: 'flex', gap: '16px', marginTop: '12px', justifyContent: 'center', fontSize: '14px'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div style={{width: '16px', height: '16px', backgroundColor: 'rgba(0, 0, 255, 0.2)', border: '2px solid blue', borderRadius: '50%'}}></div>
                            <span>Khu vực của bạn</span>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <div style={{width: '16px', height: '16px', backgroundColor: 'rgba(255, 0, 0, 0.2)', border: '2px solid red', borderRadius: '50%'}}></div>
                            <span>Khu vực của {profile.hoTen}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RoommateDetail;
