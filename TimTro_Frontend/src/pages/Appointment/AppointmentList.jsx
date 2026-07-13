import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaPhoneAlt, FaCommentDots } from 'react-icons/fa';
import Pagination from '../../components/Common/Pagination';
import { getAuthUser } from '../../utils/auth';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = getAuthUser();
    const userId = currentUser ? currentUser.id : null;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    const [editingApptId, setEditingApptId] = useState(null);
    const [newTime, setNewTime] = useState('');
    const [viewingZaloQR, setViewingZaloQR] = useState(null);

    const renderStatusText = (status) => {
        switch (status) {
            case 'ChoPhanHoi': return 'Chờ phản hồi';
            case 'DaXacNhan': return 'Đã xác nhận';
            case 'DaHuy': return 'Đã hủy';
            default: return status;
        }
    };

    useEffect(() => {
        fetchAppointments(currentPage);
    }, [currentPage]);

    const fetchAppointments = async (page = 1) => {
        try {
            const res = await api.get('/Appointment/my-appointments', {
                params: { page, pageSize }
            });
            setAppointments(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error("Lỗi tải lịch hẹn", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/Appointment/${id}/status`, `"${status}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            fetchAppointments(); // refresh
        } catch (error) {
            alert(error.response?.data || "Có lỗi xảy ra");
        }
    };

    const handleChangeTime = async (id) => {
        if (!newTime) {
            alert('Vui lòng chọn thời gian mới');
            return;
        }
        try {
            await api.put(`/Appointment/${id}/time`, `"${new Date(newTime).toISOString()}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Đã gửi yêu cầu đổi thời gian!');
            setEditingApptId(null);
            fetchAppointments();
        } catch (error) {
            alert(error.response?.data || "Có lỗi xảy ra khi đổi giờ");
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Quản lý lịch hẹn</h1>
            </div>

            {loading ? (
                <div>Đang tải danh sách lịch hẹn...</div>
            ) : appointments.length === 0 ? (
                <div style={{color: 'var(--text-muted)'}}>Bạn chưa có lịch hẹn nào.</div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {appointments.map(appt => (
                        <div key={appt.id} className="form-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div>
                                <h3 style={{marginBottom: '8px', color: 'var(--text-main)'}}>
                                    {appt.roomPostId ? (
                                        <Link to={`/room-posts/${appt.roomPostId}`} style={{color: 'var(--primary)', textDecoration: 'none'}}>
                                            {appt.loaiLichHen === 'XemPhongTro' ? 'Lịch Xem Phòng: ' : 'Lịch Gặp Mặt Ghép: '}
                                            {appt.roomPostTitle || 'Phòng trọ'}
                                        </Link>
                                    ) : (
                                        appt.loaiLichHen === 'XemPhongTro' ? 'Lịch Xem Phòng' : 'Lịch Gặp Mặt Ghép'
                                    )}
                                </h3>
                                <div style={{color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px'}}>
                                    <strong>Thời gian:</strong> {format(new Date(appt.thoiGianHen + (!appt.thoiGianHen.endsWith('Z') ? 'Z' : '')), 'dd/MM/yyyy HH:mm')}
                                </div>
                                <div style={{color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px'}}>
                                    <strong>Địa điểm:</strong> {appt.diaDiemHen}
                                </div>
                                <div style={{color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px'}}>
                                    <strong>Với:</strong> {appt.nguoiKhoiTaoTen} / {appt.nguoiNhanHenTen}
                                </div>
                                {appt.ghiChu && (
                                    <div style={{color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px', fontStyle: 'italic'}}>
                                        <strong>Ghi chú:</strong> {appt.ghiChu}
                                    </div>
                                )}
                                <div style={{color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px'}}>
                                    <strong>Trạng thái:</strong> 
                                    <span style={{
                                        marginLeft: '8px', 
                                        padding: '4px 8px', 
                                        borderRadius: '4px',
                                        backgroundColor: appt.trangThaiLichHen === 'DaXacNhan' ? '#10b98120' : appt.trangThaiLichHen === 'DaHuy' ? '#ef444420' : '#f59e0b20',
                                        color: appt.trangThaiLichHen === 'DaXacNhan' ? '#10b981' : appt.trangThaiLichHen === 'DaHuy' ? '#ef4444' : '#f59e0b'
                                    }}>
                                        {renderStatusText(appt.trangThaiLichHen)}
                                    </span>
                                </div>

                                {appt.trangThaiLichHen === 'DaXacNhan' && (
                                    <div style={{marginTop: '16px', padding: '12px', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                                        <div style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 'bold'}}>Thông tin liên hệ đối tác:</div>
                                        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                            <div style={{width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                                                {(appt.nguoiKhoiTaoId === userId ? appt.nguoiNhanHenTen : appt.nguoiKhoiTaoTen)?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <div style={{fontWeight: 'bold', color: 'var(--text-main)'}}>{appt.nguoiKhoiTaoId === userId ? appt.nguoiNhanHenTen : appt.nguoiKhoiTaoTen}</div>
                                                <div style={{color: 'var(--primary)', fontWeight: 'bold', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px'}}><FaPhoneAlt /> {appt.nguoiKhoiTaoId === userId ? appt.nguoiNhanHenPhone : appt.nguoiKhoiTaoPhone}</div>
                                            </div>
                                            <button 
                                                className="btn-primary" 
                                                style={{marginLeft: 'auto', backgroundColor: '#0068ff', padding: '8px 12px', fontSize: '13px'}}
                                                onClick={() => setViewingZaloQR({
                                                    phone: appt.nguoiKhoiTaoId === userId ? appt.nguoiNhanHenPhone : appt.nguoiKhoiTaoPhone,
                                                    name: appt.nguoiKhoiTaoId === userId ? appt.nguoiNhanHenTen : appt.nguoiKhoiTaoTen
                                                })}
                                            >
                                                <FaCommentDots style={{marginRight: '6px'}}/> Chat Zalo
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {editingApptId === appt.id && (
                                    <div style={{marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center'}}>
                                        <input type="datetime-local" className="form-control" style={{backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px'}} value={newTime} onChange={e => setNewTime(e.target.value)} />
                                        <button className="btn-primary" style={{justifyContent: 'center'}} onClick={() => handleChangeTime(appt.id)}>Lưu</button>
                                        <button className="btn-primary" style={{backgroundColor: '#6c757d', justifyContent: 'center'}} onClick={() => setEditingApptId(null)}>Hủy</button>
                                    </div>
                                )}
                            </div>

                            <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                                {appt.trangThaiLichHen === 'ChoPhanHoi' && editingApptId !== appt.id && (
                                    <>
                                        {appt.pendingRescheduleById !== userId && (
                                            <button className="btn-primary" style={{backgroundColor: '#10b981', justifyContent: 'center'}} onClick={() => handleUpdateStatus(appt.id, 'DaXacNhan')}>Xác nhận</button>
                                        )}
                                        <button className="btn-primary" style={{backgroundColor: '#ef4444', justifyContent: 'center'}} onClick={() => handleUpdateStatus(appt.id, 'DaHuy')}>Hủy</button>
                                    </>
                                )}
                                {appt.trangThaiLichHen === 'DaXacNhan' && editingApptId !== appt.id && (
                                     <button className="btn-primary" style={{backgroundColor: '#ef4444', justifyContent: 'center'}} onClick={() => handleUpdateStatus(appt.id, 'DaHuy')}>Hủy lịch</button>
                                )}
                                {appt.trangThaiLichHen === 'ChoPhanHoi' && editingApptId !== appt.id && (
                                    <button className="btn-primary" style={{backgroundColor: 'var(--primary)', justifyContent: 'center'}} onClick={() => setEditingApptId(appt.id)}>Đổi giờ</button>
                                )}
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

            {/* Zalo QR Modal */}
            {viewingZaloQR && (
                <div className="modal-overlay" onClick={() => setViewingZaloQR(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{textAlign: 'center', maxWidth: '350px'}}>
                        <h2 style={{color: '#0068ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
                            <FaCommentDots /> Chat Zalo
                        </h2>
                        <p style={{color: 'var(--text-muted)', marginBottom: '24px'}}>Quét mã QR bằng điện thoại để mở cuộc trò chuyện với <strong>{viewingZaloQR.name}</strong>.</p>
                        
                        <div style={{background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
                            <QRCodeSVG value={`https://zalo.me/${viewingZaloQR.phone}`} size={200} level="H" />
                        </div>
                        
                        <div style={{marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px'}}>
                            Hoặc bấm vào link: <br/>
                            <a href={`https://zalo.me/${viewingZaloQR.phone}`} target="_blank" rel="noopener noreferrer" style={{color: '#0068ff', fontWeight: 'bold', textDecoration: 'none'}}>zalo.me/{viewingZaloQR.phone}</a>
                        </div>
                        
                        <div className="modal-actions" style={{marginTop: '24px', justifyContent: 'center'}}>
                            <button className="btn-secondary" style={{width: '100%', justifyContent: 'center'}} onClick={() => setViewingZaloQR(null)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AppointmentList;
