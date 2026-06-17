import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

// Helper to get active session
async function getSession(req: NextRequest) {
  const sessionCookie = req.cookies.get("zaiko_session");
  if (!sessionCookie || !sessionCookie.value) return null;
  return verifyToken(sessionCookie.value);
}

// GET: Fetch role-based orders
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { role, userId } = session;

    let orders: any[] = [];

    if (role === "CUSTOMER") {
      orders = await prisma.order.findMany({
        where: { customerId: userId },
        include: {
          restaurant: true,
          deliveryPartner: true,
          orderItems: {
            include: { menuItem: true },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "RESTAURANT_OWNER") {
      // Find restaurants owned by this user
      const ownedRestaurants = await prisma.restaurant.findMany({
        where: { ownerId: userId },
      });
      const restIds = ownedRestaurants.map((r) => r.id);

      orders = await prisma.order.findMany({
        where: { restaurantId: { in: restIds } },
        include: {
          customer: true,
          deliveryPartner: true,
          orderItems: {
            include: { menuItem: true },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "DELIVERY_PARTNER") {
      // Find orders assigned to this rider OR unassigned orders placed/accepted
      orders = await prisma.order.findMany({
        where: {
          OR: [
            { deliveryPartnerId: userId },
            {
              deliveryPartnerId: null,
              status: { in: ["PLACED", "ACCEPTED"] },
            },
          ],
        },
        include: {
          restaurant: true,
          customer: true,
          orderItems: {
            include: { menuItem: true },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (role === "ADMIN") {
      orders = await prisma.order.findMany({
        include: {
          customer: true,
          restaurant: true,
          deliveryPartner: true,
          orderItems: {
            include: { menuItem: true },
          },
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("Fetch Orders Error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching orders." },
      { status: 500 }
    );
  }
}

// POST: Place a new order
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const {
      restaurantId,
      items, // array of { menuItemId, quantity, price }
      deliveryFee,
      discount,
      paymentMethod,
      address,
      latitude,
      longitude,
    } = await req.json();

    if (!restaurantId || !items || !items.length || !address) {
      return NextResponse.json(
        { error: "Missing required order details (restaurant, items, or delivery address)." },
        { status: 400 }
      );
    }

    const customerId = session.userId;

    // Validate restaurant
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found." }, { status: 404 });
    }

    // Calculate totals
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.quantity * item.price;
    }

    const finalDeliveryFee = parseFloat(deliveryFee) || 0;
    const finalDiscount = parseFloat(discount) || 0;
    const total = Math.max(0, subtotal + finalDeliveryFee - finalDiscount);

    // Generate random 4-digit OTP for delivery verification
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // Check wallet balance if payment is WALLET
    if (paymentMethod === "WALLET") {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: customerId },
      });
      if (!wallet || wallet.balance < total) {
        return NextResponse.json(
          { error: `Insufficient wallet balance. Total is ₹${total}, but your balance is ₹${wallet ? wallet.balance : 0}.` },
          { status: 400 }
        );
      }

      // Deduct wallet balance
      await prisma.wallet.update({
        where: { userId: customerId },
        data: { balance: { decrement: total } },
      });
    }

    // Create order, order items, and payment transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create order
      const newOrder = await tx.order.create({
        data: {
          customerId,
          restaurantId,
          status: "PLACED",
          subtotal,
          deliveryFee: finalDeliveryFee,
          discount: finalDiscount,
          total,
          address,
          latitude: parseFloat(latitude) || restaurant.latitude + 0.01,
          longitude: parseFloat(longitude) || restaurant.longitude + 0.01,
          otpCode,
        },
      });

      // 2. Create order items
      for (const item of items) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
          },
        });
      }

      // 3. Create payment record
      await tx.payment.create({
        data: {
          orderId: newOrder.id,
          amount: total,
          paymentMethod: paymentMethod || "UPI",
          status: paymentMethod === "WALLET" ? "COMPLETED" : "PENDING",
          transactionId: "TXN_" + Math.random().toString(36).substring(2, 12).toUpperCase(),
        },
      });

      // 4. Create customer notification
      await tx.notification.create({
        data: {
          userId: customerId,
          title: "Order Placed Successfully! 🍳",
          message: `Your order at ${restaurant.name} has been placed. Total: ₹${total}.`,
        },
      });

      return newOrder;
    });

    // Broadcast update via simulated in-memory order events (if SSE is set up)
    // We will save global list of listeners later or implement a local message broker.
    // For now we'll write it directly to SQLite.
    return NextResponse.json({
      success: true,
      message: "Order placed successfully.",
      orderId: order.id,
      otpCode,
    });
  } catch (error: any) {
    console.error("Create Order Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during order placement." },
      { status: 500 }
    );
  }
}
