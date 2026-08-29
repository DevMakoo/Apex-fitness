import type { MembershipTier } from "@/types/content";

export const membershipTiers: MembershipTier[] = [
  {
    id: "essential",
    name: "Essential",
    price: "$129",
    cadence: "/month",
    features: ["Unlimited studio access", "Program library", "Monthly check-in"],
  },
  {
    id: "performance",
    name: "Performance",
    price: "$219",
    cadence: "/month",
    features: [
      "Everything in Essential",
      "Weekly coached sessions",
      "Quarterly performance testing",
    ],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "$349",
    cadence: "/month",
    features: ["Everything in Performance", "1:1 coaching", "Recovery suite access"],
  },
];
