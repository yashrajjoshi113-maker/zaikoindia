import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/jwt";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, role } = await req.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { error: "Phone number and OTP are required." },
        { status: 400 }
      );
    }

    // Clean phone number (digits only)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Verify OTP (demo bypass is 123456)
    if (otp !== "123456") {
      return NextResponse.json(
        { error: "Invalid OTP. Use 123456 for demo mode." },
        { status: 400 }
      );
    }

    // Determine target role (default to CUSTOMER if not specified)
    const validRoles = ["CUSTOMER", "RESTAURANT_OWNER", "DELIVERY_PARTNER", "ADMIN"];
    const finalRole = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : "CUSTOMER";

    // Find user
    let user = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    // If user doesn't exist, auto-register them
    if (!user) {
      const defaultNames: Record<string, string> = {
        CUSTOMER: "Demo Customer",
        DELIVERY_PARTNER: "Demo Rider",
        RESTAURANT_OWNER: "Demo Restaurant Owner",
        ADMIN: "Demo Admin",
      };

      user = await prisma.user.create({
        data: {
          name: defaultNames[finalRole] || "Demo User",
          phone: cleanPhone,
          role: finalRole,
        },
      });

      // Create wallet if Customer or Rider
      if (finalRole === "CUSTOMER" || finalRole === "DELIVERY_PARTNER") {
        await prisma.wallet.create({
          data: {
            userId: user.id,
            balance: finalRole === "CUSTOMER" ? 150.0 : 0.0, // default welcome balance
          },
        });
      }

      // If it is a restaurant owner, auto-create a restaurant for them so they can manage it immediately
      if (finalRole === "RESTAURANT_OWNER") {
        await prisma.restaurant.create({
          data: {
            name: "My Punjabi Tadka",
            ownerId: user.id,
            cuisine: "North Indian · Mughlai",
            address: "DLF Cyber City, Gurugram",
            latitude: 28.4952,
            longitude: 77.0889,
            imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
            isVeg: true,
            isApproved: true,
          },
        });
      }
    } else if (user.role !== finalRole) {
      // If user exists but with a different role, update their role for ease of demo switching
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: finalRole },
      });
    }

    // Sign JWT Token
    const token = signToken({
      userId: user.id,
      role: user.role,
      phone: user.phone,
    });

    // Set JWT token in Cookie
    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

    response.cookies.set("zaiko_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during login." },
      { status: 500 }
    );
  }
}
