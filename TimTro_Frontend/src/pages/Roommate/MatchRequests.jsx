import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { FaCommentDots } from 'react-icons/fa';
import api from '../../services/api';
import Pagination from '../../components/Common/Pagination';
import { getAuthUser } from '../../utils/auth';
import '../../styles/roommate.css';
import '../../styles/roompost.css';


const MatchRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('received'); // 'received' or 'sent'
    const [viewingZaloQR, setViewingZaloQR] = useState(null); // { phone, name }
    
    const currentUser = getAuthUser();
    const currentUserId = currentUser?.id;

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage]);

    const fetchRequests = async (page = 1) => {
        setLoading(true);
        try {
            const res = await api.get('/Roommate/matches', {
                params: { page, pageSize: 10 }
            });
            setRequests(res.data.items || []);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        try {
            await api.put(`/Roommate/match/${requestId}`, `"${status}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            alert('Đã cập nhật trạng thái thành công!');
            fetchRequests(currentPage);
        } catch (error) {
            alert(error.response?.data || 'Có lỗi xảy ra');
        }
    };

    const filteredRequests = requests.filter(req => {
        if (activeTab === 'received') return req.nguoiNhanId === currentUserId;
        return req.nguoiGuiId === currentUserId;
    });

    const renderStatus = (status) => {
        switch (status) {
            case 'ChoXacNhan': return <span style={{color: '#f59e0b', fontWeight: 'bold'}}>Đang chờ</span>;
            case 'DaDongY':   return <span style={{color: '#10b981', fontWeight: 'bold'}}>Đã đồng ý</span>;
            case 'TuChoi':    return <span style={{color: '#ef4444', fontWeight: 'bold'}}>Đã từ chối</span>;
            case 'DaHuy':     return <span style={{color: 'var(--text-muted)', fontWeight: 'bold'}}>Đã hủy</span>;
            default:          return status;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Yêu cầu ghép nối</h1>
            </div>

            <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
                <button 
                    className={`btn-primary ${activeTab !== 'received' ? 'btn-secondary' : ''}`}
                    onClick={() => { setActiveTab('received'); setCurrentPage(1); }}
                    style={activeTab !== 'received' ? {backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)'} : {}}
                >
                    Nhận được
                </button>
                <button 
                    className={`btn-primary ${activeTab !== 'sent' ? 'btn-secondary' : ''}`}
                    onClick={() => { setActiveTab('sent'); setCurrentPage(1); }}
                    style={activeTab !== 'sent' ? {backgroundColor: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)'} : {}}
                >
                    Đã gửi
                </button>
            </div>

            {loading ? (
                <div>Đang tải...</div>
            ) : filteredRequests.length === 0 ? (
                <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-muted)'}}>
                    Không có yêu cầu nào.
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {filteredRequests.map(req => (
                        <div key={req.id} className="form-card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <div style={{flex: 1}}>
                                <div style={{fontSize: '16px', fontWeight: 600, marginBottom: '8px'}}>
                                    {activeTab === 'received' ? `Từ: ${req.nguoiGuiTen}` : `Gửi đến: ${req.nguoiNhanTen}`}
                                </div>
                                <div style={{fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px'}}>
                                    Trạng thái: {renderStatus(req.trangThai)}
                                </div>
                                
                                {/* Thông tin liên hệ khi đã đồng ý */}
                                {req.trangThai === 'DaDongY' && (
                                    <div style={{marginTop: '12px', padding: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '6px', border: '1px solid #10b981'}}>
                                        <div style={{fontWeight: 600, color: '#10b981', marginBottom: '4px'}}>Thông tin liên hệ:</div>
                                        <div style={{fontSize: '14px'}}>
                                            <strong>SĐT:</strong> {req.soDienThoaiDoiPhuong} | <strong>Email:</strong> {req.emailDoiPhuong || 'Chưa cập nhật'}
                                        </div>
                                    </div>
                                )}

                                {/* Giải thích khi bị hủy tự động */}
                                {req.trangThai === 'DaHuy' && (
                                    <div style={{marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic'}}>
                                        Yêu cầu này đã bị hủy do một trong hai bên đã tìm được bạn cùng ghép phòng hoặc đã cập nhật lại hồ sơ để tìm kiếm bạn cùng ghép phòng mới.
                                    </div>
                                )}
                            </div>
                            
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: '16px', alignItems: 'flex-end'}}>
                                {/* Nút Đồng ý / Từ chối */}
                                {activeTab === 'received' && req.trangThai === 'ChoXacNhan' && (
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <button className="btn-primary" style={{backgroundColor: '#10b981'}} onClick={() => handleUpdateStatus(req.id, 'DaDongY')}>Đồng ý</button>
                                        <button className="btn-primary" style={{backgroundColor: '#ef4444'}} onClick={() => handleUpdateStatus(req.id, 'TuChoi')}>Từ chối</button>
                                    </div>
                                )}

                                {/* Nút Chat Zalo — chỉ hiện khi DaDongY và có số điện thoại */}
                                {req.trangThai === 'DaDongY' && req.soDienThoaiDoiPhuong && (
                                    <button
                                        className="btn-primary"
                                        style={{backgroundColor: '#0068ff', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '14px'}}
                                        onClick={() => setViewingZaloQR({ phone: req.soDienThoaiDoiPhuong, name: req.tenDoiPhuong })}
                                    >
                                        <FaCommentDots /> Chat Zalo
                                    </button>
                                )}

                                {/* Nút Xem hồ sơ */}
                                {activeTab === 'received' && (
                                    <Link 
                                        to={`/roommate/${req.nguoiGuiId}`} 
                                        className="btn-primary" 
                                        style={{backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', textAlign: 'center'}}
                                    >
                                        Xem hồ sơ
                                    </Link>
                                )}
                                {activeTab === 'sent' && (
                                    <Link 
                                        to={`/roommate/${req.nguoiNhanId}`} 
                                        className="btn-primary" 
                                        style={{backgroundColor: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', textAlign: 'center'}}
                                    >
                                        Xem hồ sơ
                                    </Link>
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
                        <p style={{color: 'var(--text-muted)', marginBottom: '24px'}}>
                            Quét mã QR bằng điện thoại để mở cuộc trò chuyện với <strong>{viewingZaloQR.name}</strong>.
                        </p>
                        <div style={{background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.1)'}}>
                            <QRCodeSVG value={`https://zalo.me/${viewingZaloQR.phone}`} size={200} level="H" />
                        </div>
                        <div style={{marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px'}}>
                            Hoặc bấm vào link: <br/>
                            <a href={`https://zalo.me/${viewingZaloQR.phone}`} target="_blank" rel="noopener noreferrer" style={{color: '#0068ff', fontWeight: 'bold', textDecoration: 'none'}}>
                                zalo.me/{viewingZaloQR.phone}
                            </a>
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

export default MatchRequests;
