import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/auth.css';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Mật khẩu nhập lại không khớp.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/Auth/change-password', {
                oldPassword: formData.oldPassword,
                newPassword: formData.newPassword,
            });
            setMessage('Đổi mật khẩu thành công!');
            setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setError(err.response?.data?.message || err.response?.data || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt_token');
        navigate('/login');
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Đổi mật khẩu</h1>
                    <p>Bảo mật tài khoản của bạn</p>
                </div>
                
                {error && <div className="auth-error">⚠️ {error}</div>}
                {message && <div className="auth-error" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.2)'}}>✅ {message}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Mật khẩu cũ</label>
                        <input 
                            type="password" 
                            name="oldPassword" 
                            className="premium-input" 
                            placeholder="Nhập mật khẩu hiện tại" 
                            value={formData.oldPassword} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <input 
                            type="password" 
                            name="newPassword" 
                            className="premium-input" 
                            placeholder="Nhập mật khẩu mới" 
                            value={formData.newPassword} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Nhập lại mật khẩu mới</label>
                        <input 
                            type="password" 
                            name="confirmPassword" 
                            className="premium-input" 
                            placeholder="Nhập lại mật khẩu mới" 
                            value={formData.confirmPassword} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button type="submit" className="premium-btn" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                    </button>
                </form>

                <div className="auth-footer">
                    <button onClick={handleLogout} style={{background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', textDecoration: 'underline'}}>Đăng xuất</button>
                    &nbsp; | &nbsp;
                    <Link to="/">Về trang chủ</Link>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
