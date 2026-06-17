import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, role } = await req.json();

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone number are required." },
        { status: 400 }
      );
    }

    // Clean phone number (keep digits only)
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    // Check if phone already registered
    const existingUser = await prisma.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Phone number already registered. Please login." },
        { status: 400 }
      );
    }

    // Check if email already registered (if provided)
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return NextResponse.json(
          { error: "Email address already registered." },
          { status: 400 }
        );
      }
    }

    // Validate role
    const validRoles = ["CUSTOMER", "RESTAURANT_OWNER", "DELIVERY_PARTNER", "ADMIN"];
    const finalRole = validRoles.includes(role?.toUpperCase()) ? role.toUpperCase() : "CUSTOMER";

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: email || null,
        phone: cleanPhone,
        role: finalRole,
      },
    });

    // Create wallet for Customer and Rider
    if (finalRole === "CUSTOMER" || finalRole === "DELIVERY_PARTNER") {
      await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: finalRole === "CUSTOMER" ? 150.0 : 0.0, // default welcome balance
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Registration Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during registration." },
      { status: 500 }
    );
  }
}
