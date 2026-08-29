export type Program = {
  id: string;
  name: string;
  description: string;
  duration: string;
  intensity: "Low" | "Moderate" | "High" | "Elite";
};

export type Trainer = {
  id: string;
  name: string;
  role: string;
  bio: string;
  imageAlt: string;
};

export type Stat = {
  id: string;
  label: string;
  value: number;
  suffix?: string;
};

export type MembershipTier = {
  id: string;
  name: string;
  price: string;
  cadence: string;
  features: string[];
  featured?: boolean;
};
