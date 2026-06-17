import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Restaurant ID is required." },
        { status: 400 }
      );
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { restaurantId: id },
      orderBy: { price: "asc" },
    });

    return NextResponse.json({
      success: true,
      menuItems,
    });
  } catch (error: any) {
    console.error("Fetch Menu Items Error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching menu items." },
      { status: 500 }
    );
  }
}
