import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("zaiko_session");

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { authenticated: false, error: "No active session found." },
        { status: 401 }
      );
    }

    const payload = verifyToken(sessionCookie.value);

    if (!payload) {
      return NextResponse.json(
        { authenticated: false, error: "Invalid or expired session token." },
        { status: 401 }
      );
    }

    // Retrieve user details from database, including wallet
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        wallet: true,
        restaurants: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { authenticated: false, error: "User not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        wallet: user.wallet ? { balance: user.wallet.balance } : null,
        restaurants: user.restaurants.map((r) => ({
          id: r.id,
          name: r.name,
          cuisine: r.cuisine,
          isApproved: r.isApproved,
        })),
      },
    });
  } catch (error: any) {
    console.error("Session Retrieval Error:", error);
    return NextResponse.json(
      { error: "Internal server error during session retrieval." },
      { status: 500 }
    );
  }
}
