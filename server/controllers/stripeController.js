require("dotenv").config();

const pool = require("../db");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;

async function updateSubscription(email, priceId) {
  if (!email || !priceId) return;
  try {
    await pool.query(
      `
      UPDATE users
      SET subscription_id = (
          SELECT id
          FROM subscriptions
          WHERE stripelink = $1
      )
      WHERE email = $2`,
      [priceId, email]
    );
  } catch (err) {
    console.error("Database Error:", err);
  }
}

const webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  let priceId;
  let email;
  let invoiceData;
  let customer;

  try {
    switch (event.type) {
      case "invoice.paid":
      // invoiceData = event.data.object;
      // customer = await stripe.customers.retrieve(invoiceData.customer);
      // priceId = invoiceData.lines.data[1]?.price?.id;
      // email = customer?.email;

      // await updateSubscription(email, priceId);
      // break;
      case "invoice.payment_succeeded":
        invoiceData = event.data.object;
        customer = await stripe.customers.retrieve(invoiceData.customer);
        priceId = invoiceData.lines.data[1]?.price?.id;
        email = customer?.email;

        await updateSubscription(email, priceId);
        break;
    }
  } catch (err) {
    console.error("Error in webhook:", err);
  }

  res.send();
};

module.exports = {
  webhook,
};
