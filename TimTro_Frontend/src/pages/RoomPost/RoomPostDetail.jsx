import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaMapMarkerAlt, FaRulerCombined, FaTag, FaPhoneAlt, FaArrowLeft, FaCheckCircle, FaEdit, FaEye, FaEyeSlash, FaTrash, FaCheck, FaTimes, FaCommentDots } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { QRCodeSVG } from 'qrcode.react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import '../../styles/roompost.css';
import { getAuthUser, isChuTro, isAdminOrModerator, isLoggedIn } from '../../utils/auth';

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RoomPostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const location = useLocation();

    const [post, setPost] = useState(null);
    const appointmentRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);
    const [reportFiles, setReportFiles] = useState([]);
    const [reportFilePreviews, setReportFilePreviews] = useState([]);

    const [showZaloQR, setShowZaloQR] = useState(false);

    const [showAppointmentModal, setShowAppointmentModal] = useState(false);
    const [appointmentDate, setAppointmentDate] = useState('');
    const [appointmentTime, setAppointmentTime] = useState('');
    const [appointmentNote, setAppointmentNote] = useState('');
    const [bookingAppointment, setBookingAppointment] = useState(false);

    const handleBookAppointment = async () => {
        if (!isLoggedIn()) {
            if (window.confirm("Bạn cần đăng nhập để đặt lịch. Bạn có muốn chuyển đến trang đăng nhập không?")) {
                navigate('/login');
            }
            return;
        }
        if (!appointmentDate || !appointmentTime) return;
        setBookingAppointment(true);
        try {
            const dateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
            await api.post('/Appointment', {
                nguoiNhanHenId: post.chuTroId,
                roomPostId: post.id,
                loaiLichHen: 'XemPhongTro',
                thoiGianHen: dateTime.toISOString(),
                diaDiemHen: post.diaChiChiTiet,
                ghiChu: appointmentNote
            });
            alert('Đã gửi yêu cầu đặt lịch hẹn thành công!');
            setAppointmentDate('');
            setAppointmentTime('');
            setAppointmentNote('');
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi đặt lịch.');
        } finally {
            setBookingAppointment(false);
        }
    };

    const handleReportFileChange = (e) => {
        const files = Array.from(e.target.files);
        setReportFiles(files);
        const previews = files.map(file => {
            if (file.type.startsWith('video/')) return { type: 'video', url: URL.createObjectURL(file), name: file.name };
            return { type: 'image', url: URL.createObjectURL(file), name: file.name };
        });
        setReportFilePreviews(previews);
    };

    const handleReport = async () => {
        if (!reportReason.trim()) return;

        // Kiểm tra đăng nhập trước khi gửi
        const authUser = getAuthUser();
        if (!authUser) {
            alert('Vui lòng đăng nhập để báo cáo vi phạm.');
            setShowReportModal(false);
            return;
        }

        setSubmittingReport(true);
        try {
            const formData = new FormData();
            if (post.id) formData.append('BaiDangBiBaoCaoId', post.id);
            formData.append('LyDoPhanAnh', reportReason);
            reportFiles.forEach(file => formData.append('MinhChungFiles', file));

            await api.post('/Report', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setShowReportModal(false);
            setReportReason('');
            setReportFiles([]);
            setReportFilePreviews([]);
            alert('✅ Cảm ơn bạn đã báo cáo! Quản trị viên sẽ xem xét và xử lý trong thời gian sớm nhất.');
        } catch (error) {
            console.error(error);
            const msg = error?.response?.data?.message || 'Có lỗi xảy ra khi gửi báo cáo. Vui lòng thử lại.';
            alert(msg);
        } finally {
            setSubmittingReport(false);
        }
    };

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await api.get(`/RoomPost/${id}`);
                setPost(res.data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết bài đăng:", error);
            } finally {
                setLoading(false);

                // Logic tăng lượt xem thông minh
                const viewedPosts = JSON.parse(localStorage.getItem('viewedPosts') || '[]');
                if (!viewedPosts.includes(id)) {
                    api.post(`/RoomPost/${id}/view`).catch(err => console.error(err));
                    viewedPosts.push(id);
                    localStorage.setItem('viewedPosts', JSON.stringify(viewedPosts));
                }

                // Check if need to scroll
                const searchParams = new URLSearchParams(location.search);
                if (searchParams.get('scrollTo') === 'appointment') {
                    setTimeout(() => {
                        if (appointmentRef.current) {
                            appointmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 500); // slight delay for layout rendering
                }
            }
        };

        fetchPost();
    }, [id]);

    const handleEdit = () => {
        navigate(`/edit-post/${id}`);
    };

    const handleToggleHide = async () => {
        try {
            await api.put(`/RoomPost/toggle-hide/${id}`);
            alert(post.isHidden ? 'Đã hiện bài đăng thành công!' : 'Đã ẩn bài đăng thành công!');
            setPost({ ...post, isHidden: !post.isHidden });
        } catch (error) {
            alert('Có lỗi xảy ra khi cập nhật trạng thái.');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này không? Hành động này không thể hoàn tác.")) return;
        try {
            await api.delete(`/RoomPost/${id}`);
            alert('Xóa bài đăng thành công!');
            navigate('/my-posts');
        } catch (error) {
            alert(error.response?.data || error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài đăng.');
        }
    };

    const handleModerate = async (isApproved) => {
        if (!window.confirm(`Bạn có chắc chắn muốn ${isApproved ? 'Duyệt' : 'Từ chối'} bài đăng này?`)) return;
        try {
            if (isApproved) {
                await api.put(`/Admin/approve-post/${id}`);
            } else {
                await api.put(`/Admin/reject-post/${id}`);
            }
            alert(`Đã ${isApproved ? 'duyệt' : 'từ chối'} bài đăng thành công.`);
            navigate('/admin/approval');
        } catch (error) {
            alert('Có lỗi xảy ra trong quá trình duyệt bài.');
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (loading) return <div className="page-container">Đang tải dữ liệu...</div>;
    if (!post) return <div className="page-container">Không tìm thấy bài đăng.</div>;

    // Determine intrinsic context based on user identity
    const user = getAuthUser();
    let context = 'viewer';
    if (user) {
        if (user.role === 'Admin' || user.role === 'Moderator') {
            context = 'moderator';
        }
        if (user.id === post.chuTroId) {
            context = 'owner';
        }
    }

    const renderImageGallery = (images) => {
        if (!images || images.length === 0) {
            return (
                <div style={{ width: '100%', height: '450px', borderRadius: '16px', overflow: 'hidden' }}>
                    <img src="https://via.placeholder.com/1200x600?text=No+Image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="No image" />
                </div>
            );
        }

        if (images.length === 1) {
            return (
                <div style={{ width: '100%', height: '450px', borderRadius: '16px', overflow: 'hidden' }}>
                    <img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer', transition: 'transform 0.3s' }} alt="room" onClick={() => setSelectedImage(0)} className="gallery-img-hover" />
                </div>
            );
        }

        if (images.length === 2) {
            return (
                <div style={{ display: 'flex', gap: '8px', height: '450px', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                        <img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(0)} className="gallery-img-hover" />
                    </div>
                    <div style={{ flex: 1, height: '100%', overflow: 'hidden' }}>
                        <img src={images[1]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(1)} className="gallery-img-hover" />
                    </div>
                </div>
            );
        }

        if (images.length === 3) {
            return (
                <div style={{ display: 'flex', gap: '8px', height: '450px', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ flex: 2, height: '100%', overflow: 'hidden' }}>
                        <img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(0)} className="gallery-img-hover" />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}><img src={images[1]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(1)} className="gallery-img-hover" /></div>
                        <div style={{ flex: 1, overflow: 'hidden' }}><img src={images[2]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(2)} className="gallery-img-hover" /></div>
                    </div>
                </div>
            );
        }

        if (images.length === 4) {
            return (
                <div style={{ display: 'flex', gap: '8px', height: '450px', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ flex: 2, height: '100%', overflow: 'hidden' }}>
                        <img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(0)} className="gallery-img-hover" />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}><img src={images[1]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(1)} className="gallery-img-hover" /></div>
                        <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                            <div style={{ flex: 1, overflow: 'hidden' }}><img src={images[2]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(2)} className="gallery-img-hover" /></div>
                            <div style={{ flex: 1, overflow: 'hidden' }}><img src={images[3]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(3)} className="gallery-img-hover" /></div>
                        </div>
                    </div>
                </div>
            );
        }

        // >= 5 images
        return (
            <div style={{ display: 'flex', gap: '8px', height: '450px', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ flex: 2, height: '100%', overflow: 'hidden' }}>
                    <img src={images[0]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(0)} className="gallery-img-hover" />
                </div>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '8px', height: '100%' }}>
                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}><img src={images[1]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(1)} className="gallery-img-hover" /></div>
                        <div style={{ flex: 1, overflow: 'hidden' }}><img src={images[2]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(2)} className="gallery-img-hover" /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                        <div style={{ flex: 1, overflow: 'hidden' }}><img src={images[3]} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} alt="room" onClick={() => setSelectedImage(3)} className="gallery-img-hover" /></div>
                        <div style={{ flex: 1, position: 'relative', cursor: 'pointer', overflow: 'hidden' }} onClick={() => setSelectedImage(4)}>
                            <img src={images[4]} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="room" className="gallery-img-hover" />
                            {images.length > 5 && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px', fontWeight: 'bold' }}>
                                    +{images.length - 5}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleGoBack = () => {
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            navigate('/room-posts');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <button onClick={handleGoBack} className="btn-primary" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                    <FaArrowLeft /> Quay lại
                </button>
                <h1 className="page-title" style={{ margin: 0 }}>Chi tiết phòng</h1>
            </div>

            <div className="form-card" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px' }}>
                {/* 1. Header Section */}
                <div style={{ marginBottom: '24px' }}>
                    <h1 style={{ color: 'var(--text-main)', fontSize: '32px', margin: '0 0 12px 0', fontWeight: 'bold', lineHeight: '1.3' }}>{post.tieuDe}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', color: 'var(--text-muted)', fontSize: '15px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaMapMarkerAlt style={{ color: 'var(--primary)' }} /> <span>{post.diaChiChiTiet}</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaRulerCombined style={{ color: 'var(--primary)' }} /> <span>{post.dienTich} m²</span></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaTag style={{ color: 'var(--primary)' }} /> <span>{post.loaiBaiDang === 'ChoThuePhong' ? 'Phòng trọ' : (post.loaiBaiDang === 'NhaNguyenCan' ? 'Nhà nguyên căn' : 'Ở ghép')}</span></div>
                    </div>
                </div>

                {/* 2. Image Gallery Section */}
                <style>{`
                    .gallery-img-hover { transition: transform 0.3s ease; }
                    .gallery-img-hover:hover { transform: scale(1.05); filter: brightness(0.9); }
                `}</style>
                <div style={{ marginBottom: '40px' }}>
                    {renderImageGallery(post.images)}
                </div>

                {/* 3. Split Layout Section */}
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>

                    {/* Cột trái (Main Content) */}
                    <div style={{ flex: '1 1 65%', minWidth: '0' }}>
                        {/* Mô tả chi tiết */}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '22px', color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>Mô tả chi tiết</h3>
                            <p style={{ color: 'var(--text-muted)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '16px' }}>
                                {post.moTaChiTiet}
                            </p>
                        </div>

                        {/* Tiện ích */}
                        <div style={{ marginBottom: '40px' }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: '22px', color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>Tiện ích đi kèm</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '20px' }}>
                                {(() => {
                                    try {
                                        const parsedTienIch = JSON.parse(post.tienIch || "[]");
                                        if (parsedTienIch.length === 0) return <span style={{ color: 'var(--text-muted)' }}>Không có thông tin tiện ích.</span>;
                                        return parsedTienIch.map((item, idx) => (
                                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: '16px' }}>
                                                <FaCheckCircle style={{ color: '#10b981', flexShrink: 0, fontSize: '18px' }} />
                                                <span>{item}</span>
                                            </div>
                                        ));
                                    } catch (e) {
                                        return <span style={{ color: 'var(--text-muted)' }}>Lỗi hiển thị tiện ích.</span>;
                                    }
                                })()}
                            </div>
                        </div>

                        {/* Bản đồ */}
                        {post.viDoThucTe && post.kinhDoThucTe && (
                            <div style={{ marginBottom: '20px' }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '22px', color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>Vị trí trên bản đồ</h3>
                                <div style={{ width: '100%', height: '400px', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)', zIndex: 0, position: 'relative', marginTop: '20px' }}>
                                    {(post.viDoThucTe >= -90 && post.viDoThucTe <= 90 && post.kinhDoThucTe >= -180 && post.kinhDoThucTe <= 180) ? (
                                        <MapContainer center={[post.viDoThucTe, post.kinhDoThucTe]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <Marker position={[post.viDoThucTe, post.kinhDoThucTe]}>
                                                <Popup>{post.diaChiChiTiet}</Popup>
                                            </Marker>
                                        </MapContainer>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'var(--bg-dark)', color: 'var(--text-muted)' }}>
                                            Tọa độ bản đồ không hợp lệ.
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Form Đặt Lịch Hẹn Nội Tuyến */}
                        {context === 'viewer' && !isChuTro() && !isAdminOrModerator() && (
                            <div ref={appointmentRef} style={{ marginBottom: '40px', padding: '24px', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '22px', color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>Đặt lịch xem phòng</h3>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Chọn thời gian bạn muốn đến xem phòng. Chủ trọ sẽ nhận được yêu cầu và xác nhận với bạn.</p>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Ngày xem</label>
                                        <input type="date" className="premium-input" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }} value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                                    </div>

                                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                                        <label className="form-label" style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Giờ xem</label>
                                        <input type="time" className="premium-input" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)' }} value={appointmentTime} onChange={e => setAppointmentTime(e.target.value)} />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label className="form-label" style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', display: 'block' }}>Ghi chú thêm (Tùy chọn)</label>
                                    <textarea
                                        className="premium-input"
                                        rows="3"
                                        placeholder="Vd: Mình qua xem khoảng 15 phút nhé..."
                                        value={appointmentNote}
                                        onChange={(e) => setAppointmentNote(e.target.value)}
                                        style={{ resize: 'vertical', width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)', color: 'var(--text-main)', fontFamily: 'inherit' }}
                                    ></textarea>
                                </div>

                                <button
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', fontWeight: 'bold' }}
                                    onClick={handleBookAppointment}
                                    disabled={bookingAppointment || !appointmentDate || !appointmentTime}
                                >
                                    {bookingAppointment ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu lịch hẹn'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Cột phải (Sticky Sidebar) */}
                    <div style={{ flex: '1 1 30%' }}>
                        <div style={{ position: 'sticky', top: '24px', background: 'var(--bg-card)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Giá thuê</div>
                                <div className="room-price" style={{ fontSize: '36px', margin: 0 }}>{formatCurrency(post.giaThue)}<span style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 'normal' }}>/tháng</span></div>
                            </div>

                            <div style={{ marginBottom: '28px' }}>
                                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '1px' }}>Thông tin liên hệ</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: 'var(--bg-dark)', padding: '16px', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-main)' }}>
                                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '24px', flexShrink: 0 }}>
                                            {post.nguoiDangTen ? post.nguoiDangTen.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div style={{ minWidth: '0' }}>
                                            <div style={{ fontWeight: 'bold', fontSize: '18px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.nguoiDangTen}</div>
                                            <div style={{ color: 'var(--primary)', fontWeight: '600', marginTop: '6px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaPhoneAlt /> {post.nguoiDangPhone}</div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-primary"
                                        style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '15px', fontWeight: 'bold', backgroundColor: '#0068ff', marginTop: '8px' }}
                                        onClick={() => setShowZaloQR(true)}
                                    >
                                        <FaCommentDots style={{ marginRight: '8px' }} /> Chat Zalo
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                {context === 'owner' && (
                                    <>
                                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', fontWeight: 'bold' }} onClick={handleEdit}>
                                            <FaEdit /> Chỉnh sửa bài đăng
                                        </button>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button className="btn-secondary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontWeight: 'bold' }} onClick={handleToggleHide}>
                                                {post.isHidden ? <><FaEye /> Hiện</> : <><FaEyeSlash /> Ẩn</>}
                                            </button>
                                            <button className="btn-secondary" style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', fontWeight: 'bold' }} onClick={handleDelete}>
                                                <FaTrash /> Xóa bài
                                            </button>
                                        </div>
                                    </>
                                )}

                                {context === 'moderator' && (
                                    <>
                                        {post.trangThaiKiemDuyet === 'ChoDuyet' ? (
                                            <>
                                                <button className="btn-primary" style={{ backgroundColor: '#10b981', width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', fontWeight: 'bold' }} onClick={() => handleModerate(true)}>
                                                    <FaCheck /> Duyệt bài
                                                </button>
                                                <button className="btn-primary" style={{ backgroundColor: '#ef4444', width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', fontWeight: 'bold' }} onClick={() => handleModerate(false)}>
                                                    <FaTimes /> Từ chối
                                                </button>
                                            </>
                                        ) : (
                                            <div style={{
                                                padding: '14px 20px', borderRadius: '10px', textAlign: 'center',
                                                fontWeight: '600', fontSize: '15px',
                                                background: post.trangThaiKiemDuyet === 'DaDuyet' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                                                color: post.trangThaiKiemDuyet === 'DaDuyet' ? '#10b981' : '#ef4444',
                                                border: `1px solid ${post.trangThaiKiemDuyet === 'DaDuyet' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                                            }}>
                                                {post.trangThaiKiemDuyet === 'DaDuyet' && '✅ Bài đã được duyệt'}
                                                {post.trangThaiKiemDuyet === 'TuChoi' && '❌ Bài đã bị từ chối'}
                                                {post.trangThaiKiemDuyet === 'ViPham' && '⚠️ Bài đăng vi phạm'}
                                            </div>
                                        )}
                                    </>
                                )}

                                {context === 'viewer' && !isChuTro() && !isAdminOrModerator() && (
                                    <>
                                        <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px', fontWeight: 'bold' }} onClick={() => {
                                            if (!isLoggedIn()) {
                                                if (window.confirm("Bạn cần đăng nhập để đặt lịch. Bạn có muốn chuyển đến trang đăng nhập không?")) {
                                                    navigate('/login');
                                                }
                                                return;
                                            }
                                            if (appointmentRef.current) {
                                                appointmentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                            }
                                        }}>
                                            Đặt lịch xem phòng
                                        </button>
                                        <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', color: '#ef4444', borderColor: 'transparent', background: 'rgba(239, 68, 68, 0.1)', padding: '14px', fontSize: '16px', fontWeight: 'bold' }} onClick={() => {
                                            if (!isLoggedIn()) {
                                                if (window.confirm("Bạn cần đăng nhập để báo cáo. Bạn có muốn chuyển đến trang đăng nhập không?")) {
                                                    navigate('/login');
                                                }
                                                return;
                                            }
                                            setShowReportModal(true);
                                        }}>
                                            ⚠️ Báo cáo vi phạm
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px', width: '90%' }}>
                        <h2>Báo cáo vi phạm</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>Vui lòng mô tả chi tiết lý do bạn báo cáo bài đăng này.</p>

                        <textarea
                            className="premium-input"
                            rows="4"
                            placeholder="Nhập lý do..."
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                            style={{ resize: 'vertical' }}
                        ></textarea>

                        {/* Upload ảnh/video minh chứng */}
                        <div style={{ marginTop: '16px' }}>
                            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Ảnh / Video minh chứng <span style={{ fontWeight: '400', textTransform: 'none' }}>(tùy chọn, tối đa 5 file)</span>
                            </div>
                            <label htmlFor="report-file-input" style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                padding: '12px', borderRadius: '10px', cursor: 'pointer',
                                border: '2px dashed var(--border-color)', color: 'var(--text-muted)',
                                fontSize: '14px', transition: 'all 0.2s'
                            }}>
                                📎 Chọn ảnh hoặc video
                            </label>
                            <input
                                id="report-file-input"
                                type="file"
                                accept="image/*,video/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handleReportFileChange}
                            />
                            {reportFilePreviews.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', marginTop: '10px' }}>
                                    {reportFilePreviews.map((item, idx) => (
                                        <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', height: '80px', background: 'var(--bg-dark)' }}>
                                            {item.type === 'image' ? (
                                                <img src={item.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '24px' }}>&#x1F3AC;</div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const newFiles = reportFiles.filter((_, i) => i !== idx);
                                                    const newPreviews = reportFilePreviews.filter((_, i) => i !== idx);
                                                    setReportFiles(newFiles);
                                                    setReportFilePreviews(newPreviews);
                                                }}
                                                style={{
                                                    position: 'absolute', top: '4px', right: '4px',
                                                    width: '20px', height: '20px', borderRadius: '50%',
                                                    background: 'rgba(0,0,0,0.7)', color: '#fff',
                                                    border: 'none', cursor: 'pointer', fontSize: '12px',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                            >×</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions" style={{ marginTop: '20px' }}>
                            <button className="btn-secondary" onClick={() => { setShowReportModal(false); setReportFiles([]); setReportFilePreviews([]); }}>Hủy</button>
                            <button className="btn-primary" style={{ backgroundColor: '#ef4444' }} onClick={handleReport} disabled={submittingReport || !reportReason.trim()}>
                                {submittingReport ? 'Đang gửi...' : 'Gửi báo cáo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Zalo QR Modal */}
            {showZaloQR && (
                <div className="modal-overlay" onClick={() => setShowZaloQR(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '350px' }}>
                        <h2 style={{ color: '#0068ff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <FaCommentDots /> Chat Zalo
                        </h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Quét mã QR bằng điện thoại để mở cuộc trò chuyện với <strong>{post.nguoiDangTen}</strong>.</p>

                        <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                            <QRCodeSVG value={`https://zalo.me/${post.nguoiDangPhone}`} size={200} level="H" />
                        </div>

                        <div style={{ marginTop: '20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                            Hoặc bấm vào link: <br />
                            <a href={`https://zalo.me/${post.nguoiDangPhone}`} target="_blank" rel="noopener noreferrer" style={{ color: '#0068ff', fontWeight: 'bold', textDecoration: 'none' }}>zalo.me/{post.nguoiDangPhone}</a>
                        </div>

                        <div className="modal-actions" style={{ marginTop: '24px', justifyContent: 'center' }}>
                            <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowZaloQR(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Appointment Modal removed, now inline */}

            {/* Fullscreen Image Viewer Modal */}
            {selectedImage !== null && post.images && post.images.length > 0 && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} onClick={() => setSelectedImage(null)}>
                    <button onClick={() => setSelectedImage(null)} style={{ position: 'absolute', top: '20px', right: '40px', background: 'none', border: 'none', color: 'white', fontSize: '50px', cursor: 'pointer', zIndex: 10000 }}>&times;</button>

                    <div style={{ position: 'relative', width: '100%', height: '75vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedImage((prev) => (prev === 0 ? post.images.length - 1 : prev - 1))} style={{ position: 'absolute', left: '40px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '30px', width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>&#10094;</button>

                        <img src={post.images[selectedImage]} style={{ maxWidth: '90%', maxHeight: '100%', objectFit: 'contain', transition: 'opacity 0.3s' }} alt="fullscreen" />

                        <button onClick={() => setSelectedImage((prev) => (prev === post.images.length - 1 ? 0 : prev + 1))} style={{ position: 'absolute', right: '40px', background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', fontSize: '30px', width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>&#10095;</button>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '16px', overflowX: 'auto', maxWidth: '90%', padding: '10px' }} onClick={e => e.stopPropagation()}>
                        {post.images.map((img, idx) => (
                            <img key={idx} src={img} onClick={() => setSelectedImage(idx)} style={{ width: '100px', height: '70px', objectFit: 'cover', cursor: 'pointer', border: selectedImage === idx ? '3px solid white' : 'none', opacity: selectedImage === idx ? 1 : 0.4, borderRadius: '8px', transition: 'all 0.2s' }} alt={`thumb ${idx}`} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoomPostDetail;
