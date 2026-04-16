import { prisma } from "@ibo/db";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { PageHeader } from "../../components/ui/page-header";

export const dynamic = "force-dynamic";

const categoryVariant = (category: string) => {
  switch (category) {
    case "indicator":
      return "investment" as const;
    case "pattern":
      return "swing" as const;
    case "rule":
      return "favorable" as const;
    case "principle":
      return "mixed" as const;
    default:
      return "muted" as const;
  }
};

export default async function GlossaryPage() {
  const concepts = await prisma.knowledgeConcept.findMany({
    orderBy: { title: "asc" },
  });

  // Group by first letter for alphabetical sections
  const grouped = concepts.reduce<Record<string, typeof concepts>>(
    (acc, concept) => {
      const letter = concept.title.charAt(0).toUpperCase();
      if (!acc[letter]) acc[letter] = [];
      acc[letter].push(concept);
      return acc;
    },
    {},
  );

  const letters = Object.keys(grouped).sort();

  return (
    <>
      <PageHeader
        title="Glossary"
        description="All investment concepts, indicators, patterns, and principles — sorted alphabetically"
      />

      {/* Letter quick-nav */}
      {letters.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-brand-50 hover:text-brand-700"
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {letters.length > 0 ? (
        <div className="space-y-8">
          {letters.map((letter) => (
            <div key={letter} id={`letter-${letter}`}>
              <h2 className="mb-3 text-lg font-bold text-slate-900">{letter}</h2>
              <div className="space-y-2">
                {grouped[letter].map((concept) => (
                  <Card key={concept.id}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{concept.title}</h3>
                          <Badge variant={categoryVariant(concept.category)}>
                            {concept.category}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{concept.definition}</p>
                        {concept.notes && (
                          <p className="mt-1 text-xs text-slate-400 italic">{concept.notes}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <p className="text-sm text-slate-400">
            No concepts found. Add KnowledgeConcepts to populate the glossary.
          </p>
        </Card>
      )}
    </>
  );
}
