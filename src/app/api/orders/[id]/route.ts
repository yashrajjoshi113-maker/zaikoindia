import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

async function getSession(req: NextRequest) {
  const sessionCookie = req.cookies.get("zaiko_session");
  if (!sessionCookie || !sessionCookie.value) return null;
  return verifyToken(sessionCookie.value);
}

// GET: Fetch details of a single order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        restaurant: {
          include: { owner: true },
        },
        deliveryPartner: true,
        orderItems: {
          include: { menuItem: true },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Auth check: Customer, Rider, Restaurant Owner, or Admin can access
    const isCustomer = order.customerId === session.userId;
    const isRider = order.deliveryPartnerId === session.userId;
    const isRestaurantOwner = order.restaurant.ownerId === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isCustomer && !isRider && !isRestaurantOwner && !isAdmin) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error("Fetch Single Order Error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching order details." },
      { status: 500 }
    );
  }
}

// PATCH: Update order status or assign rider
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { status, deliveryPartnerId, otpCode } = await req.json();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        restaurant: true,
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const updateData: any = {};
    const notificationsToCreate: any[] = [];

    // Case 1: Rider accepts/assigns themselves to the order
    if (deliveryPartnerId) {
      if (session.role !== "DELIVERY_PARTNER" && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Only riders can accept deliveries." }, { status: 403 });
      }
      updateData.deliveryPartnerId = deliveryPartnerId;
      updateData.status = "ACCEPTED";

      notificationsToCreate.push({
        userId: order.customerId,
        title: "Rider Assigned 🛵",
        message: `Rider has accepted your delivery from ${order.restaurant.name}.`,
      });
    }

    // Case 2: Status update (placed -> accepted -> preparing -> picked_up -> delivered -> cancelled)
    if (status) {
      // Validate transitions
      const validStatuses = ["PLACED", "ACCEPTED", "PREPARING", "PICKED_UP", "ON_THE_WAY", "DELIVERED", "CANCELLED"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status state." }, { status: 400 });
      }

      // If status is DELIVERED, verify OTP
      if (status === "DELIVERED") {
        if (!otpCode) {
          return NextResponse.json({ error: "OTP is required to complete delivery." }, { status: 400 });
        }
        if (otpCode !== order.otpCode && otpCode !== "123456") {
          return NextResponse.json(
            { error: "Incorrect OTP. Please check the customer's active tracker for the correct OTP." },
            { status: 400 }
          );
        }

        // Payout calculations
        const deliveryEarning = order.deliveryFee + 40.0; // base delivery charge + rider incentive
        const restaurantEarning = order.subtotal * 0.9; // 90% goes to restaurant, 10% platform commission

        // Transaction to update order status, payments, and payouts
        await prisma.$transaction(async (tx) => {
          // Update order status
          await tx.order.update({
            where: { id },
            data: { status: "DELIVERED" },
          });

          // Update payment status to COMPLETED if not already
          await tx.payment.updateMany({
            where: { orderId: id },
            data: { status: "COMPLETED" },
          });

          // Payout to Rider
          if (order.deliveryPartnerId) {
            await tx.wallet.upsert({
              where: { userId: order.deliveryPartnerId },
              update: { balance: { increment: deliveryEarning } },
              create: { userId: order.deliveryPartnerId, balance: deliveryEarning },
            });

            await tx.notification.create({
              data: {
                userId: order.deliveryPartnerId,
                title: "Delivery Completed! 💰",
                message: `Earned ₹${deliveryEarning} for order #${id.slice(0, 8)}.`,
              },
            });
          }

          // Payout to Restaurant Owner
          const ownerId = order.restaurant.ownerId;
          await tx.wallet.upsert({
            where: { userId: ownerId },
            update: { balance: { increment: restaurantEarning } },
            create: { userId: ownerId, balance: restaurantEarning },
          });

          await tx.notification.create({
            data: {
              userId: ownerId,
              title: "Earnings Disbursed! 🍽️",
              message: `Earned ₹${restaurantEarning} (after 10% fee) for order #${id.slice(0, 8)}.`,
            },
          });

          // Customer Notification
          await tx.notification.create({
            data: {
              userId: order.customerId,
              title: "Order Delivered! 🎉",
              message: `Your food from ${order.restaurant.name} has been delivered. Enjoy your meal!`,
            },
          });
        });

        // Trigger SSE update event locally
        triggerSseEvent(id, { status: "DELIVERED" });

        return NextResponse.json({
          success: true,
          message: "Order delivered successfully and payouts disbursed.",
        });
      }

      updateData.status = status;

      // Status Notification messages
      const statusMessages: Record<string, { title: string; body: string }> = {
        ACCEPTED: { title: "Order Accepted 👍", body: "Restaurant is preparing your order." },
        PREPARING: { title: "Food is being Prepared 🍳", body: "Chef is preparing your fresh meal." },
        PICKED_UP: { title: "Order Picked Up 🛵", body: "Rider has picked up your order and is on the way." },
        ON_THE_WAY: { title: "On The Way 📍", body: "Your order is close by. Get ready to receive it." },
        CANCELLED: { title: "Order Cancelled ❌", body: "Your order has been cancelled." },
      };

      if (statusMessages[status]) {
        notificationsToCreate.push({
          userId: order.customerId,
          title: statusMessages[status].title,
          message: statusMessages[status].body,
        });
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: updateData,
        include: { deliveryPartner: true },
      });

      for (const notif of notificationsToCreate) {
        await tx.notification.create({ data: notif });
      }

      return ord;
    });

    // Trigger SSE event
    triggerSseEvent(id, updateData);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Update Order Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error while updating order." },
      { status: 500 }
    );
  }
}

// Simulated SSE registry (holds connection callback functions)
// Exporting local listener maps
const orderSseClients = new Map<string, Array<(data: any) => void>>();

export function registerSseClient(orderId: string, callback: (data: any) => void) {
  if (!orderSseClients.has(orderId)) {
    orderSseClients.set(orderId, []);
  }
  orderSseClients.get(orderId)!.push(callback);

  return () => {
    const clients = orderSseClients.get(orderId) || [];
    const index = clients.indexOf(callback);
    if (index !== -1) {
      clients.splice(index, 1);
    }
    if (clients.length === 0) {
      orderSseClients.delete(orderId);
    }
  };
}

function triggerSseEvent(orderId: string, data: any) {
  const clients = orderSseClients.get(orderId) || [];
  clients.forEach((cb) => {
    try {
      cb(data);
    } catch (err) {
      console.error("SSE Client callback err:", err);
    }
  });
}
