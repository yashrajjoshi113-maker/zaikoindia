import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { code, orderValue } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required." },
        { status: 400 }
      );
    }

    const subtotal = orderValue ? parseFloat(orderValue) : 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: "Invalid coupon code." },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { valid: false, error: "This coupon is no longer active." },
        { status: 400 }
      );
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json(
        { valid: false, error: "This coupon has expired." },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order value of ₹${coupon.minOrderValue} required for this coupon.`,
        },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = subtotal * (coupon.discountValue / 100);
      if (coupon.maxDiscount !== null && coupon.maxDiscount !== undefined) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      // FLAT discount
      discount = coupon.discountValue;
    }

    // Round to 2 decimal places
    discount = Math.round(discount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
      minOrderValue: coupon.minOrderValue,
    });
  } catch (error: any) {
    console.error("Validate Coupon Error:", error);
    return NextResponse.json(
      { error: "Internal server error during coupon validation." },
      { status: 500 }
    );
  }
}
