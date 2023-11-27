require("dotenv").config();

const pool = require("../db");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;

async function handleSubscriptionUpdate(
  email,
  priceId,
  status,
  startDate,
  endDate
) {
  if (!email || !priceId) return;
  try {
    await pool.query(
      `
      UPDATE users
      SET subscription_id = (
          SELECT id
          FROM subscriptions
          WHERE price_id = $1
      ), subscription_status = $2, subscription_start_date = $3, subscription_end_date = $4
      WHERE email = $5`,
      [priceId, status, startDate, endDate, email]
    );

    console.log(
      "Updated user subscription for user " +
        email +
        " with status " +
        status +
        " for price id " +
        priceId
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

  console.log("Event type: " + event.type);
  let email, customer, dataObject, startDate, endDate, priceId;
  try {
    switch (event.type) {
      case "invoice.paid":
      case "invoice.payment_succeeded":
        dataObject = event.data.object;
        // console.log(dataObject.lines.data);
        customer = await stripe.customers.retrieve(dataObject.customer);
        email = customer.email;
        priceId = dataObject.lines.data[0]?.price?.id;
        startDate = new Date(dataObject.lines.data[0].period.start * 1000)
          .toISOString()
          .slice(0, 10); // Convert UNIX timestamp to Date
        endDate = new Date(dataObject.lines.data[0].period.end * 1000)
          .toISOString()
          .slice(0, 10); // Convert UNIX timestamp to Date

        await handleSubscriptionUpdate(
          email,
          priceId,
          dataObject.status,
          startDate,
          endDate
        );
        console.log(`${event.type}: ${dataObject.status}`);
        break;

      case "invoice.payment_failed":
        dataObject = event.data.object;
        customer = await stripe.customers.retrieve(dataObject.customer);
        email = customer.email;
        subscriptionId = dataObject.id;
        // Set end date to current date as the subscription is not payed
        endDate = new Date().toISOString().slice(0, 10);

        await handleSubscriptionUpdate(
          email,
          subscriptionId,
          "payment_failed",
          null,
          endDate
        );
        console.log(`${event.type}: ${dataObject.status}`);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        dataObject = event.data.object;
        // console.log(dataObject);
        customer = await stripe.customers.retrieve(dataObject.customer);
        email = customer.email;
        // Extract priceId from the appropriate path in the subscription object
        // Adjust the path as per your data structure
        priceId = dataObject.items.data[0]?.price?.id;
        startDate = new Date(dataObject.current_period_start * 1000)
          .toISOString()
          .slice(0, 10); // Convert UNIX timestamp to Date
        endDate = new Date(dataObject.current_period_end * 1000)
          .toISOString()
          .slice(0, 10); // Convert UNIX timestamp to Date

        await handleSubscriptionUpdate(
          email,
          priceId,
          dataObject.status,
          startDate,
          endDate
        );
        console.log(`${event.type}: ${dataObject.status}`);
        break;

      case "customer.subscription.deleted":
        dataObject = event.data.object;
        customer = await stripe.customers.retrieve(dataObject.customer);
        email = customer.email;
        subscriptionId = dataObject.id;
        // Set end date to current date as the subscription is deleted
        endDate = new Date().toISOString().slice(0, 10);

        await handleSubscriptionUpdate(
          email,
          subscriptionId,
          "cancelled",
          null,
          endDate
        );
        console.log(`${event.type}: ${dataObject.status}`);
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
