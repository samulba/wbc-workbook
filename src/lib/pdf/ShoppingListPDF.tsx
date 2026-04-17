import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { PRIORITY_LABELS, type ShoppingPriority } from "@/lib/types/shopping";

const C = {
  forest:      "#445c49",
  mint:        "#94c1a4",
  mintLight:   "#c4dccb",
  cream:       "#f6ede2",
  terracotta:  "#823509",
  white:       "#ffffff",
  gray:        "#6b7280",
  grayLight:   "#e5e7eb",
};

const s = StyleSheet.create({
  page:         { backgroundColor: C.cream, fontFamily: "Helvetica", fontSize: 10, color: C.forest },
  header:       { backgroundColor: C.forest, padding: 40 },
  brand:        { fontSize: 7.5, color: C.mintLight, letterSpacing: 2, marginBottom: 12 },
  title:        { fontSize: 26, fontFamily: "Helvetica-Bold", color: C.cream, marginBottom: 6 },
  subtitle:     { fontSize: 10, color: C.mintLight, marginBottom: 18 },
  budgetBox:    { flexDirection: "row", alignItems: "center", gap: 12 },
  budgetLabel:  { fontSize: 8, color: C.mintLight, letterSpacing: 1.5 },
  budgetValue:  { fontSize: 18, color: C.white, fontFamily: "Helvetica-Bold" },
  body:         { padding: 40 },
  section:      { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontFamily: "Helvetica-Bold", color: C.forest, marginBottom: 8, paddingBottom: 4, borderBottom: `1.5pt solid ${C.mint}` },
  row:          { flexDirection: "row", alignItems: "center", paddingVertical: 6, borderBottom: `0.5pt solid ${C.grayLight}` },
  rowName:      { flex: 1, fontSize: 10, color: C.forest, fontFamily: "Helvetica-Bold", marginRight: 8 },
  rowDetail:    { fontSize: 8, color: C.gray, marginTop: 2 },
  rowPrice:     { width: 70, fontSize: 10, color: C.forest, fontFamily: "Helvetica-Bold", textAlign: "right" },
  rowQty:       { width: 40, fontSize: 9, color: C.gray, textAlign: "center" },
  purchased:    { textDecoration: "line-through", color: C.gray, opacity: 0.6 },
  summary:      { marginTop: 20, padding: 16, backgroundColor: C.white, borderRadius: 8 },
  summaryRow:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  summaryLabel: { fontSize: 9, color: C.gray },
  summaryValue: { fontSize: 10, color: C.forest, fontFamily: "Helvetica-Bold" },
  totalRow:     { flexDirection: "row", justifyContent: "space-between", paddingTop: 8, marginTop: 6, borderTop: `1pt solid ${C.grayLight}` },
  totalLabel:   { fontSize: 11, color: C.forest, fontFamily: "Helvetica-Bold" },
  totalValue:   { fontSize: 14, color: C.terracotta, fontFamily: "Helvetica-Bold" },
  footer:       { position: "absolute", bottom: 20, left: 40, right: 40, textAlign: "center", fontSize: 7, color: C.gray },
  empty:        { fontSize: 10, color: C.gray, fontStyle: "italic" },
});

// ── Props ────────────────────────────────────────────────────────────────────

export interface ShoppingListPDFItem {
  name:         string;
  price:        number | null;
  quantity:     number;
  priority:     ShoppingPriority;
  is_purchased: boolean;
  url:          string | null;
}

export interface ShoppingListPDFProps {
  listName:     string;
  projectName:  string | null;
  budgetTotal:  number | null;
  createdAt:    string;
  items:        ShoppingListPDFItem[];
}

// ── Component ────────────────────────────────────────────────────────────────

export function ShoppingListPDF({ listName, projectName, budgetTotal, createdAt, items }: ShoppingListPDFProps) {
  const total = items.reduce((s, i) => s + ((i.price ?? 0) * i.quantity), 0);
  const purchased = items.filter((i) => i.is_purchased).length;

  const byPri: Record<ShoppingPriority, ShoppingListPDFItem[]> = {
    must_have: [], nice_to_have: [], maybe_later: [],
  };
  const byPriTotal: Record<ShoppingPriority, number> = { must_have: 0, nice_to_have: 0, maybe_later: 0 };
  for (const it of items) {
    byPri[it.priority].push(it);
    byPriTotal[it.priority] += (it.price ?? 0) * it.quantity;
  }

  const fmt = (n: number) => `€ ${n.toLocaleString("de-DE", { maximumFractionDigits: 0 })}`;

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.brand}>WELLBEING WORKBOOK — SHOPPING-LISTE</Text>
          <Text style={s.title}>{listName}</Text>
          {projectName && <Text style={s.subtitle}>Projekt: {projectName}</Text>}

          {budgetTotal && budgetTotal > 0 && (
            <View style={s.budgetBox}>
              <View>
                <Text style={s.budgetLabel}>BUDGET</Text>
                <Text style={s.budgetValue}>{fmt(total)} / {fmt(budgetTotal)}</Text>
              </View>
            </View>
          )}
        </View>

        <View style={s.body}>
          {(["must_have", "nice_to_have", "maybe_later"] as ShoppingPriority[]).map((p) => {
            const group = byPri[p];
            if (group.length === 0) return null;
            return (
              <View key={p} style={s.section}>
                <Text style={s.sectionTitle}>
                  {PRIORITY_LABELS[p]} ({group.length}) — {fmt(byPriTotal[p])}
                </Text>
                {group.map((item, i) => (
                  <View key={i} style={s.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.rowName, item.is_purchased ? s.purchased : {}]}>
                        {item.is_purchased ? "✓ " : ""}{item.name}
                      </Text>
                      {item.url && <Text style={s.rowDetail}>{item.url}</Text>}
                    </View>
                    <Text style={s.rowQty}>× {item.quantity}</Text>
                    <Text style={[s.rowPrice, item.is_purchased ? s.purchased : {}]}>
                      {item.price !== null ? fmt((item.price ?? 0) * item.quantity) : "—"}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })}

          {items.length === 0 && <Text style={s.empty}>Diese Liste ist noch leer.</Text>}

          {items.length > 0 && (
            <View style={s.summary}>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Artikel gesamt</Text>
                <Text style={s.summaryValue}>{items.length}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Davon gekauft</Text>
                <Text style={s.summaryValue}>{purchased}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Must-haves</Text>
                <Text style={s.summaryValue}>{fmt(byPriTotal.must_have)}</Text>
              </View>
              <View style={s.summaryRow}>
                <Text style={s.summaryLabel}>Nice-to-haves</Text>
                <Text style={s.summaryValue}>{fmt(byPriTotal.nice_to_have)}</Text>
              </View>
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Gesamtpreis</Text>
                <Text style={s.totalValue}>{fmt(total)}</Text>
              </View>
            </View>
          )}
        </View>

        <Text style={s.footer}>
          Erstellt am {new Date(createdAt).toLocaleDateString("de-DE")} · Wellbeing Workbook
        </Text>
      </Page>
    </Document>
  );
}
