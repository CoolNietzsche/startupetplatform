import { getTranslations } from "next-intl/server";
import products from "@/content/products.json";

export async function AnalysisTable() {
  const t = await getTranslations("fine");
  return <>
    <div className="analysis-wrap">
      <table className="analysis-table">
        <thead><tr><th scope="col">{t("analysisName")}</th><th scope="col">{t("analysisValue")}</th><th scope="col">{t("analysisUnit")}</th></tr></thead>
        <tbody>{products.analysis.values.map((row) => <tr key={row.nameKey}>
          <td>{t(row.nameKey.replace("fine.", ""))}</td><td>{row.value}</td><td>{row.nameKey.endsWith(".ph") ? "—" : products.analysis.unit}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="notice" style={{ marginTop: "1rem" }}>{t("analysisNote")}</p>
  </>;
}
