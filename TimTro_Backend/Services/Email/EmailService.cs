using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;
using System;
using System.Threading.Tasks;

namespace TimTro_Backend.Services.Email
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    var emailSettings = _configuration.GetSection("EmailSettings");
                    var message = new MimeMessage();
                    message.From.Add(new MailboxAddress(emailSettings["SenderName"], emailSettings["SenderEmail"]));
                    message.To.Add(new MailboxAddress("", toEmail));
                    message.Subject = subject;

                    var bodyBuilder = new BodyBuilder { HtmlBody = htmlMessage };
                    message.Body = bodyBuilder.ToMessageBody();

                    using var client = new SmtpClient();
                    await client.ConnectAsync(emailSettings["SmtpServer"], int.Parse(emailSettings["SmtpPort"]), SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(emailSettings["SenderEmail"], emailSettings["Password"]);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }
                catch (Exception ex)
                {
                    // Log exception if necessary, but don't crash the app if email fails
                    Console.WriteLine($"Error sending email to {toEmail}: {ex.Message}");
                }
            });

            return Task.CompletedTask;
        }
    }
}
