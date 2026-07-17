import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaCheckCircle } from 'react-icons/fa';

const packages = [
    { id: 'Goi7Ngay', name: 'Gói 7 Ngày', price: 30000, features: ['Đăng không giới hạn 7 ngày', 'Hỗ trợ tiêu chuẩn'] },
    { id: 'Goi30Ngay', name: 'Gói 30 Ngày', price: 99000, features: ['Đăng không giới hạn 30 ngày', 'Tiết kiệm chi phí', 'Hỗ trợ ưu tiên'] },
    { id: 'Goi365Ngay', name: 'Gói 365 Ngày', price: 990000, features: ['Đăng không giới hạn 365 ngày', 'Tiết kiệm lớn nhất', 'Hỗ trợ 24/7', 'Phù hợp làm lâu dài'] }
];

const Packages = () => {
    const navigate = useNavigate();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [confirming, setConfirming] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleSelectPackage = async (pkg) => {
        setSelectedPackage(pkg);
        setLoading(true);
        try {
            const message = `Thanh toan goi ${pkg.name.replace('Gói ', '')} gia ${pkg.price}vnd`;
            setQrCode(`https://img.vietqr.io/image/970418-5150651853-compact2.png?amount=${pkg.price}&addInfo=${encodeURIComponent(message)}&accountName=DAU%20HUY%20VAN`);
        } catch (error) {
            alert('Lỗi tạo QR thanh toán: ' + error.message);
            setSelectedPackage(null);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPaid = async () => {
        if (!selectedPackage) return;
        setConfirming(true);
        try {
            await api.post('/Transaction', {
                loaiGoi: selectedPackage.id,
                soTien: selectedPackage.price,
                noiDungChuyenKhoan: `Thanh toan ${selectedPackage.name}`,
                maQR: ''
            });
            alert('Đã gửi yêu cầu thanh toán thành công! Vui lòng chờ Admin duyệt.');
            navigate('/');
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.response?.data || error.message;
            alert('Lỗi gửi yêu cầu thanh toán: ' + errorMsg);
        } finally {
            setConfirming(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{textAlign: 'center', display: 'block', marginBottom: '40px'}}>
                <h1 className="page-title" style={{fontSize: '32px', marginBottom: '10px'}}>Nâng cấp Gói dịch vụ</h1>
                <p style={{color: 'var(--text-muted)'}}>Chọn gói phù hợp để bắt đầu đăng tin cho thuê phòng của bạn</p>
            </div>

            {!selectedPackage ? (
                <div style={{display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap'}}>
                    {packages.map((pkg, index) => (
                        <div key={pkg.id} className="form-card" style={{flex: '1', minWidth: '280px', maxWidth: '350px', padding: '30px', position: 'relative', overflow: 'hidden', border: index === 1 ? '2px solid var(--primary)' : '1px solid var(--border-color)'}}>
                            {index === 1 && (
                                <div style={{position: 'absolute', top: '15px', right: '-35px', background: 'var(--primary)', color: 'white', padding: '5px 40px', transform: 'rotate(45deg)', fontSize: '12px', fontWeight: 'bold'}}>
                                    PHỔ BIẾN
                                </div>
                            )}
                            <h3 style={{fontSize: '20px', marginBottom: '15px'}}>{pkg.name}</h3>
                            <div style={{fontSize: '36px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '20px'}}>
                                {formatCurrency(pkg.price)}
                            </div>
                            <ul style={{listStyle: 'none', padding: 0, margin: '0 0 30px 0'}}>
                                {pkg.features.map((feature, i) => (
                                    <li key={i} style={{marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)'}}>
                                        <FaCheckCircle color="#10b981" /> {feature}
                                    </li>
                                ))}
                            </ul>
                            <button 
                                className="btn-primary" 
                                style={{width: '100%', justifyContent: 'center', background: index === 1 ? 'var(--primary)' : 'transparent', color: index === 1 ? 'white' : 'var(--primary)', border: '1px solid var(--primary)'}}
                                onClick={() => handleSelectPackage(pkg)}
                            >
                                Chọn gói này
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="form-card" style={{maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '40px'}}>
                    <h2>Thanh toán {selectedPackage.name}</h2>
                    <p style={{color: 'var(--text-muted)', marginBottom: '20px'}}>Vui lòng quét mã QR dưới đây để thanh toán <strong>{formatCurrency(selectedPackage.price)}</strong></p>
                    
                    {loading ? (
                        <div style={{padding: '50px 0'}}>Đang tạo mã QR...</div>
                    ) : (
                        <div style={{background: '#fff', padding: '10px', borderRadius: '12px', marginBottom: '20px', display: 'inline-block', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}>
                            <img src={qrCode} alt="QR Code" style={{width: '250px', height: '250px'}} />
                        </div>
                    )}

                    <div style={{display: 'flex', gap: '15px', justifyContent: 'center'}}>
                        <button className="btn-primary" style={{background: '#6c757d'}} onClick={() => setSelectedPackage(null)} disabled={confirming}>Hủy bỏ</button>
                        <button className="btn-primary" onClick={handleConfirmPaid} disabled={confirming}>
                            {confirming ? 'Đang xử lý...' : 'Tôi đã chuyển khoản'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Packages;
