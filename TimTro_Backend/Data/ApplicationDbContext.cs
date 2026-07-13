using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using TimTro_Backend.Models;

namespace TimTro_Backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<RoommateProfile> RoommateProfiles { get; set; }
        public DbSet<RoomPost> RoomPosts { get; set; }
        public DbSet<RoomImage> RoomImages { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<MatchRequest> MatchRequests { get; set; }
        public DbSet<Notification> Notifications { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User -> TaiKhoan
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("TaiKhoan");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaNguoiDung");
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // RoommateProfile -> HoSoOGhep
            modelBuilder.Entity<RoommateProfile>(entity =>
            {
                entity.ToTable("HoSoOGhep");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaHoSo");
                entity.Property(e => e.UserId).HasColumnName("MaNguoiDung");
                entity.HasOne(e => e.User).WithOne(u => u.RoommateProfile).HasForeignKey<RoommateProfile>(e => e.UserId).OnDelete(DeleteBehavior.Cascade);
            });

            // RoomPost -> BaiDangPhongTro
            modelBuilder.Entity<RoomPost>(entity =>
            {
                entity.ToTable("BaiDangPhongTro");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaBaiDang");
                entity.Property(e => e.ChuTroId).HasColumnName("MaChuTro");
                entity.Property(e => e.NguoiDuyetId).HasColumnName("MaNguoiDuyet");
                entity.HasOne(e => e.ChuTro).WithMany(u => u.RoomPosts).HasForeignKey(e => e.ChuTroId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.NguoiDuyet).WithMany().HasForeignKey(e => e.NguoiDuyetId).OnDelete(DeleteBehavior.SetNull);
            });

            // RoomImage -> HinhAnhPhongTro
            modelBuilder.Entity<RoomImage>(entity =>
            {
                entity.ToTable("HinhAnhPhongTro");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaHinhAnh");
                entity.Property(e => e.RoomPostId).HasColumnName("MaBaiDang");
                entity.HasOne(e => e.RoomPost).WithMany(p => p.RoomImages).HasForeignKey(e => e.RoomPostId).OnDelete(DeleteBehavior.Cascade);
            });

            // Appointment -> LichHen
            modelBuilder.Entity<Appointment>(entity =>
            {
                entity.ToTable("LichHen");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaLichHen");
                entity.Property(e => e.NguoiKhoiTaoId).HasColumnName("MaNguoiKhoiTao");
                entity.Property(e => e.NguoiNhanHenId).HasColumnName("MaNguoiNhanHen");
                entity.Property(e => e.RoomPostId).HasColumnName("MaBaiDangLienKet");

                entity.HasOne(e => e.NguoiKhoiTao).WithMany(u => u.CreatedAppointments).HasForeignKey(e => e.NguoiKhoiTaoId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.NguoiNhanHen).WithMany(u => u.ReceivedAppointments).HasForeignKey(e => e.NguoiNhanHenId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.RoomPost).WithMany(p => p.Appointments).HasForeignKey(e => e.RoomPostId).OnDelete(DeleteBehavior.SetNull);
            });

            // Report -> BaoCaoViPham
            modelBuilder.Entity<Report>(entity =>
            {
                entity.ToTable("BaoCaoViPham");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaBaoCao");
                entity.Property(e => e.NguoiGuiId).HasColumnName("MaNguoiGui");
                entity.Property(e => e.BaiDangBiBaoCaoId).HasColumnName("MaBaiDangBiBaoCao");
                entity.Property(e => e.TaiKhoanBiBaoCaoId).HasColumnName("MaTaiKhoanBiBaoCao");
                entity.Property(e => e.NguoiKiemDuyetXuLyId).HasColumnName("MaNguoiKiemDuyetXuLy");
                entity.Property(e => e.DuongDanMinhChung).HasColumnName("DuongDanMinhChung").HasDefaultValue("[]");
                entity.Property(e => e.NgayTao).HasColumnName("NgayTao").HasDefaultValueSql("CURRENT_TIMESTAMP(6)");

                entity.HasOne(e => e.NguoiGui).WithMany(u => u.SentReports).HasForeignKey(e => e.NguoiGuiId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.TaiKhoanBiBaoCao).WithMany(u => u.ReceivedReports).HasForeignKey(e => e.TaiKhoanBiBaoCaoId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.NguoiKiemDuyetXuLy).WithMany(u => u.ProcessedReports).HasForeignKey(e => e.NguoiKiemDuyetXuLyId).OnDelete(DeleteBehavior.SetNull);
                entity.HasOne(e => e.BaiDangBiBaoCao).WithMany(p => p.Reports).HasForeignKey(e => e.BaiDangBiBaoCaoId).OnDelete(DeleteBehavior.SetNull);
            });

            // Transaction -> GiaoDich
            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.ToTable("GiaoDich");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaGiaoDich");
                entity.Property(e => e.NguoiDungId).HasColumnName("MaNguoiDung");
                entity.Property(e => e.NguoiDuyetId).HasColumnName("MaNguoiDuyet");

                entity.HasOne(e => e.NguoiDung).WithMany(u => u.Transactions).HasForeignKey(e => e.NguoiDungId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.NguoiDuyet).WithMany(u => u.ProcessedTransactions).HasForeignKey(e => e.NguoiDuyetId).OnDelete(DeleteBehavior.SetNull);
            });

            // MatchRequest -> YeuCauGhepNoi
            modelBuilder.Entity<MatchRequest>(entity =>
            {
                entity.ToTable("YeuCauGhepNoi");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaYeuCau");
                entity.Property(e => e.NguoiGuiId).HasColumnName("MaNguoiGui");
                entity.Property(e => e.NguoiNhanId).HasColumnName("MaNguoiNhan");

                entity.HasOne(e => e.NguoiGui).WithMany(u => u.SentMatchRequests).HasForeignKey(e => e.NguoiGuiId).OnDelete(DeleteBehavior.Restrict);
                entity.HasOne(e => e.NguoiNhan).WithMany(u => u.ReceivedMatchRequests).HasForeignKey(e => e.NguoiNhanId).OnDelete(DeleteBehavior.Restrict);
            });

            // Notification -> ThongBao
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("ThongBao");
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).HasColumnName("MaThongBao");
                entity.Property(e => e.MaNguoiDung).HasColumnName("MaNguoiDung");
                entity.Property(e => e.NoiDung).HasColumnName("NoiDung");
                entity.Property(e => e.DaDoc).HasColumnName("DaDoc");
                entity.Property(e => e.NgayTao).HasColumnName("NgayTao");

                entity.HasOne(e => e.NguoiDung).WithMany(u => u.Notifications).HasForeignKey(e => e.MaNguoiDung).OnDelete(DeleteBehavior.Cascade);
            });
        }

        /// <summary>
        /// Cấu hình toàn cục: Mọi DateTime đọc từ DB đều được gắn nhãn UTC,
        /// đảm bảo JSON API trả ra đuôi 'Z' để Frontend hiển thị đúng múi giờ.
        /// </summary>
        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            // Converter cho DateTime: ép Kind = Utc khi đọc từ DB
            configurationBuilder
                .Properties<DateTime>()
                .HaveConversion<UtcDateTimeConverter>();

            // Converter cho DateTime? (nullable)
            configurationBuilder
                .Properties<DateTime?>()
                .HaveConversion<NullableUtcDateTimeConverter>();
        }
    }

    /// <summary>Chuyển đổi DateTime: lưu xuống DB giữ nguyên, đọc lên gắn Kind = Utc.</summary>
    public class UtcDateTimeConverter : ValueConverter<DateTime, DateTime>
    {
        public UtcDateTimeConverter() : base(
            v => v.Kind == DateTimeKind.Utc ? v : v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc))
        { }
    }

    /// <summary>Phiên bản nullable của UtcDateTimeConverter.</summary>
    public class NullableUtcDateTimeConverter : ValueConverter<DateTime?, DateTime?>
    {
        public NullableUtcDateTimeConverter() : base(
            v => v.HasValue ? (v.Value.Kind == DateTimeKind.Utc ? v : v.Value.ToUniversalTime()) : v,
            v => v.HasValue ? DateTime.SpecifyKind(v.Value, DateTimeKind.Utc) : v)
        { }
    }
}
