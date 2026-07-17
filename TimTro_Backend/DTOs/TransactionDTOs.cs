using System;
using System.Collections.Generic;

namespace TimTro_Backend.DTOs
{
    public class CreateTransactionRequest
    {
        public string? LoaiGoi { get; set; }
        public decimal SoTien { get; set; }
        public string? NoiDungChuyenKhoan { get; set; }
        public string? MaQR { get; set; }
        public Microsoft.AspNetCore.Http.IFormFile? MinhChungFile { get; set; }
    }

    public class ApproveTransactionRequest
    {
        public string TrangThai { get; set; } = string.Empty; // ThanhCong / TuChoi
    }

    public class TransactionResponse
    {
        public Guid Id { get; set; }
        public Guid NguoiDungId { get; set; }
        public string NguoiDungTen { get; set; } = string.Empty;
        public string NguoiDungPhone { get; set; } = string.Empty;
        public string NguoiDungEmail { get; set; } = string.Empty;
        public string LoaiGoi { get; set; } = string.Empty;
        public decimal SoTien { get; set; }
        public string NoiDungChuyenKhoan { get; set; } = string.Empty;
        public string MaQR { get; set; } = string.Empty;
        public string TrangThai { get; set; } = string.Empty;
        public string? MinhChung { get; set; }
        public DateTime NgayTao { get; set; }
        public DateTime? NgayDuyet { get; set; }
        public string? NguoiDuyetTen { get; set; }
    }
}
