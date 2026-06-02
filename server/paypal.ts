import paypal from "@paypal/checkout-server-sdk";

function getEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  if (process.env.PAYPAL_ENVIRONMENT === "production") {
    return new paypal.core.LiveEnvironment(clientId, clientSecret);
  }
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

function getClient(): paypal.core.PayPalHttpClient | null {
  const env = getEnvironment();
  if (!env) return null;
  return new paypal.core.PayPalHttpClient(env);
}

export async function createOrder(amount: number, currency: string = "USD"): Promise<{ id: string; status: string } | null> {
  const client = getClient();
  if (!client) {
    console.warn("PayPal not configured — returning simulated order");
    return { id: `SIM-${Date.now()}`, status: "CREATED" };
  }

  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2),
      },
    }],
  });

  const response = await client.execute(request);
  return {
    id: response.result.id,
    status: response.result.status,
  };
}

export async function captureOrder(orderId: string): Promise<{ id: string; status: string; captureId?: string } | null> {
  const client = getClient();
  if (!client) {
    console.warn("PayPal not configured — returning simulated capture");
    return { id: orderId, status: "COMPLETED", captureId: `CAP-${Date.now()}` };
  }

  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  const response = await client.execute(request);
  const capture = response.result.purchase_units?.[0]?.payments?.captures?.[0];

  return {
    id: response.result.id,
    status: response.result.status,
    captureId: capture?.id,
  };
}

export async function verifyWebhook(headers: Record<string, string>, body: string): Promise<boolean> {
  const client = getClient();
  if (!client) return true;

  try {
    const request = new paypal.notifications.VerifyWebhookSignature();
    request.requestBody({
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: process.env.PAYPAL_WEBHOOK_ID || "",
      webhook_event: JSON.parse(body),
    });
    const response = await client.execute(request);
    return response.result.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}
