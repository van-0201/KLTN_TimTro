using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;

namespace TimTro_Backend.DTOs
{
    public class CreateRoomPostRequest
    {
        public string TieuDe { get; set; } = string.Empty;
        public string MoTaChiTiet { get; set; } = string.Empty;
        public decimal GiaThue { get; set; }
        public decimal DienTich { get; set; }
        public string DiaChiChiTiet { get; set; } = string.Empty;
        public double ViDoThucTe { get; set; }
        public double KinhDoThucTe { get; set; }
        public string LoaiBaiDang { get; set; } = string.Empty; // ChoThuePhong / TimNguoiOGhep
        public string TienIch { get; set; } = "[]";
        public List<IFormFile> Images { get; set; } = new List<IFormFile>();
    }

    public class UpdateRoomPostRequest
    {
        public string TieuDe { get; set; } = string.Empty;
        public string MoTaChiTiet { get; set; } = string.Empty;
        public decimal GiaThue { get; set; }
        public decimal DienTich { get; set; }
        public string DiaChiChiTiet { get; set; } = string.Empty;
        public double ViDoThucTe { get; set; }
        public double KinhDoThucTe { get; set; }
        public string LoaiBaiDang { get; set; } = string.Empty;
        public string TrangThaiPhong { get; set; } = string.Empty;
        public bool IsHidden { get; set; } = false;
        public string TienIch { get; set; } = "[]";
        
        public List<IFormFile>? NewImages { get; set; }
        public List<string>? ExistingImages { get; set; }
    }

    public class RoomPostResponse
    {
        public Guid Id { get; set; }
        public Guid ChuTroId { get; set; }
        public string TieuDe { get; set; } = string.Empty;
        public string MoTaChiTiet { get; set; } = string.Empty;
        public decimal GiaThue { get; set; }
        public decimal DienTich { get; set; }
        public string DiaChiChiTiet { get; set; } = string.Empty;
        public double ViDoThucTe { get; set; }
        public double KinhDoThucTe { get; set; }
        public string LoaiBaiDang { get; set; } = string.Empty;
        public string TrangThaiPhong { get; set; } = string.Empty;
        public string TrangThaiKiemDuyet { get; set; } = string.Empty;
        public bool IsHidden { get; set; }
        public string TienIch { get; set; } = "[]";
        public int LuotXem { get; set; }
        
        // Joined info
        public string NguoiDangTen { get; set; } = string.Empty;
        public string NguoiDangPhone { get; set; } = string.Empty;
        
        public List<string> Images { get; set; } = new List<string>();
    }
}
