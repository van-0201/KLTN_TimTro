using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTro_Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateModeratorDeleteBehavior : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaiDangPhongTro_TaiKhoan_MaNguoiDuyet",
                table: "BaiDangPhongTro");

            migrationBuilder.DropForeignKey(
                name: "FK_BaoCaoViPham_TaiKhoan_MaNguoiKiemDuyetXuLy",
                table: "BaoCaoViPham");

            migrationBuilder.DropForeignKey(
                name: "FK_GiaoDich_TaiKhoan_MaNguoiDuyet",
                table: "GiaoDich");

            migrationBuilder.AddForeignKey(
                name: "FK_BaiDangPhongTro_TaiKhoan_MaNguoiDuyet",
                table: "BaiDangPhongTro",
                column: "MaNguoiDuyet",
                principalTable: "TaiKhoan",
                principalColumn: "MaNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BaoCaoViPham_TaiKhoan_MaNguoiKiemDuyetXuLy",
                table: "BaoCaoViPham",
                column: "MaNguoiKiemDuyetXuLy",
                principalTable: "TaiKhoan",
                principalColumn: "MaNguoiDung",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GiaoDich_TaiKhoan_MaNguoiDuyet",
                table: "GiaoDich",
                column: "MaNguoiDuyet",
                principalTable: "TaiKhoan",
                principalColumn: "MaNguoiDung",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BaiDangPhongTro_TaiKhoan_MaNguoiDuyet",
                table: "BaiDangPhongTro");

            migrationBuilder.DropForeignKey(
                name: "FK_BaoCaoViPham_TaiKhoan_MaNguoiKiemDuyetXuLy",
                table: "BaoCaoViPham");

            migrationBuilder.DropForeignKey(
                name: "FK_GiaoDich_TaiKhoan_MaNguoiDuyet",
                table: "GiaoDich");

            migrationBuilder.AddForeignKey(
                name: "FK_BaiDangPhongTro_TaiKhoan_MaNguoiDuyet",
                table: "BaiDangPhongTro",
                column: "MaNguoiDuyet",
                principalTable: "TaiKhoan",
                principalColumn: "MaNguoiDung",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_BaoCaoViPham_TaiKhoan_MaNguoiKiemDuyetXuLy",
                table: "BaoCaoViPham",
                column: "MaNguoiKiemDuyetXuLy",
                principalTable: "TaiKhoan",
                principalColumn: "MaNguoiDung",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_GiaoDich_TaiKhoan_MaNguoiDuyet",
                table: "GiaoDich",
                column: "MaNguoiDuyet",
                principalTable: "TaiKhoan",
                principalColumn: "MaNguoiDung",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
