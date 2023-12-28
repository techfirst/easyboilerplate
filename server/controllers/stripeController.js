require("dotenv").config();

const pool = require("../db");
const axios = require("axios");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_ENDPOINT_SECRET;

async function handleCreditUpdate(email, additionalCredits) {
  try {
    await pool.query(
      `
      UPDATE users
      SET credits = credits + $1
      WHERE email = $2`,
      [additionalCredits, email]
    );
    console.log(
      `Updated user credit for ${email} by adding ${additionalCredits} credits`
    );

    await postMessageToSlack(
      `Updated user credit for ${email} by adding ${additionalCredits} credits`
    );
  } catch (err) {
    console.error("Database Error in handleCreditUpdate:", err);
  }
}

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

    await postMessageToSlack(
      "Updated user subscription for user " +
        email +
        " with status " +
        status +
        " for price id " +
        priceId
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

async function postMessageToSlack(message) {
  const webhookUrl = process.env.SLACK_WEBHOOK;
  const slackMessage = {
    text: message,
  };

  try {
    const response = await axios.post(webhookUrl, slackMessage);
    console.log("Message posted to Slack", response.data);
  } catch (error) {
    console.error("Error posting message to Slack", error);
  }
}

const webhook = async (req, res) => {
  console.log("Stripe - Webhook hit!");
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.log(err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log("Event type: " + event.type);
  await postMessageToSlack("Event type: " + event.type);

  let email, customer, dataObject, startDate, endDate, priceId;
  try {
    switch (event.type) {
      case "invoice.paid":
        dataObject = event.data.object;
        customer = await stripe.customers.retrieve(dataObject.customer);
        email = customer.email;
        priceId = dataObject.lines.data[0]?.price?.id;
        startDate = new Date(dataObject.lines.data[0].period.start * 1000)
          .toISOString()
          .slice(0, 10);
        endDate = new Date(dataObject.lines.data[0].period.end * 1000)
          .toISOString()
          .slice(0, 10);

        await handleSubscriptionUpdate(
          email,
          priceId,
          dataObject.status,
          startDate,
          endDate
        );

        await handleCreditUpdate(email, 200);

        console.log(`${event.type}: ${dataObject.status}`);
        await postMessageToSlack(`${event.type}: ${dataObject.status}`);
        break;
      case "invoice.payment_succeeded":
        dataObject = event.data.object;
        customer = await stripe.customers.retrieve(dataObject.customer);
        email = customer.email;
        priceId = dataObject.lines.data[0]?.price?.id;
        startDate = new Date(dataObject.lines.data[0].period.start * 1000)
          .toISOString()
          .slice(0, 10);
        endDate = new Date(dataObject.lines.data[0].period.end * 1000)
          .toISOString()
          .slice(0, 10);

        await handleSubscriptionUpdate(
          email,
          priceId,
          dataObject.status,
          startDate,
          endDate
        );

        console.log(`${event.type}: ${dataObject.status}`);
        await postMessageToSlack(`${event.type}: ${dataObject.status}`);
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
        await postMessageToSlack(`${event.type}: ${dataObject.status}`);
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
        await postMessageToSlack(`${event.type}: ${dataObject.status}`);
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
        await postMessageToSlack(`${event.type}: ${dataObject.status}`);
        break;

      case "checkout.session.completed":
        dataObject = event.data.object;

        // Directly use the email from customer_details
        email = dataObject.customer_details.email;

        if (email) {
          // Get the line items for the session
          lineItems = await stripe.checkout.sessions.listLineItems(
            dataObject.id,
            { limit: 1 }
          );
          priceId = lineItems.data[0].price.id;

          //TODO: Handle this in config file
          console.log("Price ID: " + priceId);
          if (priceId === process.env.STRIPE_ADD_CREDIT_PRICE_ID) {
            // Fetch the product related to the price
            product = await stripe.products.retrieve(
              lineItems.data[0].price.product
            );

            // Get the credits from product metadata
            credits = product.metadata.credits;

            // Update the user's credits if metadata is properly set
            if (credits) {
              await handleCreditUpdate(email, parseInt(credits, 10));
              console.log(
                `One-time purchase completed for ${email}, ${credits} credits added.`
              );

              await postMessageToSlack(
                `One-time purchase completed for ${email}, ${credits} credits added.`
              );
            } else {
              console.log(
                `No credits metadata found for product associated with price ID ${priceId}`
              );

              await postMessageToSlack(
                `No credits metadata found for product associated with price ID ${priceId}`
              );
            }
          }
        } else {
          console.log("E-mail not found in checkout session.");

          await postMessageToSlack("E-mail not found in checkout session.");
        }
        break;
    }
  } catch (err) {
    console.error("Error in webhook:", err);
    await postMessageToSlack("Error in webhook.");
  }

  res.send();
};

module.exports = {
  webhook,
};
