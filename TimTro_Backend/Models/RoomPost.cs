using System;
using System.Collections.Generic;

namespace TimTro_Backend.Models
{
    public class RoomPost
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ChuTroId { get; set; }
        public string TieuDe { get; set; }
        public string MoTaChiTiet { get; set; }
        public decimal GiaThue { get; set; }
        public decimal DienTich { get; set; }
        public string DiaChiChiTiet { get; set; }
        public double ViDoThucTe { get; set; }
        public double KinhDoThucTe { get; set; }
        public string LoaiBaiDang { get; set; } // ChoThuePhong / TimNguoiOGhep
        public string TrangThaiPhong { get; set; } // ConTrong / DaChoThue
        public string TrangThaiKiemDuyet { get; set; } // ChoDuyet / DaDuyet / TuChoi // ViPham
        public Guid? NguoiDuyetId { get; set; }
        public bool IsHidden { get; set; } = false;
        public string TienIch { get; set; } = "[]";
        public DateTime NgayTao { get; set; } = DateTime.UtcNow;
        public DateTime? NgayCapNhat { get; set; }

        // Navigation properties
        public User ChuTro { get; set; }
        public User NguoiDuyet { get; set; }
        public ICollection<RoomImage> RoomImages { get; set; }
        public ICollection<Appointment> Appointments { get; set; }
        public ICollection<Report> Reports { get; set; }
    }
}
