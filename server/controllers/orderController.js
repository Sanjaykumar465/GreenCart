import Product from "../models/product.js";
import Order from "../models/Order.js";
import stripe from "stripe";
import User from "../models/User.js";

// Place Order COD : /api/order/cod

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId, items, address } = req.body;

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }
      amount += product.offerPrice * item.quantity; // ✅ now matches schema
    }

    amount += Math.floor(amount * 0.02); // Add tax

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

//Place Order Stripe : /api/order/stripe
export const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, address } = req.body;
    const { origin } = req.headers;

    if (!address || !items || items.length === 0) {
      return res.json({ success: false, message: "Invalid data" });
    }

    let productData = [];
    let amount = 0;
    for (const item of items) {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      if (!product) {
        return res.json({ success: false, message: "Product not found" });
      }
      amount += product.offerPrice * item.quantity; // ✅ now matches schema
    }

    amount += Math.floor(amount * 0.02); // Add tax

    const order = await Order.create({
      userId,
      items,
      amount,
      address,
      paymentType: "Online",
    });

    //Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    //create line items for stripe
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });

    //create stripe session
    const session = await stripeInstance.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("placeOrderCOD Error:", error);
    return res.json({ success: false, message: error.message });
  }
};
// Stripe Webhooks to veryfy payments Actions : /stripe
export const stripeWebhook = async (req, res) => {
  //Stripe Gateway Initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    Response.status(400).send(`Webhook Error: ${error.message}`);
  }
  //Handle the Event
  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      //Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata;
      // Mark pament as paid
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      //clear user cart
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "payment_intent.failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      //Getting Session Metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
      break;
  }
  Response.json({ received: true });
};

// Get Order by User ID : /api/order/user
export const getUserOrders = async (req, res) => {
  try {
    // Assuming authUser sets req.user._id
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

// Get All Orders (for seller / admin) : /api/order/seller
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
