import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/auth.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        hoTen: '',
        email: '',
        soDienThoai: '',
        matKhau: '',
        vaiTro: 'NguoiThue'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // OTP states
    const [showOtpInput, setShowOtpInput] = useState(false);
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(formData.matKhau)) {
            setError('Mật khẩu phải dài tối thiểu 6 ký tự, bao gồm cả chữ cái và chữ số.');
            return;
        }

        const phoneRegex = /^(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(formData.soDienThoai)) {
            setError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng số điện thoại Việt Nam.');
            return;
        }

        if (!showOtpInput) {
            // Step 1: Send OTP
            setLoading(true);
            try {
                const response = await api.post('/Auth/send-otp', { email: formData.email });
                if (response.status === 200) {
                    setShowOtpInput(true);
                    setCountdown(60); // 1 minute
                }
            } catch (err) {
                setError(err.response?.data?.Message || err.response?.data?.message || 'Không thể gửi mã xác nhận. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        } else {
            // Step 2: Register with OTP
            if (!otp || otp.length !== 6) {
                setError('Vui lòng nhập mã OTP gồm 6 chữ số.');
                return;
            }

            setLoading(true);
            try {
                await api.post('/Auth/register', { ...formData, otp });
                // After successful registration, navigate to login
                navigate('/login');
            } catch (err) {
                setError(err.response?.data?.Message || err.response?.data?.message || 'Mã OTP không hợp lệ hoặc đã xảy ra lỗi.');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/Auth/send-otp', { email: formData.email });
            if (response.status === 200) {
                setCountdown(60);
            }
        } catch (err) {
            setError(err.response?.data?.Message || err.response?.data?.message || 'Không thể gửi lại mã xác nhận.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Tạo tài khoản</h1>
                    <p>Bắt đầu hành trình tìm kiếm không gian sống lý tưởng</p>
                </div>

                {error && <div className="auth-error">⚠️ {error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Họ và tên</label>
                        <input
                            type="text"
                            name="hoTen"
                            className="premium-input"
                            placeholder="Nhập họ tên"
                            value={formData.hoTen}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            className="premium-input"
                            placeholder="Nhập email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Số điện thoại</label>
                        <input
                            type="text"
                            name="soDienThoai"
                            className="premium-input"
                            placeholder="Nhập số điện thoại"
                            value={formData.soDienThoai}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="matKhau"
                                className="premium-input"
                                placeholder="Nhập mật khẩu"
                                value={formData.matKhau}
                                onChange={handleChange}
                                required
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Bạn là ai?</label>
                        <select name="vaiTro" className="premium-input" value={formData.vaiTro} onChange={handleChange} disabled={showOtpInput}>
                            <option value="NguoiThue">Người thuê trọ</option>
                            <option value="ChuTro">Chủ trọ</option>
                        </select>
                    </div>

                    {showOtpInput && (
                        <div className="form-group">
                            <label>Mã xác nhận (OTP)</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    className="premium-input"
                                    placeholder="Nhập mã 6 số từ email"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength="6"
                                    required
                                />
                                <button
                                    type="button"
                                    className="premium-btn"
                                    style={{ flexShrink: 0, width: 'auto', padding: '0 15px', background: 'var(--surface-color)', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}
                                    onClick={handleResendOtp}
                                    disabled={countdown > 0 || loading}
                                >
                                    {countdown > 0 ? `Gửi lại sau ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` : 'Gửi lại mã'}
                                </button>
                            </div>
                            <small style={{ color: 'var(--text-muted)', marginTop: '5px', display: 'block' }}>
                                Vui lòng kiểm tra hộp thư đến của email {formData.email}
                            </small>
                        </div>
                    )}

                    <button type="submit" className="premium-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : (showOtpInput ? 'Xác nhận OTP để đăng ký' : 'Đăng ký')}
                    </button>
                </form>

                <div className="auth-footer">
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
