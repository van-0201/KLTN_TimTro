import React, { useState } from 'react';
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

        setLoading(true);
        try {
            await api.post('/Auth/register', formData);
            // After successful registration, navigate to login
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
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
                        <select name="vaiTro" className="premium-input" value={formData.vaiTro} onChange={handleChange}>
                            <option value="NguoiThue">Người thuê trọ</option>
                            <option value="ChuTro">Chủ trọ</option>
                        </select>
                    </div>
                    <button type="submit" className="premium-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng ký'}
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
