using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTro_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMinhChungToTransaction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MinhChung",
                table: "GiaoDich",
                type: "longtext",
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MinhChung",
                table: "GiaoDich");
        }
    }
}
