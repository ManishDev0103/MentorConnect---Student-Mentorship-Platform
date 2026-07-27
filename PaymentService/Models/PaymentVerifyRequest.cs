namespace PaymentService.Models;

public class PaymentVerifyRequest
{
    public long StudentId { get; set; }
    public int PlanId { get; set; }
    public long? SessionId { get; set; }
    public decimal Amount { get; set; }

    public string RazorpayOrderId { get; set; } = "";
    public string RazorpayPaymentId { get; set; } = "";
}
