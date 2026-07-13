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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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
                        <input 
                            type="password" 
                            name="matKhau" 
                            className="premium-input" 
                            placeholder="Nhập mật khẩu" 
                            value={formData.matKhau} 
                            onChange={handleChange} 
                            required 
                        />
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
