import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zaiko — Food Delivered Faster Than Ever | India's Premium Food Delivery",
  description: "Zaiko delivers restaurant-quality meals in under 25 minutes. Pure veg, lightning fast, AI-powered food delivery across India.",
  keywords: "food delivery, zaiko, indian food, veg delivery, fast food delivery, online order",
  openGraph: {
    title: "Zaiko — Food Delivered Faster Than Ever",
    description: "India's fastest pure-veg food delivery. 25-min guarantee. 50k+ happy customers.",
    type: "website",
  },
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
