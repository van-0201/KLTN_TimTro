using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTro_Backend.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRoommateConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "NgayDangTimOGhepGanNhat",
                table: "TaiKhoan",
                type: "datetime(6)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayCapNhat",
                table: "LichHen",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "NgayTao",
                table: "LichHen",
                type: "datetime(6)",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "NgayDangTimOGhepGanNhat",
                table: "TaiKhoan");

            migrationBuilder.DropColumn(
                name: "NgayCapNhat",
                table: "LichHen");

            migrationBuilder.DropColumn(
                name: "NgayTao",
                table: "LichHen");
        }
    }
}
