import type { MembershipTier } from "@/types/content";

export const membershipTiers: MembershipTier[] = [
  {
    id: "essential",
    name: "Essential",
    price: "R$ 149",
    cadence: "/mês",
    features: ["Acesso ilimitado ao estúdio", "Biblioteca de programas", "Avaliação mensal"],
  },
  {
    id: "performance",
    name: "Performance",
    price: "R$ 249",
    cadence: "/mês",
    features: [
      "Tudo do Essential",
      "Sessões semanais com treinador",
      "Testes de performance trimestrais",
    ],
    featured: true,
  },
  {
    id: "elite",
    name: "Elite",
    price: "R$ 399",
    cadence: "/mês",
    features: ["Tudo do Performance", "Treino individual 1:1", "Acesso à suíte de recuperação"],
  },
];
