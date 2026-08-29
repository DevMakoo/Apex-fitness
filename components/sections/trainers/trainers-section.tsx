import { trainers } from "@/lib/data/trainers";
import { SectionHeading } from "@/components/common/section-heading";
import { TrainerCard } from "./trainer-card";

export function TrainersSection() {
  return (
    <section id="trainers" className="bg-background px-6 py-24 md:px-12">
      <SectionHeading kicker="Coaching Staff" title="Trained By The Best" />
      <div className="mt-16 grid gap-12 md:grid-cols-3">
        {trainers.map((trainer, index) => (
          <TrainerCard key={trainer.id} trainer={trainer} index={index} />
        ))}
      </div>
    </section>
  );
}
