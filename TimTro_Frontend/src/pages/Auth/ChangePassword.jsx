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
    
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(formData.newPassword)) {
            setError('Mật khẩu mới phải dài tối thiểu 6 ký tự, bao gồm cả chữ cái và chữ số.');
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
        <div className="auth-container" style={{ minHeight: 'calc(100vh - 100px)', alignItems: 'flex-start', paddingTop: '40px' }}>
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
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showOldPassword ? "text" : "password"} 
                                name="oldPassword" 
                                className="premium-input" 
                                placeholder="Nhập mật khẩu hiện tại" 
                                value={formData.oldPassword} 
                                onChange={handleChange} 
                                required 
                                style={{ paddingRight: '40px' }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {showOldPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Mật khẩu mới</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showNewPassword ? "text" : "password"} 
                                name="newPassword" 
                                className="premium-input" 
                                placeholder="Nhập mật khẩu mới" 
                                value={formData.newPassword} 
                                onChange={handleChange} 
                                required 
                                style={{ paddingRight: '40px' }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {showNewPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Nhập lại mật khẩu mới</label>
                        <div style={{ position: 'relative' }}>
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                name="confirmPassword" 
                                className="premium-input" 
                                placeholder="Nhập lại mật khẩu mới" 
                                value={formData.confirmPassword} 
                                onChange={handleChange} 
                                required 
                                style={{ paddingRight: '40px' }}
                            />
                            <button 
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                {showConfirmPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                )}
                            </button>
                        </div>
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
