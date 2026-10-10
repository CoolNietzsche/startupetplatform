import { Droplet } from "lucide-react";
import { getTranslations } from "next-intl/server";
import products from "@/content/products.json";

export async function SizeCards() {
  const t = await getTranslations("fine");
  return <div className="card-grid" aria-label={t("sizesTitle")}>
    {products.products.map((product) => <article className="surface-card size-card" key={product.id} id={`size-${product.id}`}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem", color: "#0a78ad" }}><Droplet size={17} aria-hidden="true" /><span className="eyebrow">{t("typicalUse")}</span></div>
      <p className="size-value">{product.size}</p>
      <p>{t(`uses.${product.id}`)}</p>
      <p style={{ marginTop: "0.9rem" }}><strong>{t("packDetails")}:</strong> {t("packNeutral")}</p>
    </article>)}
  </div>;
}
