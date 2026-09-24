import type { Program } from "@/types/content";

export const programs: Program[] = [
  {
    id: "strength",
    name: "Fundamentos de Força",
    description: "Periodização de sobrecarga progressiva baseada no domínio dos movimentos compostos.",
    duration: "60 min",
    intensity: "Alta",
  },
  {
    id: "conditioning",
    name: "Condicionamento Metabólico",
    description: "Treino intervalado de alta intensidade desenhado para resistência duradoura.",
    duration: "45 min",
    intensity: "Elite",
  },
  {
    id: "mobility",
    name: "Mobilidade e Recuperação",
    description: "Restauração estruturada do movimento para longevidade sob alta carga.",
    duration: "40 min",
    intensity: "Baixa",
  },
  {
    id: "performance",
    name: "Laboratório de Performance",
    description: "Testes atléticos baseados em dados e correção individualizada.",
    duration: "75 min",
    intensity: "Moderada",
  },
];
