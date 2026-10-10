import { getTranslations } from "next-intl/server";

const keys = ["sourcing", "compliance", "logistics", "delivery"] as const;

export async function ImportSteps() {
  const t = await getTranslations("import");
  return <ol className="process-list">{keys.map((key) => <li className="process-step" key={key}><strong>{t(`steps.${key}`)}</strong></li>)}</ol>;
}
