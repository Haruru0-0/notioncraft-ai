import { Alfa_Slab_One, Schibsted_Grotesk } from "next/font/google";

// Shared by the landing page and the auth screens (one instance per font)
export const wood = Alfa_Slab_One({ weight: "400", subsets: ["latin"], variable: "--font-wood", display: "swap" });
export const grotesk = Schibsted_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });
