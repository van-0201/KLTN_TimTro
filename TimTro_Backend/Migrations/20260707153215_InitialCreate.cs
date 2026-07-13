using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTro_Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterDatabase()
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "TaiKhoan",
                columns: table => new
                {
                    MaNguoiDung = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    HoTen = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Email = table.Column<string>(type: "varchar(255)", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SoDienThoai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MatKhauBam = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    VaiTro = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TrangThaiTaiKhoan = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    NgayHetHanDichVu = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaiKhoan", x => x.MaNguoiDung);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "BaiDangPhongTro",
                columns: table => new
                {
                    MaBaiDang = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaChuTro = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TieuDe = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MoTaChiTiet = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    GiaThue = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    DienTich = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    DiaChiChiTiet = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ViDoThucTe = table.Column<double>(type: "double", nullable: false),
                    KinhDoThucTe = table.Column<double>(type: "double", nullable: false),
                    LoaiBaiDang = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TrangThaiPhong = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TrangThaiKiemDuyet = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MaNguoiDuyet = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaiDangPhongTro", x => x.MaBaiDang);
                    table.ForeignKey(
                        name: "FK_BaiDangPhongTro_TaiKhoan_MaChuTro",
                        column: x => x.MaChuTro,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BaiDangPhongTro_TaiKhoan_MaNguoiDuyet",
                        column: x => x.MaNguoiDuyet,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "GiaoDich",
                columns: table => new
                {
                    MaGiaoDich = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaNguoiDung = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    LoaiGoi = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SoTien = table.Column<decimal>(type: "decimal(65,30)", nullable: false),
                    NoiDungChuyenKhoan = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MaQR = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TrangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MaNguoiDuyet = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    NgayTao = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    NgayDuyet = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GiaoDich", x => x.MaGiaoDich);
                    table.ForeignKey(
                        name: "FK_GiaoDich_TaiKhoan_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GiaoDich_TaiKhoan_MaNguoiDuyet",
                        column: x => x.MaNguoiDuyet,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HoSoOGhep",
                columns: table => new
                {
                    MaHoSo = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaNguoiDung = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DaCoPhong = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TieuChiLoiSong = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ViDoMucTieu = table.Column<double>(type: "double", nullable: true),
                    KinhDoMucTieu = table.Column<double>(type: "double", nullable: true),
                    BanKinhTimKiemToiDa = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HoSoOGhep", x => x.MaHoSo);
                    table.ForeignKey(
                        name: "FK_HoSoOGhep_TaiKhoan_MaNguoiDung",
                        column: x => x.MaNguoiDung,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "YeuCauGhepNoi",
                columns: table => new
                {
                    MaYeuCau = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaNguoiGui = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaNguoiNhan = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TrangThai = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NgayTao = table.Column<DateTime>(type: "datetime(6)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_YeuCauGhepNoi", x => x.MaYeuCau);
                    table.ForeignKey(
                        name: "FK_YeuCauGhepNoi_TaiKhoan_MaNguoiGui",
                        column: x => x.MaNguoiGui,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_YeuCauGhepNoi_TaiKhoan_MaNguoiNhan",
                        column: x => x.MaNguoiNhan,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "BaoCaoViPham",
                columns: table => new
                {
                    MaBaoCao = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaNguoiGui = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaBaiDangBiBaoCao = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    MaTaiKhoanBiBaoCao = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LyDoPhanAnh = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DuongDanMinhChung = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TrangThaiXuLy = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MaNguoiKiemDuyetXuLy = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BaoCaoViPham", x => x.MaBaoCao);
                    table.ForeignKey(
                        name: "FK_BaoCaoViPham_BaiDangPhongTro_MaBaiDangBiBaoCao",
                        column: x => x.MaBaiDangBiBaoCao,
                        principalTable: "BaiDangPhongTro",
                        principalColumn: "MaBaiDang",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BaoCaoViPham_TaiKhoan_MaNguoiGui",
                        column: x => x.MaNguoiGui,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BaoCaoViPham_TaiKhoan_MaNguoiKiemDuyetXuLy",
                        column: x => x.MaNguoiKiemDuyetXuLy,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_BaoCaoViPham_TaiKhoan_MaTaiKhoanBiBaoCao",
                        column: x => x.MaTaiKhoanBiBaoCao,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "HinhAnhPhongTro",
                columns: table => new
                {
                    MaHinhAnh = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaBaiDang = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    DuongDanHinhAnh = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    MaDinhDanhCloudinary = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HinhAnhPhongTro", x => x.MaHinhAnh);
                    table.ForeignKey(
                        name: "FK_HinhAnhPhongTro_BaiDangPhongTro_MaBaiDang",
                        column: x => x.MaBaiDang,
                        principalTable: "BaiDangPhongTro",
                        principalColumn: "MaBaiDang",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "LichHen",
                columns: table => new
                {
                    MaLichHen = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaNguoiKhoiTao = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaNguoiNhanHen = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    MaBaiDangLienKet = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    LoaiLichHen = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ThoiGianHen = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    DiaDiemHen = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TrangThaiLichHen = table.Column<string>(type: "longtext", nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichHen", x => x.MaLichHen);
                    table.ForeignKey(
                        name: "FK_LichHen_BaiDangPhongTro_MaBaiDangLienKet",
                        column: x => x.MaBaiDangLienKet,
                        principalTable: "BaiDangPhongTro",
                        principalColumn: "MaBaiDang",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_LichHen_TaiKhoan_MaNguoiKhoiTao",
                        column: x => x.MaNguoiKhoiTao,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LichHen_TaiKhoan_MaNguoiNhanHen",
                        column: x => x.MaNguoiNhanHen,
                        principalTable: "TaiKhoan",
                        principalColumn: "MaNguoiDung",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_BaiDangPhongTro_MaChuTro",
                table: "BaiDangPhongTro",
                column: "MaChuTro");

            migrationBuilder.CreateIndex(
                name: "IX_BaiDangPhongTro_MaNguoiDuyet",
                table: "BaiDangPhongTro",
                column: "MaNguoiDuyet");

            migrationBuilder.CreateIndex(
                name: "IX_BaoCaoViPham_MaBaiDangBiBaoCao",
                table: "BaoCaoViPham",
                column: "MaBaiDangBiBaoCao");

            migrationBuilder.CreateIndex(
                name: "IX_BaoCaoViPham_MaNguoiGui",
                table: "BaoCaoViPham",
                column: "MaNguoiGui");

            migrationBuilder.CreateIndex(
                name: "IX_BaoCaoViPham_MaNguoiKiemDuyetXuLy",
                table: "BaoCaoViPham",
                column: "MaNguoiKiemDuyetXuLy");

            migrationBuilder.CreateIndex(
                name: "IX_BaoCaoViPham_MaTaiKhoanBiBaoCao",
                table: "BaoCaoViPham",
                column: "MaTaiKhoanBiBaoCao");

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDich_MaNguoiDung",
                table: "GiaoDich",
                column: "MaNguoiDung");

            migrationBuilder.CreateIndex(
                name: "IX_GiaoDich_MaNguoiDuyet",
                table: "GiaoDich",
                column: "MaNguoiDuyet");

            migrationBuilder.CreateIndex(
                name: "IX_HinhAnhPhongTro_MaBaiDang",
                table: "HinhAnhPhongTro",
                column: "MaBaiDang");

            migrationBuilder.CreateIndex(
                name: "IX_HoSoOGhep_MaNguoiDung",
                table: "HoSoOGhep",
                column: "MaNguoiDung",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LichHen_MaBaiDangLienKet",
                table: "LichHen",
                column: "MaBaiDangLienKet");

            migrationBuilder.CreateIndex(
                name: "IX_LichHen_MaNguoiKhoiTao",
                table: "LichHen",
                column: "MaNguoiKhoiTao");

            migrationBuilder.CreateIndex(
                name: "IX_LichHen_MaNguoiNhanHen",
                table: "LichHen",
                column: "MaNguoiNhanHen");

            migrationBuilder.CreateIndex(
                name: "IX_TaiKhoan_Email",
                table: "TaiKhoan",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauGhepNoi_MaNguoiGui",
                table: "YeuCauGhepNoi",
                column: "MaNguoiGui");

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauGhepNoi_MaNguoiNhan",
                table: "YeuCauGhepNoi",
                column: "MaNguoiNhan");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BaoCaoViPham");

            migrationBuilder.DropTable(
                name: "GiaoDich");

            migrationBuilder.DropTable(
                name: "HinhAnhPhongTro");

            migrationBuilder.DropTable(
                name: "HoSoOGhep");

            migrationBuilder.DropTable(
                name: "LichHen");

            migrationBuilder.DropTable(
                name: "YeuCauGhepNoi");

            migrationBuilder.DropTable(
                name: "BaiDangPhongTro");

            migrationBuilder.DropTable(
                name: "TaiKhoan");
        }
    }
}
