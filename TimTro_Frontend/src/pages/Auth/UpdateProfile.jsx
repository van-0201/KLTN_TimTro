import React, { useState } from 'react';
import api from '../../services/api';
import '../../styles/auth.css';

const UpdateProfile = () => {
    const [formData, setFormData] = useState({ hoTen: '', soDienThoai: '' });
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
        setLoading(true);
        try {
            await api.post('/Auth/update-profile', formData);
            setMessage('Cập nhật thông tin thành công!');
        } catch (err) {
            setError(err.response?.data || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Cập nhật thông tin cá nhân</h1>
            </div>

            <div className="form-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
                {error && <div className="auth-error">⚠️ {error}</div>}
                {message && <div className="auth-error" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.2)'}}>✅ {message}</div>}

                <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <div className="form-group">
                        <label className="form-label">Họ tên</label>
                        <input 
                            type="text" 
                            name="hoTen" 
                            className="form-control" 
                            placeholder="Nhập họ tên mới" 
                            value={formData.hoTen} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Số điện thoại</label>
                        <input 
                            type="text" 
                            name="soDienThoai" 
                            className="form-control" 
                            placeholder="Nhập số điện thoại mới" 
                            value={formData.soDienThoai} 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{justifyContent: 'center', marginTop: '10px'}}>
                        {loading ? 'Đang xử lý...' : 'Lưu thay đổi'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateProfile;
