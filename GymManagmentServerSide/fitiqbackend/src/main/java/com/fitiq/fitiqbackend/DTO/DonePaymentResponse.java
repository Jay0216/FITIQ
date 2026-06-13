package com.fitiq.fitiqbackend.DTO;

import com.fitiq.fitiqbackend.Models.PaymentMethods;
import com.fitiq.fitiqbackend.Models.PaymentTransaction;

public class DonePaymentResponse {
    private PaymentTransaction transaction;
    private PaymentMethods paymentMethod;

    public DonePaymentResponse(PaymentTransaction transaction, PaymentMethods paymentMethod) {
        this.transaction = transaction;
        this.paymentMethod = paymentMethod;
    }

    public PaymentTransaction getTransaction() { return transaction; }
    public PaymentMethods getPaymentMethod() { return paymentMethod; }
}
