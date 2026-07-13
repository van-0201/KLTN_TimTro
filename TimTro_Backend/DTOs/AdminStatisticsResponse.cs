using System.Threading.Tasks;

namespace TimTro_Backend.DTOs
{
    public class AdminStatisticsResponse
    {
        public int TongNguoiDung { get; set; }
        public int NguoiDungMoiThangNay { get; set; }
        public int TongBaiDang { get; set; }
        public int BaiDangChoDuyet { get; set; }
        public int TongBaoCaoChoXuLy { get; set; }
        public decimal DoanhThuThangNay { get; set; }
        
        public int NguoiThueCount { get; set; }
        public int ChuTroCount { get; set; }
        public int ModeratorCount { get; set; }
    }
}
