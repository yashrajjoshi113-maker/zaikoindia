import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET: Fetch all active restaurants
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const isVeg = searchParams.get("isVeg") === "true";

    // Query filters
    const whereClause: any = { isApproved: true };
    if (isVeg) {
      whereClause.isVeg = true;
    }

    let restaurants = await prisma.restaurant.findMany({
      where: whereClause,
      include: {
        menuItems: true,
      },
      orderBy: { averageRating: "desc" },
    });

    // Simple keyword filter for cuisine or name
    if (category && category !== "All") {
      restaurants = restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(category.toLowerCase()) ||
          r.cuisine.toLowerCase().includes(category.toLowerCase())
      );
    }

    return NextResponse.json({ success: true, restaurants });
  } catch (error: any) {
    console.error("Fetch Restaurants Error:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching restaurants." },
      { status: 500 }
    );
  }
}

// POST: Onboard/Register a new restaurant
export async function POST(req: NextRequest) {
  try {
    const { name, ownerId, cuisine, address, latitude, longitude, imageUrl, isVeg } = await req.json();

    if (!name || !ownerId || !cuisine || !address) {
      return NextResponse.json(
        { error: "Restaurant name, owner, cuisine type, and address are required." },
        { status: 400 }
      );
    }

    // Default mock coordinates if not provided
    const lat = latitude ? parseFloat(latitude) : 28.459497 + (Math.random() - 0.5) * 0.05;
    const lng = longitude ? parseFloat(longitude) : 77.026638 + (Math.random() - 0.5) * 0.05;

    const restaurant = await prisma.restaurant.create({
      data: {
        name,
        ownerId,
        cuisine,
        address,
        latitude: lat,
        longitude: lng,
        imageUrl: imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
        isVeg: !!isVeg,
        isApproved: true, // Auto-approve for demo convenience
        averageRating: 4.0 + Math.random(),
      },
    });

    // Create a few default menu items for the new restaurant
    await prisma.menuItem.createMany({
      data: [
        {
          name: "Signature Veg Platter",
          description: "A chef's special assortment of seasoned grilled veggies and dips.",
          price: 299.0,
          category: "Starters",
          imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80",
          restaurantId: restaurant.id,
        },
        {
          name: "Premium Chef Special Thali",
          description: "Paneer, Dal, Dry Veg, Rice, Butter Roti, Dessert and Salad.",
          price: 349.0,
          category: "Thali",
          imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80",
          restaurantId: restaurant.id,
        },
      ],
    });

    return NextResponse.json({
      success: true,
      message: "Restaurant onboarded successfully.",
      restaurant,
    });
  } catch (error: any) {
    console.error("Create Restaurant Error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during restaurant onboarding." },
      { status: 500 }
    );
  }
}
