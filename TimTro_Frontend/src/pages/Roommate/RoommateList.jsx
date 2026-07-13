import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Pagination from '../../components/Common/Pagination';
import '../../styles/roommate.css';

const RoommateList = () => {
    const [profiles, setProfiles] = useState([]);
    const [myProfile, setMyProfile] = useState(undefined); // undefined = chưa load, null = chưa có hồ sơ
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 12;
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfiles(currentPage);
    }, [currentPage]);

    const fetchProfiles = async (page = 1) => {
        setLoading(true);
        try {
            const [listRes, myRes] = await Promise.all([
                api.get(`/Roommate/profiles`, { params: { page, pageSize } }),
                api.get(`/Roommate/profile`).catch(() => ({ data: null }))
            ]);
            setProfiles(listRes.data.items || []);
            setTotalPages(listRes.data.totalPages || 1);
            setMyProfile(myRes.data); // null nếu chưa có hồ sơ
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const CRITERIA_MAP = {
        thoiGian: { Truoc23h: 'Ngủ sớm', CuDem: 'Cú đêm', LinhHoat: 'Linh hoạt' },
        sachSe: { KyTinh: 'Kỹ tính', CoBan: 'Gọn gàng', ThoaiMai: 'Thoải mái' },
        khach: { Khong: 'Không khách', BaoTruoc: 'Khách báo trước', ThuongXuyen: 'Hay có khách', CoiMo: 'Cởi mở' },
        tiengOn: { YenTinh: 'Yên tĩnh', ThoaiMai: 'Thoải mái' },
        bepNuc: { NauNuong: 'Thích nấu ăn', ThinhThoang: 'Ít nấu', AnNgoai: 'Hay ăn ngoài' },
        dieuHoa: { ThoaiMai: 'Điều hòa 24/7', LucNgu: 'Chỉ lúc ngủ', HanChe: 'Hạn chế bật' },
        chiaSeDo: { DocLap: 'Đồ dùng độc lập', ChiaSe: 'Sẵn sàng chia sẻ' },
        thuocLa: { CoHut: 'Có hút thuốc', ChapNhan: 'Chấp nhận khói thuốc', Khong: 'Không khói thuốc' },
        thuCung: { DangNuoi: 'Có nuôi pet', YeuDongVat: 'Yêu động vật', Khong: 'Không pet' },
        tinhCach: { HuongNoi: 'Hướng nội', HuongNgoai: 'Hướng ngoại' }
    };

    const parseCriteriaForCard = (jsonString) => {
        if (!jsonString) return '';
        try {
            const obj = JSON.parse(jsonString);
            const mappedVals = Object.keys(obj).map(key => {
                return CRITERIA_MAP[key]?.[obj[key]] || obj[key];
            }).filter(Boolean);
            return mappedVals.slice(0, 3).join(' · ') + (mappedVals.length > 3 ? '...' : '');
        } catch (e) {
            return '';
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Tìm bạn ở ghép</h1>
                <Link to="/my-profile" className="btn-primary">Hồ sơ của tôi</Link>
            </div>

            {loading ? (
                <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>Đang tải danh sách...</div>
            ) : profiles.length === 0 ? (
                (() => {
                    // Case A: Chưa có hồ sơ
                    if (!myProfile) return (
                        <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)'}}>
                            <div style={{fontSize: '48px', marginBottom: '16px'}}>📋</div>
                            <div style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)'}}>Bạn chưa có hồ sơ tìm bạn ở ghép</div>
                            <div style={{fontSize: '14px', marginBottom: '20px'}}>Hãy tạo hồ sơ để hệ thống gợi ý người phù hợp với bạn.</div>
                            <Link to="/my-profile" className="btn-primary">Tạo hồ sơ ngay</Link>
                        </div>
                    );
                    // Case B: Đã ghép nối thành công (isActive = false)
                    if (myProfile.isActive === false) return (
                        <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)'}}>
                            <div style={{fontSize: '48px', marginBottom: '16px'}}>🎉</div>
                            <div style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#10b981'}}>Bạn đã tìm được người cùng ghép phòng!</div>
                            <div style={{fontSize: '14px', marginBottom: '4px'}}>Hồ sơ của bạn hiện đang ẩn.</div>
                            <div style={{fontSize: '14px', marginBottom: '20px'}}>Nếu muốn tiếp tục tìm kiếm, vui lòng cập nhật lại hồ sơ để kích hoạt lại.</div>
                            <Link to="/my-profile" className="btn-primary">Cập nhật hồ sơ</Link>
                        </div>
                    );
                    // Case C: Có hồ sơ, isActive = true nhưng chưa ai khớp
                    return (
                        <div style={{textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)'}}>
                            <div style={{fontSize: '48px', marginBottom: '16px'}}>🔍</div>
                            <div style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)'}}>Chưa có hồ sơ phù hợp</div>
                            <div style={{fontSize: '14px', marginBottom: '20px'}}>Hãy cập nhật hồ sơ của bạn để hệ thống gợi ý người phù hợp.</div>
                            <Link to="/my-profile" className="btn-primary">Cập nhật hồ sơ</Link>
                        </div>
                    );
                })()
            ) : (
                <div className="roommate-grid">
                    {profiles.map(profile => (
                        <div 
                            key={profile.id} 
                            className="roommate-card" 
                            style={{cursor: 'pointer'}} 
                            onClick={() => navigate(`/roommate/${profile.userId}`)}
                        >
                            <div className="roommate-header">
                                <div className="roommate-avatar">
                                    {profile.hoTen.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="roommate-name" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        {profile.hoTen}
                                        {profile.matchPercentage > 0 && (
                                            <span style={{fontSize: '12px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 'bold'}}>
                                                Hợp {profile.matchPercentage}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="roommate-status status-need-room" style={{marginTop: '4px'}}>
                                        Đang tìm người cùng ghép phòng
                                    </div>
                                </div>
                            </div>
                            
                            {profile.nganSachToiThieu || profile.nganSachToiDa ? (
                                <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px'}}>
                                    💰 {profile.nganSachToiThieu ? profile.nganSachToiThieu.toLocaleString() + 'đ' : '?'} – {profile.nganSachToiDa ? profile.nganSachToiDa.toLocaleString() + 'đ' : '?'} / tháng
                                </div>
                            ) : null}

                            {profile.diaChiKhuVuc && (
                                <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '4px'}}>
                                    📍 <span>Khu vực: <strong>{profile.diaChiKhuVuc}</strong></span>
                                </div>
                            )}

                            {profile.gioiTinh && (
                                <div style={{fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '4px'}}>
                                    👤 <span>Giới tính: <strong>{profile.gioiTinh === 'Nam' ? 'Nam' : profile.gioiTinh === 'Nu' ? 'Nữ' : 'Khác'}</strong></span>
                                </div>
                            )}

                            <div className="roommate-details">
                                <strong>Tiêu chí: </strong>
                                <span style={{color: 'var(--text-muted)', fontSize: '13px'}}>{parseCriteriaForCard(profile.tieuChiLoiSong) || 'Chưa điền'}</span>
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

export default RoommateList;
