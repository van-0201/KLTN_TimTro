using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Http;

namespace TimTro_Backend.DTOs
{
    public class CreateReportRequest
    {
        public Guid? BaiDangBiBaoCaoId { get; set; }
        public Guid? TaiKhoanBiBaoCaoId { get; set; }
        public string LyDoPhanAnh { get; set; }
        public List<IFormFile>? MinhChungFiles { get; set; } // Ảnh/video minh chứng (tuỳ chọn)
    }

    public class ReportResponse
    {
        public Guid Id { get; set; }
        public Guid NguoiGuiId { get; set; }
        public string NguoiGuiName { get; set; }
        public string NguoiGuiEmail { get; set; }
        public string NguoiGuiSoDienThoai { get; set; }
        public Guid? BaiDangBiBaoCaoId { get; set; }
        public string BaiDangTitle { get; set; }
        public Guid? ChuTroId { get; set; }
        public string ChuTroName { get; set; }
        public string ChuTroEmail { get; set; }
        public string ChuTroSoDienThoai { get; set; }
        public Guid? TaiKhoanBiBaoCaoId { get; set; }
        public string LyDoPhanAnh { get; set; }
        public string DuongDanMinhChung { get; set; } // JSON array URLs
        public string TrangThaiXuLy { get; set; }
        public DateTime NgayTao { get; set; }
    }
}

