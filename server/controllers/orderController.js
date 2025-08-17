import Product from "../models/product.js";
import Order from "../models/Order.js";
import stripe from "stripe";
import User from "../models/User.js";

// ========================
// Place Order COD : /api/order/cod
// ========================
export const placeOrderCOD = async (req, res) => {
  try {
    const { items, address } = req.body;
    const userId = req.user._id; // ✅ from middleware

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }
      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // tax

    await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "COD",
    });

    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    console.error("placeOrderCOD Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ========================
// Place Order Stripe : /api/order/stripe
// ========================
export const placeOrderStripe = async (req, res) => {
  try {
    const { items, address } = req.body;
    const { origin } = req.headers;
    const userId = req.user._id; // ✅ from middleware

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }

      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });

      amount += product.offerPrice * item.quantity;
    }

    amount += Math.floor(amount * 0.02); // tax

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    // Stripe init
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const line_items = productData.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100, // ✅ only price per unit, tax already included in order amount
      },
      quantity: item.quantity,
    }));

    const session = await stripeInstance.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId: userId.toString(),
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("placeOrderStripe Error:", error);
    return res.json({ success: false, message: error.message });
  }
};

// ========================
// Stripe Webhook : /api/order/stripe/webhook
// ========================
export const stripeWebhook = async (req, res) => {
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // ⚠️ make sure express raw body middleware is used for Stripe webhook
    event = stripeInstance.webhooks.constructEvent(
      req.rawBody || req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!session.data.length) break;

        const { orderId, userId } = session.data[0].metadata;

        await Order.findByIdAndUpdate(orderId, { isPaid: true });
        await User.findByIdAndUpdate(userId, { cartItems: {} });
        break;
      }
      case "payment_intent.failed": {
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;

        const session = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntentId,
        });

        if (!session.data.length) break;

        const { orderId } = session.data[0].metadata;
        await Order.findByIdAndDelete(orderId);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("stripeWebhook Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Get Orders by User : /api/order/user
// ========================
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("getUserOrders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ========================
// Get All Orders : /api/order/seller
// ========================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    console.error("getAllOrders Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
