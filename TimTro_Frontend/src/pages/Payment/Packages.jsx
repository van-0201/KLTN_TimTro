import React, { useState } from 'react';
import api from '../../services/api';
import { FaCheckCircle } from 'react-icons/fa';

const Packages = () => {
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [transaction, setTransaction] = useState(null);

    const packages = [
        { id: 'Goi7Ngay', name: 'Gói 7 Ngày', price: 100000, days: 7 },
        { id: 'Goi30Ngay', name: 'Gói 30 Ngày', price: 300000, days: 30, popular: true },
        { id: 'Goi365Ngay', name: 'Gói 365 Ngày (VIP)', price: 999000, days: 365 }
    ];

    const handleBuy = async () => {
        if (!selectedPackage) return;
        setLoading(true);
        const amount = selectedPackage.price;
        const msg = `NAPTRO ${Math.floor(Math.random() * 10000)}`;
        const qrUrl = `https://img.vietqr.io/image/BIDV-5150651853-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(msg)}&accountName=DAU%20HUY%20VAN`;

        try {
            const res = await api.post('/Transaction', {
                loaiGoi: selectedPackage.id,
                soTien: amount,
                noiDungChuyenKhoan: msg,
                maQR: qrUrl
            });
            setTransaction(res.data);
        } catch (error) {
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo giao dịch.');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (transaction) {
        return (
            <div className="page-container" style={{textAlign: 'center'}}>
                <h1>Thanh toán mã: {transaction.noiDungChuyenKhoan}</h1>
                <p>Vui lòng dùng App Ngân hàng quét mã QR dưới đây để thanh toán.</p>
                <img src={transaction.maQR} alt="QR Code" style={{width: '300px', borderRadius: '12px', border: '2px solid var(--primary)', margin: '20px 0'}} />
                <p style={{color: 'var(--text-muted)'}}>Sau khi thanh toán xong, hệ thống sẽ tự động gửi yêu cầu lên Admin để xét duyệt (Giao dịch sẽ được cộng ngày vào tài khoản của bạn).</p>
                <button className="btn-primary" onClick={() => setTransaction(null)}>Quay lại mua gói khác</button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Gói Dịch Vụ Đăng Bài</h1>
            </div>
            <p style={{textAlign: 'center', marginBottom: '40px', color: 'var(--text-muted)'}}>Chọn gói dịch vụ phù hợp để bài đăng của bạn tiếp cận nhiều người thuê hơn.</p>

            <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
                {packages.map(pkg => (
                    <div key={pkg.id} onClick={() => setSelectedPackage(pkg)} style={{
                        width: '300px',
                        padding: '30px',
                        borderRadius: '12px',
                        border: selectedPackage?.id === pkg.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: 'var(--bg-card)',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.3s'
                    }}>
                        {pkg.popular && <div style={{position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold'}}>PHỔ BIẾN NHẤT</div>}
                        <h2 style={{margin: '0 0 10px 0', fontSize: '20px', textAlign: 'center'}}>{pkg.name}</h2>
                        <div style={{fontSize: '32px', fontWeight: 'bold', color: 'var(--primary)', textAlign: 'center', marginBottom: '20px'}}>
                            {formatCurrency(pkg.price)}
                        </div>
                        <ul style={{listStyle: 'none', padding: 0, margin: '0 0 20px 0', display: 'flex', flexDirection: 'column', gap: '10px', color: 'var(--text-muted)'}}>
                            <li><FaCheckCircle color="var(--primary)"/> Đăng bài không giới hạn</li>
                            <li><FaCheckCircle color="var(--primary)"/> Hiển thị ưu tiên {pkg.days} ngày</li>
                            <li><FaCheckCircle color="var(--primary)"/> Hỗ trợ 24/7</li>
                        </ul>
                    </div>
                ))}
            </div>

            <div style={{textAlign: 'center', marginTop: '40px'}}>
                <button className="btn-primary" style={{padding: '12px 40px', fontSize: '18px'}} disabled={!selectedPackage || loading} onClick={handleBuy}>
                    {loading ? 'Đang xử lý...' : 'Mua Gói Ngay'}
                </button>
            </div>
        </div>
    );
};

export default Packages;
