import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaExternalLinkAlt, FaCheck, FaTimes, FaEnvelope, FaPhone, FaExclamationTriangle, FaUser, FaHome, FaClock, FaImages } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Pagination from '../../components/Common/Pagination';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const ReportList = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [evidenceModal, setEvidenceModal] = useState(null); // null hoặc { urls: [], title: '' }
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchReports(currentPage);
    }, [currentPage]);

    const fetchReports = async (page) => {
        setLoading(true);
        try {
            const res = await api.get('/Report/all', {
                params: { page, pageSize }
            });

            // Sắp xếp: ChoXuLy lên đầu, DaXuLy/BacBo xuống dưới. Cùng trạng thái thì mới nhất lên trước
            const sortedReports = (res.data.items || []).sort((a, b) => {
                if (a.trangThaiXuLy === 'ChoXuLy' && b.trangThaiXuLy !== 'ChoXuLy') return -1;
                if (a.trangThaiXuLy !== 'ChoXuLy' && b.trangThaiXuLy === 'ChoXuLy') return 1;
                return new Date(b.ngayTao) - new Date(a.ngayTao);
            });

            setReports(sortedReports);
            setTotalPages(res.data.totalPages || 1);
        } catch (error) {
            console.error("Lỗi khi tải danh sách báo cáo", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, actionStr) => {
        const label = actionStr === 'DaXuLy' ? 'xử lý (xác nhận vi phạm)' : 'bác bỏ (không có vi phạm)';
        if (!window.confirm(`Bạn có chắc muốn ${label} báo cáo này không?\n\nHành động này sẽ gửi thông báo đến người báo cáo và chủ bài đăng.`)) return;
        try {
            await api.put(`/Report/${id}/resolve`, `"${actionStr}"`, {
                headers: { 'Content-Type': 'application/json' }
            });
            fetchReports(currentPage);
        } catch (error) {
            alert("Có lỗi xảy ra khi xử lý.");
        }
    };

    const openEvidence = (report) => {
        let urls = [];
        try {
            urls = JSON.parse(report.duongDanMinhChung || '[]');
        } catch { urls = []; }
        setEvidenceModal({ urls, title: report.baiDangTitle || 'Báo cáo' });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'HH:mm dd/MM/yyyy', { locale: vi });
        } catch {
            return dateStr;
        }
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const isVideo = (url) => /\.(mp4|mov|avi|webm|mkv)/i.test(url);

    const pendingCount = reports.filter(r => r.trangThaiXuLy === 'ChoXuLy').length;

    return (
        <div className="page-container">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h1 className="page-title">Xử lý báo cáo vi phạm</h1>
                {!loading && (
                    <span style={{
                        background: pendingCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: pendingCount > 0 ? '#f59e0b' : '#10b981',
                        padding: '6px 16px', borderRadius: '20px',
                        fontSize: '14px', fontWeight: '600',
                        border: `1px solid ${pendingCount > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}>
                        {pendingCount > 0 ? `${pendingCount} chờ xử lý` : 'Không có báo cáo chờ'}
                    </span>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
                    Đang tải dữ liệu...
                </div>
            ) : reports.length === 0 ? (
                <div style={{
                    textAlign: 'center', padding: '80px 20px',
                    color: 'var(--text-muted)', background: 'var(--card-bg)',
                    borderRadius: '16px', border: '1px solid var(--border-color)'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--text-main)' }}>Không có báo cáo nào cần xử lý</div>
                    <div style={{ fontSize: '14px' }}>Tất cả báo cáo đã được xử lý. Hệ thống đang hoạt động tốt.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {reports.map((report) => (
                        <div key={report.id} className="form-card" style={{
                            padding: '0', overflow: 'hidden',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                        }}>
                            {/* Card Header */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '14px 20px',
                                background: report.trangThaiXuLy === 'ChoXuLy' ? 'rgba(245, 158, 11, 0.06)' :
                                    report.trangThaiXuLy === 'DaXuLy' ? 'rgba(16, 185, 129, 0.06)' : 'rgba(107, 114, 128, 0.06)',
                                borderBottom: `1px solid ${report.trangThaiXuLy === 'ChoXuLy' ? 'rgba(245, 158, 11, 0.15)' :
                                    report.trangThaiXuLy === 'DaXuLy' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)'}`
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {report.trangThaiXuLy === 'ChoXuLy' && <FaExclamationTriangle style={{ color: '#f59e0b' }} />}
                                    {report.trangThaiXuLy === 'DaXuLy' && <FaCheck style={{ color: '#10b981' }} />}
                                    {report.trangThaiXuLy === 'BacBo' && <FaTimes style={{ color: '#6b7280' }} />}

                                    <span style={{
                                        background: report.trangThaiXuLy === 'ChoXuLy' ? 'rgba(245, 158, 11, 0.15)' :
                                            report.trangThaiXuLy === 'DaXuLy' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                                        color: report.trangThaiXuLy === 'ChoXuLy' ? '#f59e0b' :
                                            report.trangThaiXuLy === 'DaXuLy' ? '#10b981' : '#6b7280',
                                        padding: '3px 12px', borderRadius: '20px',
                                        fontSize: '12px', fontWeight: '700', letterSpacing: '0.5px',
                                        border: `1px solid ${report.trangThaiXuLy === 'ChoXuLy' ? 'rgba(245, 158, 11, 0.3)' :
                                            report.trangThaiXuLy === 'DaXuLy' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`
                                    }}>
                                        {report.trangThaiXuLy === 'ChoXuLy' ? 'CHỜ XỬ LÝ' :
                                            report.trangThaiXuLy === 'DaXuLy' ? 'ĐÃ XỬ LÝ (VI PHẠM)' : 'ĐÃ BÁC BỎ'}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                    <FaClock size={12} />
                                    {formatDate(report.ngayTao)}
                                </div>
                            </div>

                            <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                {/* Left: Reporter Info */}
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                                        Người gửi báo cáo
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                                        <div style={{
                                            width: '44px', height: '44px', borderRadius: '50%',
                                            background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: '700', fontSize: '18px', flexShrink: 0
                                        }}>
                                            {getInitials(report.nguoiGuiName)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '15px' }}>{report.nguoiGuiName}</div>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Người báo cáo</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {report.nguoiGuiEmail && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                                <FaEnvelope style={{ color: 'var(--primary)', flexShrink: 0 }} />
                                                <a href={`mailto:${report.nguoiGuiEmail}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                                                    {report.nguoiGuiEmail}
                                                </a>
                                            </div>
                                        )}
                                        {report.nguoiGuiSoDienThoai && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                                <FaPhone style={{ color: '#10b981', flexShrink: 0 }} />
                                                <a href={`tel:${report.nguoiGuiSoDienThoai}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                                                    {report.nguoiGuiSoDienThoai}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right: Post & Owner Info */}
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '12px' }}>
                                        Bài đăng bị báo cáo
                                    </div>
                                    {report.baiDangBiBaoCaoId ? (
                                        <div>
                                            <Link
                                                to={`/room-posts/${report.baiDangBiBaoCaoId}`}
                                                state={{ context: 'moderator' }}
                                                style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                                    color: 'var(--primary)', textDecoration: 'none',
                                                    fontWeight: '600', fontSize: '14px', marginBottom: '10px',
                                                    padding: '8px 14px', borderRadius: '8px',
                                                    background: 'rgba(99, 102, 241, 0.08)',
                                                    border: '1px solid rgba(99, 102, 241, 0.2)',
                                                }}
                                            >
                                                <FaHome size={13} />
                                                {report.baiDangTitle || 'Xem bài đăng'}
                                                <FaExternalLinkAlt size={11} />
                                            </Link>

                                            {report.chuTroName && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                                        <FaUser size={11} />
                                                        Chủ bài: <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{report.chuTroName}</span>
                                                    </div>
                                                    {report.chuTroEmail && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                            <FaEnvelope style={{ color: 'var(--primary)', flexShrink: 0 }} size={11} />
                                                            <a href={`mailto:${report.chuTroEmail}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                                                                {report.chuTroEmail}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {report.chuTroSoDienThoai && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                                            <FaPhone style={{ color: '#10b981', flexShrink: 0 }} size={11} />
                                                            <a href={`tel:${report.chuTroSoDienThoai}`} style={{ color: 'var(--text-main)', textDecoration: 'none' }}>
                                                                {report.chuTroSoDienThoai}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Báo cáo tài khoản</div>
                                    )}
                                </div>
                            </div>

                            {/* Report Content */}
                            <div style={{ margin: '0 20px 20px 20px' }}>
                                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>
                                    Nội dung báo cáo
                                </div>
                                <div style={{
                                    background: 'rgba(239, 68, 68, 0.07)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderLeft: '4px solid #ef4444',
                                    borderRadius: '8px', padding: '14px 16px',
                                    color: 'var(--text-main)', fontSize: '14px', lineHeight: '1.6'
                                }}>
                                    {report.lyDoPhanAnh}
                                </div>
                            </div>

                            {/* Card Footer - Actions */}
                            <div style={{
                                display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px',
                                padding: '14px 20px',
                                borderTop: '1px solid var(--border-color)',
                                background: 'rgba(0,0,0,0.08)'
                            }}>
                                <ActionButton
                                    id={`btn-evidence-${report.id}`}
                                    onClick={() => openEvidence(report)}
                                    color="#8b5cf6"
                                    icon={<FaImages size={13} />}
                                    label="Xem minh chứng"
                                />

                                {/* CHECK TRẠNG THÁI Ở ĐÂY */}
                                {report.trangThaiXuLy === 'ChoXuLy' ? (
                                    <>
                                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: 'auto', marginRight: '10px' }}>
                                            Hành động:
                                        </span>
                                        <ActionButton
                                            id={`btn-reject-${report.id}`}
                                            onClick={() => handleAction(report.id, 'BacBo')}
                                            color="#ef4444"
                                            icon={<FaTimes size={13} />}
                                            label="Bác bỏ"
                                        />
                                        <ActionButton
                                            id={`btn-resolve-${report.id}`}
                                            onClick={() => handleAction(report.id, 'DaXuLy')}
                                            color="#10b981"
                                            icon={<FaCheck size={13} />}
                                            label="Xử lý (Vi phạm)"
                                        />
                                    </>
                                ) : (
                                    <div style={{
                                        marginLeft: 'auto',
                                        padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px',
                                        color: report.trangThaiXuLy === 'DaXuLy' ? '#ef4444' : '#6b7280',
                                        background: report.trangThaiXuLy === 'DaXuLy' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(107, 114, 128, 0.1)'
                                    }}>
                                        {report.trangThaiXuLy === 'DaXuLy' ? 'Đã xác nhận Vi Phạm' : 'Đã Bác Bỏ'}
                                    </div>
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

            {/* Evidence Modal */}
            {evidenceModal && (
                <div
                    onClick={() => setEvidenceModal(null)}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 1000,
                        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '20px'
                    }}
                >
                    <div
                        onClick={e => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-card)', borderRadius: '16px',
                            width: '100%', maxWidth: '900px', maxHeight: '85vh',
                            overflow: 'hidden', display: 'flex', flexDirection: 'column',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '20px 24px', borderBottom: '1px solid var(--border-color)',
                            flexShrink: 0
                        }}>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-main)' }}>
                                    📎 Minh chứng báo cáo
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    {evidenceModal.title} · {evidenceModal.urls.length} file
                                </div>
                            </div>
                            <button
                                onClick={() => setEvidenceModal(null)}
                                style={{
                                    background: 'rgba(255,255,255,0.08)', border: 'none',
                                    color: 'var(--text-muted)', cursor: 'pointer',
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >×</button>
                        </div>

                        {/* Modal Body */}
                        <div style={{ overflowY: 'auto', padding: '24px', flexGrow: 1 }}>
                            {evidenceModal.urls.length === 0 ? (
                                <div style={{
                                    textAlign: 'center', padding: '60px 20px',
                                    color: 'var(--text-muted)'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                                        Không có minh chứng đính kèm
                                    </div>
                                    <div style={{ fontSize: '14px' }}>Người báo cáo không đính kèm ảnh hoặc video minh chứng.</div>
                                </div>
                            ) : (
                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: evidenceModal.urls.length === 1
                                        ? '1fr'
                                        : 'repeat(auto-fill, minmax(260px, 1fr))',
                                    gap: '16px'
                                }}>
                                    {evidenceModal.urls.map((url, idx) => (
                                        <div key={idx} style={{
                                            borderRadius: '12px', overflow: 'hidden',
                                            background: 'var(--bg-dark)',
                                            border: '1px solid var(--border-color)'
                                        }}>
                                            {isVideo(url) ? (
                                                <video
                                                    src={url}
                                                    controls
                                                    style={{ width: '100%', display: 'block', maxHeight: '400px' }}
                                                />
                                            ) : (
                                                <a href={url} target="_blank" rel="noopener noreferrer">
                                                    <img
                                                        src={url}
                                                        alt={`Minh chứng ${idx + 1}`}
                                                        style={{
                                                            width: '100%', display: 'block',
                                                            maxHeight: evidenceModal.urls.length === 1 ? '500px' : '280px',
                                                            objectFit: 'cover',
                                                            transition: 'transform 0.2s',
                                                            cursor: 'pointer'
                                                        }}
                                                        onMouseEnter={e => e.target.style.transform = 'scale(1.02)'}
                                                        onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                                    />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ActionButton = ({ id, onClick, color, icon, label }) => {
    const [hovered, setHovered] = React.useState(false);
    return (
        <button
            id={id}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '9px 20px', borderRadius: '8px',
                border: `1px solid ${hovered ? color : `${color}66`}`,
                background: hovered ? `${color}33` : `${color}14`,
                color: color, fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: hovered ? `0 2px 8px ${color}40` : 'none'
            }}
        >
            {icon} {label}
        </button>
    );
};

export default ReportList;
