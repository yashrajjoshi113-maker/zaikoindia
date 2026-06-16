import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const connectionUrl = process.env.DATABASE_URL || "file:./dev.db";
const adapter = new PrismaLibSql({ url: connectionUrl });
const prisma = new PrismaClient({ adapter });


async function main() {
  console.log("Seeding started...");

  // Clean DB
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();

  // Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Platform Admin",
      phone: "9999999999",
      email: "admin@zaiko.in",
      role: "ADMIN",
    },
  });

  const restOwner = await prisma.user.create({
    data: {
      name: "Ramesh Kumar",
      phone: "8888888888",
      email: "ramesh@punjabitadka.in",
      role: "RESTAURANT_OWNER",
    },
  });

  const rider = await prisma.user.create({
    data: {
      name: "Rajan Kumar",
      phone: "7777777777",
      email: "rajan@zaikoriders.in",
      role: "DELIVERY_PARTNER",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      phone: "9876543210",
      email: "rahul@gmail.com",
      role: "CUSTOMER",
    },
  });

  // Create Wallets
  await prisma.wallet.create({
    data: {
      userId: customer.id,
      balance: 150.0,
    },
  });

  await prisma.wallet.create({
    data: {
      userId: rider.id,
      balance: 45.0,
    },
  });

  // Create Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "ZAIKO50",
        discountType: "FLAT",
        discountValue: 50.0,
        minOrderValue: 199.0,
        expiresAt: new Date("2027-12-31"),
        isActive: true,
      },
      {
        code: "FREEVEG",
        discountType: "FLAT",
        discountValue: 35.0, // Free delivery charge
        minOrderValue: 0.0,
        expiresAt: new Date("2027-12-31"),
        isActive: true,
      },
      {
        code: "WEEKEND25",
        discountType: "PERCENTAGE",
        discountValue: 25.0,
        minOrderValue: 299.0,
        maxDiscount: 100.0,
        expiresAt: new Date("2027-12-31"),
        isActive: true,
      },
    ],
  });

  // Create Restaurants
  const r1 = await prisma.restaurant.create({
    data: {
      name: "Punjabi Tadka",
      ownerId: restOwner.id,
      cuisine: "North Indian · Punjabi",
      address: "Sector 15, Gurugram, Haryana",
      latitude: 28.459497,
      longitude: 77.026638,
      imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=400&q=80",
      isVeg: true,
      isApproved: true,
      averageRating: 4.6,
    },
  });

  const r2 = await prisma.restaurant.create({
    data: {
      name: "Biryani House",
      ownerId: restOwner.id,
      cuisine: "Biryani · Mughlai",
      address: "Connaught Place, New Delhi",
      latitude: 28.6304,
      longitude: 77.2177,
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=400&q=80",
      isVeg: false,
      isApproved: true,
      averageRating: 4.8,
    },
  });

  const r3 = await prisma.restaurant.create({
    data: {
      name: "South Spice",
      ownerId: restOwner.id,
      cuisine: "South Indian · Udupi",
      address: "Sector 62, Noida, Uttar Pradesh",
      latitude: 28.6273,
      longitude: 77.3725,
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=400&q=80",
      isVeg: true,
      isApproved: true,
      averageRating: 4.7,
    },
  });

  const r4 = await prisma.restaurant.create({
    data: {
      name: "Burger Republic",
      ownerId: restOwner.id,
      cuisine: "Burgers · Wraps · Fast Food",
      address: "Rajouri Garden, New Delhi",
      latitude: 28.6415,
      longitude: 77.1213,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
      isVeg: false,
      isApproved: true,
      averageRating: 4.4,
    },
  });

  const r5 = await prisma.restaurant.create({
    data: {
      name: "Wok Express",
      ownerId: restOwner.id,
      cuisine: "Chinese · Pan Asian",
      address: "DLF Phase 3, Gurugram, Haryana",
      latitude: 28.4908,
      longitude: 77.0905,
      imageUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=400&q=80",
      isVeg: false,
      isApproved: true,
      averageRating: 4.3,
    },
  });

  const r6 = await prisma.restaurant.create({
    data: {
      name: "Dilli Darbar",
      ownerId: restOwner.id,
      cuisine: "North Indian · Mughlai",
      address: "Chandni Chowk, New Delhi",
      latitude: 28.6506,
      longitude: 77.2303,
      imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80",
      isVeg: false,
      isApproved: true,
      averageRating: 4.9,
    },
  });

  const r7 = await prisma.restaurant.create({
    data: {
      name: "Pizza Planet",
      ownerId: restOwner.id,
      cuisine: "Pizza · Italian · Pasta",
      address: "Sector 29, Gurugram, Haryana",
      latitude: 28.4682,
      longitude: 77.0637,
      imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=400&q=80",
      isVeg: true,
      isApproved: true,
      averageRating: 4.5,
    },
  });

  const r8 = await prisma.restaurant.create({
    data: {
      name: "Rajdhani Thali",
      ownerId: restOwner.id,
      cuisine: "Thali · Rajasthani · Gujarati",
      address: "Saket, New Delhi",
      latitude: 28.5276,
      longitude: 77.2193,
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=400&q=80",
      isVeg: true,
      isApproved: true,
      averageRating: 4.8,
    },
  });

  const r9 = await prisma.restaurant.create({
    data: {
      name: "Noodle Box",
      ownerId: restOwner.id,
      cuisine: "Chinese · Noodles · Momos",
      address: "Dwarka Sector 12, New Delhi",
      latitude: 28.5921,
      longitude: 77.0463,
      imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=400&q=80",
      isVeg: false,
      isApproved: true,
      averageRating: 4.2,
    },
  });

  const r10 = await prisma.restaurant.create({
    data: {
      name: "Filter Kaapi House",
      ownerId: restOwner.id,
      cuisine: "Coffee · South Indian · Cafe",
      address: "Noida Sector 18, Uttar Pradesh",
      latitude: 28.5708,
      longitude: 77.3261,
      imageUrl: "https://images.unsplash.com/photo-1630383249896-424e482df921?auto=format&fit=crop&w=400&q=80",
      isVeg: true,
      isApproved: true,
      averageRating: 4.5,
    },
  });

  // Create Menu Items
  // Punjabi Tadka
  await prisma.menuItem.create({
    data: {
      name: "Dal Makhani Makhni",
      description: "Authentic slow-cooked black lentils with cream and butter.",
      price: 190.0,
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80",
      restaurantId: r1.id,
    },
  });
  await prisma.menuItem.create({
    data: {
      name: "Butter Naan",
      description: "Soft leavened clay oven bread topped with butter.",
      price: 45.0,
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=300&q=80",
      restaurantId: r1.id,
    },
  });

  // Biryani House
  await prisma.menuItem.create({
    data: {
      name: "Veg Biryani Royal",
      description: "Basmati rice layered with garden fresh vegetables and saffron.",
      price: 280.0,
      category: "Biryani",
      imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=300&q=80",
      restaurantId: r2.id,
    },
  });

  // Dilli Darbar
  await prisma.menuItem.create({
    data: {
      name: "Matar Paneer Premium",
      description: "Fresh cottage cheese cubes and peas in a rich tomato gravy.",
      price: 220.0,
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?auto=format&fit=crop&w=300&q=80",
      restaurantId: r6.id,
    },
  });

  // South Spice
  await prisma.menuItem.create({
    data: {
      name: "Masala Dosa",
      description: "Crispy rice crepe filled with spiced potato mash, served with sambar and chutneys.",
      price: 120.0,
      category: "South Indian",
      imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=300&q=80",
      restaurantId: r3.id,
    },
  });

  // Others
  const rTikkaOwner = await prisma.restaurant.create({
    data: {
      name: "Grill Nation",
      ownerId: restOwner.id,
      cuisine: "Kebabs · North Indian",
      address: "Cyber City, Gurugram, Haryana",
      latitude: 28.4952,
      longitude: 77.0889,
      imageUrl: "https://images.unsplash.com/photo-1567184109411-47a7a39ea897?auto=format&fit=crop&w=400&q=80",
      isVeg: true,
      isApproved: true,
      averageRating: 4.6,
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Paneer Tikka",
      description: "Skewered paneer cubes marinated in spices and grilled.",
      price: 240.0,
      category: "North Indian",
      imageUrl: "https://images.unsplash.com/photo-1567184109411-47a7a39ea897?auto=format&fit=crop&w=300&q=80",
      restaurantId: rTikkaOwner.id,
    },
  });

  const rMithai = await prisma.restaurant.create({
    data: {
      name: "Mithai Corner",
      ownerId: restOwner.id,
      cuisine: "Desserts · Sweets",
      address: "Karol Bagh, New Delhi",
      latitude: 28.6443,
      longitude: 77.1903,
      imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80",
      isVeg: true,
      isApproved: true,
      averageRating: 4.7,
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "Royal Shahi Tukda",
      description: "Indian bread pudding dessert steeped in saffron rabri.",
      price: 130.0,
      category: "Desserts",
      imageUrl: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=300&q=80",
      restaurantId: rMithai.id,
    },
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
