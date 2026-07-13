using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTro_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddRoommateGenderBudget : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DaCoPhong",
                table: "HoSoOGhep",
                newName: "IsActive");

            migrationBuilder.AlterColumn<string>(
                name: "TieuChiLoiSong",
                table: "HoSoOGhep",
                type: "longtext",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "longtext")
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "GioiTinh",
                table: "HoSoOGhep",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "GioiTinhMongMuon",
                table: "HoSoOGhep",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<double>(
                name: "NganSachToiDa",
                table: "HoSoOGhep",
                type: "double",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "NganSachToiThieu",
                table: "HoSoOGhep",
                type: "double",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GioiTinh",
                table: "HoSoOGhep");

            migrationBuilder.DropColumn(
                name: "GioiTinhMongMuon",
                table: "HoSoOGhep");

            migrationBuilder.DropColumn(
                name: "NganSachToiDa",
                table: "HoSoOGhep");

            migrationBuilder.DropColumn(
                name: "NganSachToiThieu",
                table: "HoSoOGhep");

            migrationBuilder.RenameColumn(
                name: "IsActive",
                table: "HoSoOGhep",
                newName: "DaCoPhong");

            migrationBuilder.UpdateData(
                table: "HoSoOGhep",
                keyColumn: "TieuChiLoiSong",
                keyValue: null,
                column: "TieuChiLoiSong",
                value: "");

            migrationBuilder.AlterColumn<string>(
                name: "TieuChiLoiSong",
                table: "HoSoOGhep",
                type: "longtext",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "longtext",
                oldNullable: true)
                .Annotation("MySql:CharSet", "utf8mb4")
                .OldAnnotation("MySql:CharSet", "utf8mb4");
        }
    }
}
