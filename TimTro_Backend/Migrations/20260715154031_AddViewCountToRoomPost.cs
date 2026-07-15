using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTro_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddViewCountToRoomPost : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "LuotXem",
                table: "BaiDangPhongTro",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LuotXem",
                table: "BaiDangPhongTro");
        }
    }
}
