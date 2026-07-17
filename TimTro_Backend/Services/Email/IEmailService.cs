using System.Threading.Tasks;

namespace TimTro_Backend.Services.Email
{
    public interface IEmailService
    {
        Task SendEmailAsync(string toEmail, string subject, string htmlMessage);
    }
}
