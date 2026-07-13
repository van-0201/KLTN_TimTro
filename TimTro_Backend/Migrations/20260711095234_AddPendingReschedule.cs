using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TimTro_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddPendingReschedule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "PendingRescheduleById",
                table: "LichHen",
                type: "char(36)",
                nullable: true,
                collation: "ascii_general_ci");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PendingRescheduleById",
                table: "LichHen");
        }
    }
}
