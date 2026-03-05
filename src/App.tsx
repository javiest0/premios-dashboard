import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, ReferenceLine } from "recharts";

// ─── DATA ────────────────────────────────────────────────────────────────────

// Formula: Si mes_anterior=1 → No. Si mar+feb=2 → No. Si mar+feb=0 → Si.
// Si feb+ene+dic=0 → Si. Si ene+dic+nov=0 → Si. Else → No.
function calcPremio(mesAnterior, m5, m4, m3, m2, m1) {
  if (mesAnterior === 1) return "No";
  if (m5 + m4 === 2) return "No";
  if (m5 + m4 === 0) return "Si";
  if (m4 + m3 + m2 === 0) return "Si";
  if (m3 + m2 + m1 === 0) return "Si";
  return "No";
}

// Generate all 64 combinations
const COMBOS = [];
for (let i = 0; i < 64; i++) {
  const bits = [(i >> 5) & 1, (i >> 4) & 1, (i >> 3) & 1, (i >> 2) & 1, (i >> 1) & 1, i & 1];
  const [b5, b4, b3, b2, b1, b0] = bits;
  COMBOS.push({
    id: i + 1,
    mesAnterior: b5, m5: b4, m4: b3, m3: b2, m2: b1, m1: b0,
    premio: calcPremio(b5, b4, b3, b2, b1, b0),
  });
}

// Full historical productividad (from Excel)
const HISTORICO = [
  { mes: "Ene 2021", prod: 16.0 }, { mes: "Feb 2021", prod: 16.0 }, { mes: "Mar 2021", prod: 16.0 },
  { mes: "Abr 2021", prod: 15.79 }, { mes: "May 2021", prod: 14.96 }, { mes: "Jun 2021", prod: 16.0 },
  { mes: "Jul 2021", prod: 14.45 }, { mes: "Ago 2021", prod: 15.1 }, { mes: "Sep 2021", prod: 16.0 },
  { mes: "Oct 2021", prod: 16.0 }, { mes: "Nov 2021", prod: 16.0 }, { mes: "Dic 2021", prod: 15.14 },
  { mes: "Ene 2022", prod: 14.19 }, { mes: "Feb 2022", prod: 15.0 }, { mes: "Mar 2022", prod: 13.64 },
  { mes: "Abr 2022", prod: 13.82 }, { mes: "May 2022", prod: 14.03 }, { mes: "Jun 2022", prod: 15.34 },
  { mes: "Jul 2022", prod: 13.8 }, { mes: "Ago 2022", prod: 16.0 }, { mes: "Sep 2022", prod: 15.03 },
  { mes: "Oct 2022", prod: 14.42 }, { mes: "Nov 2022", prod: 14.18 }, { mes: "Dic 2022", prod: 13.14 },
  { mes: "Ene 2023", prod: 13.98 }, { mes: "Feb 2023", prod: 12.25 }, { mes: "Mar 2023", prod: 10.86 },
  { mes: "Abr 2023", prod: 13.48 }, { mes: "May 2023", prod: 15.83 }, { mes: "Jun 2023", prod: 16.0 },
  { mes: "Jul 2023", prod: 13.26 }, { mes: "Ago 2023", prod: 16.0 }, { mes: "Sep 2023", prod: 15.56 },
  { mes: "Oct 2023", prod: 16.0 }, { mes: "Nov 2023", prod: 14.36 }, { mes: "Dic 2023", prod: 12.25 },
  { mes: "Ene 2024", prod: 13.26 }, { mes: "Feb 2024", prod: 8.9 }, { mes: "Mar 2024", prod: 14.4 },
  { mes: "Abr 2024", prod: 14.11 }, { mes: "May 2024", prod: 16.0 }, { mes: "Jun 2024", prod: 16.0 },
  { mes: "Jul 2024", prod: 16.0 }, { mes: "Ago 2024", prod: 14.66 }, { mes: "Sep 2024", prod: 16.0 },
  { mes: "Oct 2024", prod: 16.0 }, { mes: "Nov 2024", prod: 16.0 }, { mes: "Dic 2024", prod: 15.39 },
  { mes: "Ene 2025", prod: 16.0 }, { mes: "Feb 2025", prod: 13.54 }, { mes: "Mar 2025", prod: 16.0 },
  { mes: "Abr 2025", prod: 16.0 }, { mes: "May 2025", prod: 16.0 }, { mes: "Jun 2025", prod: 15.67 },
  { mes: "Jul 2025", prod: 15.7 }, { mes: "Ago 2025", prod: 15.28 }, { mes: "Sep 2025", prod: 16.0 },
  { mes: "Oct 2025", prod: 15.2 }, { mes: "Nov 2025", prod: 16.0 }, { mes: "Dic 2025", prod: 16.0 },
  { mes: "Ene 2026", prod: 16.0 },
];

const LICENCIAS = [
  { detalle: "CCT: Día ASIMRA Art. 22.1", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Lic. CCT: Donación Sangre Art. 23.2", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Lic. CCT: Examen Art. 23.2", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Lic. CCT: Fall. Abuelos / Padres políticos Art 23.2", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Lic. CCT: Mudanza Art. 23.2", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Lic. CCT: Prenupcial Art. 23.2", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Lic. CCT: Trámite Art. 23.2", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Lic. CCT: Trámite Judicial Art. 23.2", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Citación Judicial", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Licencia art. 13 Ley 27.674", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Lic. CCT Fam. Enfermo Art. 23.1", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Lic. Fallec. Cónyuge/Hijo/Padre", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Licencia por Fallecimiento de Hermano", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Licencia por Casamiento", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Licencia por Exámen", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Licencia por Paternidad", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Licencias Varias (con goce)", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Licencias Varias (sin goce)", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Paro Jornada Completa", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Suspensión", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Viaje de Negocios", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Vacaciones", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Licencia Especial RRLL", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Lic. Cuidado de Hijos - Decreto 264/20", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Licencia Vacuna Covid-19 – Res. 92/2021", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Licencia Especial HR (con goce)", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Licencia Especial HR (sin goce)", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Licencia Médica", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Licencia Médica Accidente ART", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Licencia Médica Injustificada por CD", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Licencia Injustificada por SM", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Licencia por Maternidad", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Licencia por Maternidad Extendida", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Licencia por Reserva de Puesto", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Llegada tarde con aviso", descuento: "Descuenta", premio: "Parcial" },
  { detalle: "Llegada tarde sin aviso", descuento: "Descuenta", premio: "Parcial" },
  { detalle: "Extravío / olvido de tarjeta de ingreso", descuento: "Descuenta", premio: "Parcial" },
  { detalle: "Inconveniente vehículo particular", descuento: "Descuenta", premio: "Parcial" },
  { detalle: "Permiso Especial", descuento: "No descuenta", premio: "Parcial" },
  { detalle: "Retraso transporte TASA (Micro/Remis)", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "ASIMRA / SMATA (Gremial)", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Retiro antes de hora con permiso del sector", descuento: "Descuenta", premio: "Parcial" },
  { detalle: "Retiro antes de hora - necesidad del sector", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Ausencia con aviso", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Ausencia injustificada sin aviso", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Licencia pendiente de documentación", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Ausencia Injustificada (general)", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Hisopado", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Aislamiento Preventivo", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "DNU Cuidado Hijos", descuento: "No descuenta", premio: "Pierde" },
  { detalle: "Devolución Flex", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Día de cumpleaños", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Vacaciones Adicionales", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Días descanso beneficio", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "GST & Proyectos / Entrenamiento", descuento: "No descuenta", premio: "No Pierde" },
  { detalle: "Injustificada SM / CD", descuento: "Descuenta", premio: "Pierde" },
  { detalle: "Licencia por Excedencia", descuento: "Descuenta", premio: "Pierde" },
];

const ROADMAP = [
  {
    fase: 1, nombre: "Relevamiento & Diseño", color: "#1e40af", desde: "Mar 2025", hasta: "Abr 2025",
    estado: "completado",
    hitos: [
      "Mapeo de reglas de presentismo y productividad",
      "Definición de criterio por tipo de licencia (99 categorías)",
      "Identificación de combinaciones posibles (64 escenarios)",
      "Validación con RRHH / Interlocutores",
    ],
    entregable: "Documento de reglas aprobado + esta app de indicadores",
  },
  {
    fase: 2, nombre: "Modelo de Datos Workday", color: "#7c3aed", desde: "May 2025", hasta: "Jun 2025",
    estado: "en-progreso",
    hitos: [
      "Definir campos custom en Workday: 'Afecta Premio' (Sí/No) por tipo de ausencia",
      "Mapear cada Leave Type existente con etiqueta de impacto",
      "Diseñar tabla: Legajo | Mes | ¿Afectado? | Q Afectaciones",
      "Revisión con IT/Workday Admin para permisos de campos calculados",
    ],
    entregable: "Spec técnico de campos + tabla de mapeo Leave → Premio",
  },
  {
    fase: 3, nombre: "Desarrollo Workday (Calculated Fields)", color: "#059669", desde: "Jul 2025", hasta: "Sep 2025",
    estado: "pendiente",
    hitos: [
      "Crear Calculated Field: 'Base Presentismo Activa' (lógica 6 meses)",
      "Crear Calculated Field: 'Ausencias Computables Mes Anterior'",
      "Crear Calculated Field: '% Presentismo' y '% Productividad'",
      "Testing unitario con casos reales (64 combinaciones)",
    ],
    entregable: "Campos calculados funcionales en entorno de prueba",
  },
  {
    fase: 4, nombre: "Reporte & Output Workday", color: "#d97706", desde: "Oct 2025", hasta: "Nov 2025",
    estado: "pendiente",
    hitos: [
      "Crear reporte Workday: vista mensual por legajo",
      "Output estándar: Legajo | Nombre | Mes | Afectado | Q Afect. | Premio Presentismo | Premio Prod.",
      "Integrar con proceso de liquidación de haberes",
      "Validación cruzada: output Workday vs cálculo manual (muestra)",
    ],
    entregable: "Reporte Workday operativo con datos reales",
  },
  {
    fase: 5, nombre: "Go-Live & Automatización", color: "#dc2626", desde: "Dic 2025", hasta: "Feb 2026",
    estado: "pendiente",
    hitos: [
      "Piloto con grupo reducido (1 sector)",
      "Ajustes post-piloto",
      "Rollout a toda la planta",
      "Capacitación a supervisores y RRHH",
      "Documentación final del proceso automatizado",
    ],
    entregable: "Premio calculado automáticamente desde Workday en proceso productivo",
  },
];

// ─── TABS ────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "reglas", label: "📋 Reglas Generales" },
  { id: "presentismo", label: "✅ Presentismo" },
  { id: "productividad", label: "📈 Productividad" },
  { id: "combinaciones", label: "🔢 Combinaciones" },
  { id: "simulador", label: "🧮 Simulador" },
  { id: "licencias", label: "📂 Licencias" },
  { id: "datos", label: "📊 Datos Históricos" },
  { id: "workday", label: "⚙️ Modelo Workday" },
  { id: "roadmap", label: "🗺️ Roadmap" },
];

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function Badge({ children, color }) {
  const map = {
    "No Pierde": { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    "Pierde": { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    "Parcial": { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
    "Si": { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    "No": { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    "completado": { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
    "en-progreso": { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
    "pendiente": { bg: "#f3f4f6", text: "#6b7280", border: "#d1d5db" },
  };
  const c = map[color] || map[children] || map["pendiente"];
  return (
    <span style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Card({ title, children, accent }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderLeft: accent ? `4px solid ${accent}` : undefined, borderRadius: 12, padding: "20px 24px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
      {title && <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 12 }}>{title}</div>}
      {children}
    </div>
  );
}

function RuleStep({ n, children }) {
  return (
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
      <div style={{ minWidth: 30, height: 30, borderRadius: "50%", background: "#1e40af", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13 }}>{n}</div>
      <div style={{ color: "#374151", fontSize: 14, lineHeight: 1.6, paddingTop: 4 }}>{children}</div>
    </div>
  );
}

function Alert({ type, children }) {
  const s = { warning: { bg: "#fffbeb", border: "#f59e0b", icon: "⚠️" }, info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ️" }, success: { bg: "#f0fdf4", border: "#22c55e", icon: "✅" }, danger: { bg: "#fef2f2", border: "#ef4444", icon: "🚫" } }[type] || { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ️" };
  return (
    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#1f2937", lineHeight: 1.6, marginBottom: 12 }}>
      <span style={{ marginRight: 8 }}>{s.icon}</span>{children}
    </div>
  );
}

// ─── TAB: REGLAS ─────────────────────────────────────────────────────────────
function TabReglas() {
  const now = new Date();
  const mesEval = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const mesNombre = mesEval.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  const mesActual = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card accent="#1e40af" title="🏆 Premio Presentismo — 14%">
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Se aplica sobre el <strong>salario base</strong>. Es todo o nada.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, background: "#d1fae5", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#065f46" }}>14%</div>
              <div style={{ fontSize: 11, color: "#065f46" }}>0 ausencias + base activa</div>
            </div>
            <div style={{ flex: 1, background: "#fee2e2", borderRadius: 8, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#991b1b" }}>0%</div>
              <div style={{ fontSize: 11, color: "#991b1b" }}>≥ 1 ausencia ó sin base</div>
            </div>
          </div>
        </Card>
        <Card accent="#059669" title="📈 Premio Productividad — hasta 16%">
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Proporcional a ausencias. Se puede cobrar parcialmente.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              { aus: "0 aus.", pct: "16%", bg: "#d1fae5", c: "#065f46" },
              { aus: "1 aus.", pct: "12%", bg: "#fef3c7", c: "#78350f" },
              { aus: "2 aus.", pct: "8%", bg: "#fed7aa", c: "#9a3412" },
              { aus: "3+", pct: "0%", bg: "#fee2e2", c: "#991b1b" },
            ].map(r => (
              <div key={r.aus} style={{ background: r.bg, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 11, color: r.c, fontWeight: 600 }}>{r.aus}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: r.c }}>{r.pct}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card accent="#7c3aed" title="📅 Período de Evaluación">
        <div style={{ background: "#f5f3ff", borderRadius: 10, padding: "14px 18px", marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: "#4c1d95", fontWeight: 600, marginBottom: 6 }}>📌 Regla general</div>
          <p style={{ margin: 0, fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
            Los premios de <strong>cualquier mes</strong> se calculan en base a las ausencias del <strong>mes inmediatamente anterior</strong>.<br />
            Ejemplo actual: para <strong>{mesActual}</strong>, se evalúan las ausencias de <strong style={{ color: "#7c3aed" }}>{mesNombre}</strong>.
          </p>
        </div>
        <Alert type="info">
          Para el <strong>Presentismo</strong>, además de las ausencias del mes anterior, se analiza si el empleado tiene <strong>base de premios activa</strong> (ver solapa Presentismo para el detalle de la regla de 6 meses).
        </Alert>
        <Alert type="warning">
          El período de análisis para la <strong>base al presentismo</strong> abarca los <strong>últimos 6 meses</strong> desde el mes a cobrar.
        </Alert>
      </Card>

      <Card accent="#dc2626" title="⏱️ Regla de Jornada Parcial">
        <p style={{ fontSize: 13, color: "#374151", marginBottom: 10 }}>Para llegadas tarde, salidas tempranas y reingresos, el impacto al premio depende del tiempo trabajado:</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "#d1fae5", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontWeight: 700, color: "#065f46", marginBottom: 4 }}>✅ Trabajó &gt; mitad de la jornada</div>
            <div style={{ fontSize: 13, color: "#065f46" }}>→ <strong>No pierde</strong> el premio mensual</div>
          </div>
          <div style={{ background: "#fee2e2", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: 4 }}>🚫 Trabajó &lt; mitad de la jornada</div>
            <div style={{ fontSize: 13, color: "#991b1b" }}>→ <strong>Pierde</strong> el premio mensual</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── TAB: PRESENTISMO ────────────────────────────────────────────────────────
function TabPresentismo() {
  return (
    <div>
      <Card accent="#1e40af" title="✅ Premio Presentismo — Condiciones para cobrar">
        <Alert type="info">
          Para cobrar el presentismo <strong>deben cumplirse DOS condiciones simultáneamente</strong>: tener la base activa Y no haber tenido ausencias computables en el mes anterior.
        </Alert>
        <RuleStep n="1"><strong>Sin ausencias en el mes anterior:</strong> Si hubo al menos 1 ausencia computable, se pierde el 100% del presentismo (14%).</RuleStep>
        <RuleStep n="2"><strong>Base al presentismo activa:</strong> El empleado debe haber generado y mantener la base (ver regla de los 6 meses abajo).</RuleStep>
        <RuleStep n="3">El presentismo es <strong>todo o nada</strong>: 14% si se cumplen ambas condiciones, 0% si falla cualquiera.</RuleStep>
      </Card>

      <Card accent="#7c3aed" title="🏛️ Base al Presentismo — Regla de los 6 Meses">
        <Alert type="info">La <strong>base al presentismo</strong> es la condición previa para poder cobrar el premio. Se analiza mirando los últimos 6 meses.</Alert>
        <RuleStep n="1"><strong>Empleado nuevo:</strong> genera la base desde su <strong>primer mes sin ausencias</strong>.</RuleStep>
        <RuleStep n="2"><strong>Ausencia aislada</strong> (sin otras en los 6 meses): al mes siguiente de la ausencia, puede volver a cobrar. La base <strong>no se pierde</strong>.</RuleStep>
        <RuleStep n="3"><strong>Dos ausencias con menos de 3 meses limpios entre sí</strong>: pierde la base al presentismo.</RuleStep>
        <RuleStep n="4"><strong>Recuperación:</strong> necesita 3 meses consecutivos sin ausencias para reconstituir la base.</RuleStep>

        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, color: "#374151", marginBottom: 10, fontSize: 14 }}>📌 Casos visuales:</div>
          {[
            { label: "Caso A — Ausencia aislada → NO pierde base", meses: ["✓","✓","✓","✗","✓","✓"], colors: ["#d1fae5","#d1fae5","#d1fae5","#fee2e2","#d1fae5","#d1fae5"], result: "✅ Vuelve a cobrar al mes siguiente", rBg: "#d1fae5", rC: "#065f46" },
            { label: "Caso B — Dos ausencias próximas → PIERDE base", meses: ["✓","✗","✓","✗","—","—"], colors: ["#d1fae5","#fee2e2","#d1fae5","#fee2e2","#f3f4f6","#f3f4f6"], result: "🚫 Pierde base. Necesita 3 meses sin ausencias", rBg: "#fee2e2", rC: "#991b1b" },
            { label: "Caso C — Recuperación de base (3 meses limpios)", meses: ["✗","✗","✓","✓","✓","✓"], colors: ["#fee2e2","#fee2e2","#fef3c7","#fef3c7","#fef3c7","#d1fae5"], result: "✅ Recupera base al mes 6", rBg: "#d1fae5", rC: "#065f46" },
          ].map(caso => (
            <div key={caso.label} style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#374151", marginBottom: 8 }}>{caso.label}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {caso.meses.map((m, i) => (
                  <div key={i} style={{ background: caso.colors[i], borderRadius: 6, width: 42, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, border: "1px solid rgba(0,0,0,0.08)" }}>{m}</div>
                ))}
              </div>
              <div style={{ background: caso.rBg, borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, color: caso.rC, display: "inline-block" }}>{caso.result}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── TAB: PRODUCTIVIDAD ──────────────────────────────────────────────────────
function TabProductividad() {
  return (
    <div>
      <Card accent="#059669" title="📈 Premio Productividad — Reglas">
        <Alert type="info">Puede alcanzar hasta el <strong>16% del salario base</strong>. A diferencia del presentismo, se cobra parcialmente según ausencias. <strong>No requiere base</strong>.</Alert>
        <RuleStep n="1">Se evalúan las ausencias del <strong>mes anterior</strong> al de cobro.</RuleStep>
        <RuleStep n="2">El porcentaje se reduce escalonadamente con cada ausencia computable.</RuleStep>
        <RuleStep n="3">Con 3 o más ausencias, el premio es <strong>0%</strong>.</RuleStep>
      </Card>
      <Card title="💰 Tabla de Cobro">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["Ausencias", "% del Máximo", "Premio Efectivo", "Ejemplo con $2.262.784"].map(h => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { aus: "0", pct: "100%", premio: "16%", v: 0.16, bg: "#f0fdf4", c: "#065f46" },
              { aus: "1", pct: "75%", premio: "12%", v: 0.12, bg: "#fefce8", c: "#78350f" },
              { aus: "2", pct: "50%", premio: "8%", v: 0.08, bg: "#fff7ed", c: "#9a3412" },
              { aus: "3+", pct: "0%", premio: "0%", v: 0, bg: "#fef2f2", c: "#991b1b" },
            ].map(r => (
              <tr key={r.aus} style={{ background: r.bg }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: r.c }}>{r.aus}</td>
                <td style={{ padding: "10px 14px", color: r.c, fontWeight: 600 }}>{r.pct}</td>
                <td style={{ padding: "10px 14px" }}><Badge color={r.v === 0 ? "Pierde" : "No Pierde"}>{r.premio}</Badge></td>
                <td style={{ padding: "10px 14px", fontFamily: "monospace", fontWeight: 600, color: r.c }}>
                  {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(2262784 * r.v)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── TAB: COMBINACIONES ──────────────────────────────────────────────────────
function TabCombinaciones() {
  const [filtro, setFiltro] = useState("todas");
  const [search, setSearch] = useState("");

  const meses = ["M-1 (último)", "M-2", "M-3", "M-4", "M-5", "M-6"];

  const filtradas = useMemo(() => {
    return COMBOS.filter(c => {
      if (filtro === "si" && c.premio !== "Si") return false;
      if (filtro === "no" && c.premio !== "No") return false;
      return true;
    });
  }, [filtro]);

  const siCount = COMBOS.filter(c => c.premio === "Si").length;
  const noCount = COMBOS.filter(c => c.premio === "No").length;

  const vals = (c) => [c.mesAnterior, c.m5, c.m4, c.m3, c.m2, c.m1];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#f9fafb", borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>TOTAL COMBINACIONES</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#111827" }}>64</div>
        </div>
        <div style={{ background: "#f0fdf4", borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#065f46", fontWeight: 600 }}>COBRA PRESENTISMO</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#065f46" }}>{siCount}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{((siCount/64)*100).toFixed(0)}% de los casos</div>
        </div>
        <div style={{ background: "#fef2f2", borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#991b1b", fontWeight: 600 }}>NO COBRA PRESENTISMO</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#991b1b" }}>{noCount}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>{((noCount/64)*100).toFixed(0)}% de los casos</div>
        </div>
      </div>

      <Card title="🔢 Las 64 Combinaciones Posibles (últimos 6 meses)">
        <Alert type="info">
          Cada columna representa un mes: <strong>1 = tuvo ausencia computable</strong>, <strong>0 = sin ausencias</strong>. La columna M-1 es el mes evaluado (mes anterior al de cobro). Los meses van de más reciente (M-1) a más antiguo (M-6).
        </Alert>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[{ k: "todas", l: "Todas (64)" }, { k: "si", l: `✅ Cobra (${siCount})` }, { k: "no", l: `🚫 No cobra (${noCount})` }].map(f => (
            <button key={f.k} onClick={() => setFiltro(f.k)} style={{ padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: filtro === f.k ? "#1e40af" : "#f3f4f6", color: filtro === f.k ? "#fff" : "#374151", border: filtro === f.k ? "1.5px solid #1e40af" : "1.5px solid #e5e7eb" }}>{f.l}</button>
          ))}
        </div>

        <div style={{ overflowX: "auto", maxHeight: 480, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: "#f9fafb", zIndex: 1 }}>
              <tr>
                <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb", width: 50 }}>#</th>
                {meses.map(m => (
                  <th key={m} style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb", fontSize: 11 }}>{m}</th>
                ))}
                <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>¿Cobra?</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Razón</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((c, i) => {
                const v = vals(c);
                const esSi = c.premio === "Si";
                let razon = "";
                if (c.mesAnterior === 1) razon = "Ausencia en mes anterior → pierde";
                else if (c.m5 + c.m4 === 2) razon = "2 ausencias en M-2/M-3 → pierde base";
                else if (c.m5 + c.m4 === 0) razon = "Sin aus. en M-2/M-3 → cobra";
                else if (c.m4 + c.m3 + c.m2 === 0) razon = "3 meses limpios M-3/M-4/M-5 → cobra";
                else if (c.m3 + c.m2 + c.m1 === 0) razon = "3 meses limpios M-4/M-5/M-6 → cobra";
                else razon = "No cumple distancia mínima entre ausencias";

                return (
                  <tr key={c.id} style={{ background: esSi ? (i % 2 === 0 ? "#f0fdf4" : "#dcfce7") : (i % 2 === 0 ? "#fff" : "#fafafa"), borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "8px 12px", textAlign: "center", fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{c.id}</td>
                    {v.map((val, j) => (
                      <td key={j} style={{ padding: "8px 12px", textAlign: "center" }}>
                        <div style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          width: 28, height: 28, borderRadius: 6,
                          background: val === 1 ? "#fee2e2" : "#d1fae5",
                          color: val === 1 ? "#991b1b" : "#065f46",
                          fontWeight: 800, fontSize: 13,
                        }}>{val}</div>
                      </td>
                    ))}
                    <td style={{ padding: "8px 12px", textAlign: "center" }}><Badge>{c.premio}</Badge></td>
                    <td style={{ padding: "8px 12px", fontSize: 12, color: "#6b7280" }}>{razon}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── TAB: SIMULADOR ──────────────────────────────────────────────────────────
function TabSimulador() {
  const SALARIO_EJEMPLO = 2262784;
  const [salario, setSalario] = useState(SALARIO_EJEMPLO);
  const [ausencias, setAusencias] = useState(0);
  const [tieneBase, setTieneBase] = useState(true);
  const [mesNombre, setMesNombre] = useState("Marzo 2025");

  const mesesEjemplo = ["Enero 2025","Febrero 2025","Marzo 2025","Abril 2025","Mayo 2025","Junio 2025","Julio 2025","Agosto 2025","Septiembre 2025","Octubre 2025","Noviembre 2025","Diciembre 2025","Enero 2026","Febrero 2026","Marzo 2026"];

  const presentismo = tieneBase && ausencias === 0 ? salario * 0.14 : 0;
  const pctProd = ausencias === 0 ? 1 : ausencias === 1 ? 0.75 : ausencias === 2 ? 0.5 : 0;
  const productividad = salario * 0.16 * pctProd;
  const total = presentismo + productividad;
  const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);

  return (
    <div>
      <Card accent="#7c3aed" title="🧮 Simulador de Premios">
        <div style={{ background: "#f5f3ff", border: "1px solid #c4b5fd", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13 }}>
          <strong style={{ color: "#4c1d95" }}>👷 Ejemplo cargado:</strong> <span style={{ color: "#374151" }}>Team Member 7 a 12 — Salario Base: <strong>${SALARIO_EJEMPLO.toLocaleString("es-AR")}</strong></span>
          <button onClick={() => setSalario(SALARIO_EJEMPLO)} style={{ marginLeft: 12, padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", background: "#7c3aed", color: "#fff", border: "none" }}>Cargar ejemplo</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Mes de cobro</label>
            <select value={mesNombre} onChange={e => setMesNombre(e.target.value)} style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 13, background: "#fff" }}>
              {mesesEjemplo.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Salario Base ($)</label>
            <input type="number" value={salario} onChange={e => setSalario(Number(e.target.value))} style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Ausencias mes anterior</label>
            <select value={ausencias} onChange={e => setAusencias(Number(e.target.value))} style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 13, background: "#fff" }}>
              <option value={0}>0 ausencias</option>
              <option value={1}>1 ausencia</option>
              <option value={2}>2 ausencias</option>
              <option value={3}>3+ ausencias</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>¿Base presentismo activa?</label>
            <select value={tieneBase ? "si" : "no"} onChange={e => setTieneBase(e.target.value === "si")} style={{ width: "100%", padding: "9px 11px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 13, background: "#fff" }}>
              <option value="si">✅ Sí, base activa</option>
              <option value="no">🚫 No (en generación)</option>
            </select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Presentismo (14%)", value: presentismo, color: "#1e40af", bg: "#eff6ff", sub: tieneBase && ausencias === 0 ? "✅ Cobrado" : "🚫 No cobrado" },
            { label: "Productividad (hasta 16%)", value: productividad, color: "#059669", bg: "#f0fdf4", sub: `${Math.round(pctProd*100)}% del máximo` },
            { label: "Total Premios", value: total, color: "#7c3aed", bg: "#f5f3ff", sub: `${salario > 0 ? ((total/salario)*100).toFixed(1) : 0}% del salario base` },
          ].map(item => (
            <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: item.color, fontWeight: 600, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: item.color }}>{fmt(item.value)}</div>
              <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{item.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "#f9fafb", borderRadius: 10, padding: 16, fontSize: 13, color: "#6b7280", lineHeight: 2 }}>
          <strong style={{ color: "#374151", display: "block", marginBottom: 4 }}>📋 Detalle del cálculo — {mesNombre}</strong>
          <div>• Salario base: <strong style={{ color: "#111827" }}>{fmt(salario)}</strong></div>
          <div>• Ausencias evaluadas: del mes <strong style={{ color: "#111827" }}>anterior a {mesNombre}</strong></div>
          <div>• Base al presentismo: <strong style={{ color: tieneBase ? "#065f46" : "#991b1b" }}>{tieneBase ? "✅ Activa" : "🚫 No generada"}</strong></div>
          <div>• Presentismo: {fmt(salario)} × 14% = {fmt(salario*0.14)} → {tieneBase && ausencias === 0 ? `cobrado ✅` : `NO cobrado 🚫 (${!tieneBase ? "sin base" : `${ausencias} ausencia/s`})`}</div>
          <div>• Productividad: {fmt(salario)} × 16% × {Math.round(pctProd*100)}% = <strong style={{ color: "#111827" }}>{fmt(productividad)}</strong></div>
          <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: 6, marginTop: 4, color: "#111827" }}>
            <strong>Total: {fmt(total)}</strong>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── TAB: LICENCIAS ──────────────────────────────────────────────────────────
function TabLicencias() {
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const filtradas = useMemo(() => LICENCIAS.filter(l => {
    const matchF = filtro === "todas" || (filtro === "pierde" && l.premio === "Pierde") || (filtro === "no_pierde" && l.premio === "No Pierde") || (filtro === "parcial" && l.premio === "Parcial");
    return matchF && l.detalle.toLowerCase().includes(busqueda.toLowerCase());
  }), [filtro, busqueda]);

  return (
    <div>
      <Card title="📂 Criterio por Tipo de Licencia / Ausencia">
        <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
          <input placeholder="🔍 Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)} style={{ flex: 1, minWidth: 180, padding: "8px 12px", border: "1.5px solid #d1d5db", borderRadius: 8, fontSize: 13 }} />
          {[{ k: "todas", l: "Todas" }, { k: "no_pierde", l: "✅ No Pierde" }, { k: "pierde", l: "🚫 Pierde" }, { k: "parcial", l: "⚡ Parcial" }].map(f => (
            <button key={f.k} onClick={() => setFiltro(f.k)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: filtro === f.k ? "#1e40af" : "#f3f4f6", color: filtro === f.k ? "#fff" : "#374151", border: filtro === f.k ? "1.5px solid #1e40af" : "1.5px solid #e5e7eb" }}>{f.l}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>Mostrando {filtradas.length} de {LICENCIAS.length} tipos</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Tipo de Ausencia / Licencia</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Descuento Salarial</th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>Impacto Premio</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((l, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "9px 14px", color: "#111827" }}>{l.detalle}</td>
                  <td style={{ padding: "9px 14px", textAlign: "center" }}><Badge color={l.descuento === "Descuenta" ? "Pierde" : "No Pierde"}>{l.descuento === "Descuenta" ? "Descuenta" : "No descuenta"}</Badge></td>
                  <td style={{ padding: "9px 14px", textAlign: "center" }}>
                    {l.premio === "Parcial"
                      ? <span style={{ background: "#fef3c7", color: "#78350f", border: "1px solid #fcd34d", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>⚡ Depende de jornada</span>
                      : <Badge>{l.premio}</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── TAB: DATOS HISTÓRICOS ───────────────────────────────────────────────────
function TabDatos() {
  const [rango, setRango] = useState("todo");
  const [vista, setVista] = useState("area");

  const datos = useMemo(() => {
    if (rango === "2021") return HISTORICO.filter(d => d.mes.includes("2021"));
    if (rango === "2022") return HISTORICO.filter(d => d.mes.includes("2022"));
    if (rango === "2023") return HISTORICO.filter(d => d.mes.includes("2023"));
    if (rango === "2024") return HISTORICO.filter(d => d.mes.includes("2024"));
    if (rango === "2025+") return HISTORICO.filter(d => d.mes.includes("2025") || d.mes.includes("2026"));
    return HISTORICO;
  }, [rango]);

  const avg = (datos.reduce((s, d) => s + d.prod, 0) / datos.length).toFixed(2);
  const min = Math.min(...datos.map(d => d.prod)).toFixed(2);
  const max = Math.max(...datos.map(d => d.prod)).toFixed(2);
  const ultimo = HISTORICO[HISTORICO.length - 1];

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
        {[
          { l: `Último (${ultimo.mes})`, v: `${ultimo.prod}%`, c: "#1e40af", bg: "#eff6ff" },
          { l: "Promedio período", v: `${avg}%`, c: "#059669", bg: "#f0fdf4" },
          { l: "Mínimo período", v: `${min}%`, c: "#dc2626", bg: "#fef2f2" },
          { l: "Máximo", v: `${max}%`, c: "#7c3aed", bg: "#f5f3ff" },
        ].map(item => (
          <div key={item.l} style={{ background: item.bg, border: "1px solid #e5e7eb", borderRadius: 12, padding: "14px 18px", textAlign: "center" }}>
            <div style={{ fontSize: 10, color: item.c, fontWeight: 600, marginBottom: 3 }}>{item.l}</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: item.c }}>{item.v}</div>
          </div>
        ))}
      </div>

      <Card title="📊 Evolución Histórica — Productividad (%)">
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {[{ k: "todo", l: "Todo (2021–2026)" }, { k: "2021", l: "2021" }, { k: "2022", l: "2022" }, { k: "2023", l: "2023" }, { k: "2024", l: "2024" }, { k: "2025+", l: "2025/2026" }].map(f => (
            <button key={f.k} onClick={() => setRango(f.k)} style={{ padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: rango === f.k ? "#1e40af" : "#f3f4f6", color: rango === f.k ? "#fff" : "#374151", border: rango === f.k ? "1.5px solid #1e40af" : "1.5px solid #e5e7eb" }}>{f.l}</button>
          ))}
          <div style={{ flex: 1 }} />
          {[{ k: "area", l: "Área" }, { k: "bar", l: "Barras" }].map(v => (
            <button key={v.k} onClick={() => setVista(v.k)} style={{ padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: vista === v.k ? "#059669" : "#f3f4f6", color: vista === v.k ? "#fff" : "#374151", border: vista === v.k ? "1.5px solid #059669" : "1.5px solid #e5e7eb" }}>{v.l}</button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          {vista === "area" ? (
            <AreaChart data={datos} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 9 }} interval={rango === "todo" ? 5 : 1} />
              <YAxis tick={{ fontSize: 10 }} domain={[8, 17]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, "Productividad"]} />
              <ReferenceLine y={16} stroke="#059669" strokeDasharray="4 4" label={{ value: "Máx 16%", position: "right", fontSize: 10, fill: "#059669" }} />
              <Area type="monotone" dataKey="prod" name="Productividad %" stroke="#059669" fill="url(#gradP)" strokeWidth={2} dot={datos.length < 20 ? { r: 3, fill: "#059669" } : false} />
            </AreaChart>
          ) : (
            <BarChart data={datos} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 9 }} interval={rango === "todo" ? 5 : 1} />
              <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 17]} />
              <Tooltip formatter={(v) => [`${v}%`, "Productividad"]} />
              <ReferenceLine y={16} stroke="#059669" strokeDasharray="4 4" />
              <Bar dataKey="prod" name="Productividad %" fill="#059669" radius={[3, 3, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </Card>

      <Card title="📋 Tabla completa">
        <div style={{ overflowX: "auto", maxHeight: 300, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ position: "sticky", top: 0, background: "#f9fafb" }}>
              <tr>
                {["Mes", "% Productividad", "vs Máximo"].map(h => (
                  <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...datos].reverse().map((row, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "8px 14px", color: "#111827" }}>{row.mes}</td>
                  <td style={{ padding: "8px 14px", fontWeight: 700, color: row.prod >= 15.5 ? "#065f46" : row.prod >= 13 ? "#92400e" : "#991b1b" }}>{row.prod}%</td>
                  <td style={{ padding: "8px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: "#e5e7eb", borderRadius: 3 }}>
                        <div style={{ width: `${(row.prod / 16) * 100}%`, height: "100%", background: row.prod >= 15.5 ? "#059669" : row.prod >= 13 ? "#f59e0b" : "#ef4444", borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#9ca3af", width: 40 }}>{((row.prod/16)*100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ─── TAB: MODELO WORKDAY ─────────────────────────────────────────────────────

const MESES_WD = ["Sep 2025","Oct 2025","Nov 2025","Dic 2025","Ene 2026","Feb 2026"];

const TIPOS_AUS = [
  "Lic. Médica", "Aus. Injustificada", "Lic. Sin Goce", "Lic. Médica Acc. ART",
  "Aus. con Aviso", "Lic. Especial HR (sin goce)", "Lic. por Excedencia",
];

// Fictional players + shirt numbers as legajo
const JUGADORES = [
  { legajo: "10", nombre: "Maradona, Diego" },
  { legajo: "9",  nombre: "Batistuta, Gabriel" },
  { legajo: "7",  nombre: "Caniggia, Claudio" },
  { legajo: "11", nombre: "Messi, Lionel" },
  { legajo: "3",  nombre: "Ayala, Roberto" },
  { legajo: "5",  nombre: "Redondo, Fernando" },
  { legajo: "6",  nombre: "Sensini, Roberto" },
  { legajo: "8",  nombre: "Veron, Juan Sebastián" },
];

// Pre-built dataset: each player has absences per month (some months with 0, some with 1–3)
const WD_DATA = [
  {
    legajo: "10", nombre: "Maradona, Diego",
    meses: {
      "Sep 2025": [],
      "Oct 2025": [{ tipo: "Lic. Médica", dias: 2 }],
      "Nov 2025": [],
      "Dic 2025": [],
      "Ene 2026": [{ tipo: "Aus. Injustificada", dias: 1 }, { tipo: "Lic. Médica", dias: 3 }],
      "Feb 2026": [],
    }
  },
  {
    legajo: "9", nombre: "Batistuta, Gabriel",
    meses: {
      "Sep 2025": [{ tipo: "Aus. con Aviso", dias: 1 }],
      "Oct 2025": [],
      "Nov 2025": [],
      "Dic 2025": [{ tipo: "Lic. Médica Acc. ART", dias: 5 }],
      "Ene 2026": [],
      "Feb 2026": [],
    }
  },
  {
    legajo: "7", nombre: "Caniggia, Claudio",
    meses: {
      "Sep 2025": [],
      "Oct 2025": [],
      "Nov 2025": [],
      "Dic 2025": [],
      "Ene 2026": [],
      "Feb 2026": [],
    }
  },
  {
    legajo: "11", nombre: "Messi, Lionel",
    meses: {
      "Sep 2025": [{ tipo: "Lic. Médica", dias: 1 }],
      "Oct 2025": [{ tipo: "Lic. Sin Goce", dias: 2 }],
      "Nov 2025": [],
      "Dic 2025": [],
      "Ene 2026": [{ tipo: "Aus. Injustificada", dias: 1 }],
      "Feb 2026": [{ tipo: "Lic. Médica", dias: 2 }, { tipo: "Aus. con Aviso", dias: 1 }],
    }
  },
  {
    legajo: "3", nombre: "Ayala, Roberto",
    meses: {
      "Sep 2025": [],
      "Oct 2025": [],
      "Nov 2025": [{ tipo: "Lic. Médica Acc. ART", dias: 3 }],
      "Dic 2025": [],
      "Ene 2026": [],
      "Feb 2026": [],
    }
  },
  {
    legajo: "5", nombre: "Redondo, Fernando",
    meses: {
      "Sep 2025": [{ tipo: "Aus. Injustificada", dias: 1 }],
      "Oct 2025": [],
      "Nov 2025": [{ tipo: "Lic. Sin Goce", dias: 1 }],
      "Dic 2025": [],
      "Ene 2026": [],
      "Feb 2026": [{ tipo: "Lic. Médica", dias: 4 }],
    }
  },
  {
    legajo: "6", nombre: "Sensini, Roberto",
    meses: {
      "Sep 2025": [],
      "Oct 2025": [{ tipo: "Lic. Médica", dias: 1 }, { tipo: "Aus. Injustificada", dias: 1 }, { tipo: "Lic. Sin Goce", dias: 2 }],
      "Nov 2025": [],
      "Dic 2025": [],
      "Ene 2026": [],
      "Feb 2026": [],
    }
  },
  {
    legajo: "8", nombre: "Veron, Juan Sebastián",
    meses: {
      "Sep 2025": [],
      "Oct 2025": [],
      "Nov 2025": [],
      "Dic 2025": [{ tipo: "Aus. con Aviso", dias: 1 }],
      "Ene 2026": [],
      "Feb 2026": [{ tipo: "Lic. Especial HR (sin goce)", dias: 2 }],
    }
  },
];

function TabWorkday() {
  const [openCell, setOpenCell] = useState(null); // "legajo-mes"

  const toggleCell = (legajo, mes) => {
    const key = `${legajo}-${mes}`;
    setOpenCell(prev => prev === key ? null : key);
  };

  return (
    <div>
      <Card accent="#1e40af" title="⚙️ Modelo de Etiquetado en Workday">
        <Alert type="info">
          Cada tipo de ausencia tiene una <strong>etiqueta de impacto</strong> ("Afecta" / "No Afecta") que alimenta los calculated fields para determinar los premios. La tabla muestra el historial de afectaciones por empleado y mes. Hacé clic en cualquier número de afectaciones para ver el detalle.
        </Alert>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 0 }}>
          <div style={{ background: "#fef2f2", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontWeight: 700, color: "#991b1b", marginBottom: 6, fontSize: 13 }}>🔴 AFECTA — computa para premios</div>
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.9 }}>Aus. Injustificada · Lic. Médica · Lic. Sin Goce · Lic. Médica Acc. ART · Aus. con Aviso · Lic. Especial HR (sin goce) · Lic. por Excedencia</div>
          </div>
          <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontWeight: 700, color: "#065f46", marginBottom: 6, fontSize: 13 }}>🟢 NO AFECTA — no impacta en premios</div>
            <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.9 }}>Vacaciones · Licencia Maternidad · Paro Jornada Completa · Fallecimiento familiar · Casamiento · Paternidad · Hisopado</div>
          </div>
        </div>
      </Card>

      <Card accent="#7c3aed" title="📋 Tabla de Afectaciones por Empleado y Mes">
        <Alert type="info">
          <strong>Clic en el número</strong> de afectaciones de cualquier celda para ver el detalle de las ausencias de ese mes. <strong>0</strong> = sin afectaciones · número en rojo = tiene afectaciones.
        </Alert>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb", background: "#f9fafb", borderRadius: "8px 0 0 0", position: "sticky", left: 0, zIndex: 2, minWidth: 180 }}>
                  Empleado
                </th>
                <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb", background: "#f9fafb", fontSize: 11, minWidth: 60 }}>
                  Legajo
                </th>
                {MESES_WD.map(mes => (
                  <th key={mes} style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb", background: "#f9fafb", fontSize: 11, minWidth: 90, whiteSpace: "nowrap" }}>
                    {mes}
                  </th>
                ))}
                <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#374151", borderBottom: "2px solid #e5e7eb", background: "#f9fafb", fontSize: 11, minWidth: 80 }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {WD_DATA.map((emp, rowIdx) => {
                const totalEmp = MESES_WD.reduce((s, mes) => s + emp.meses[mes].length, 0);
                return (
                  <>
                    <tr key={emp.legajo} style={{ background: rowIdx % 2 === 0 ? "#fff" : "#fafafa" }}>
                      {/* Nombre */}
                      <td style={{ padding: "0 14px", borderBottom: "1px solid #f3f4f6", fontWeight: 600, color: "#111827", position: "sticky", left: 0, background: rowIdx % 2 === 0 ? "#fff" : "#fafafa", zIndex: 1 }}>
                        <div style={{ padding: "10px 0", display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1e40af", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                            #{emp.legajo}
                          </div>
                          <span style={{ fontSize: 13 }}>{emp.nombre}</span>
                        </div>
                      </td>
                      {/* Legajo */}
                      <td style={{ padding: "10px 14px", textAlign: "center", borderBottom: "1px solid #f3f4f6", fontFamily: "monospace", color: "#7c3aed", fontWeight: 700, fontSize: 13 }}>
                        {emp.legajo}
                      </td>
                      {/* Meses */}
                      {MESES_WD.map(mes => {
                        const ausencias = emp.meses[mes];
                        const q = ausencias.length;
                        const key = `${emp.legajo}-${mes}`;
                        const isOpen = openCell === key;

                        return (
                          <td key={mes} style={{ padding: "8px 10px", textAlign: "center", borderBottom: "1px solid #f3f4f6", verticalAlign: "top" }}>
                            {q === 0 ? (
                              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 8, background: "#d1fae5", color: "#065f46", fontWeight: 800, fontSize: 15 }}>
                                0
                              </div>
                            ) : (
                              <div>
                                <button
                                  onClick={() => toggleCell(emp.legajo, mes)}
                                  style={{
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    width: 32, height: 32, borderRadius: 8,
                                    background: isOpen ? "#991b1b" : "#fee2e2",
                                    color: isOpen ? "#fff" : "#991b1b",
                                    fontWeight: 800, fontSize: 15, cursor: "pointer",
                                    border: `2px solid ${isOpen ? "#991b1b" : "#fca5a5"}`,
                                    transition: "all 0.15s",
                                  }}
                                  title={`Ver ${q} afectación${q > 1 ? "es" : ""} de ${emp.nombre} en ${mes}`}
                                >
                                  {q}
                                </button>
                              </div>
                            )}
                          </td>
                        );
                      })}
                      {/* Total */}
                      <td style={{ padding: "10px 14px", textAlign: "center", borderBottom: "1px solid #f3f4f6" }}>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 20,
                          background: totalEmp === 0 ? "#d1fae5" : totalEmp <= 2 ? "#fef3c7" : "#fee2e2",
                          color: totalEmp === 0 ? "#065f46" : totalEmp <= 2 ? "#78350f" : "#991b1b",
                          fontWeight: 800, fontSize: 13,
                        }}>
                          {totalEmp}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded detail rows */}
                    {MESES_WD.map(mes => {
                      const key = `${emp.legajo}-${mes}`;
                      if (openCell !== key) return null;
                      const ausencias = emp.meses[mes];
                      return (
                        <tr key={`detail-${key}`} style={{ background: "#fdf2f2" }}>
                          <td colSpan={MESES_WD.length + 3} style={{ padding: "0 14px 12px 60px", borderBottom: "2px solid #fca5a5" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, marginTop: 8 }}>
                              <div style={{ fontWeight: 700, fontSize: 12, color: "#991b1b" }}>
                                🔍 Detalle afectaciones — {emp.nombre} · {mes}
                              </div>
                              <button onClick={() => setOpenCell(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 16, padding: "0 4px" }}>✕</button>
                            </div>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                              {ausencias.map((a, i) => (
                                <div key={i} style={{ background: "#fff", border: "1.5px solid #fca5a5", borderRadius: 10, padding: "10px 16px", minWidth: 200 }}>
                                  <div style={{ display: "flex", align: "center", gap: 8, marginBottom: 4 }}>
                                    <span style={{ background: "#fee2e2", color: "#991b1b", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                                      🔴 AFECTA
                                    </span>
                                  </div>
                                  <div style={{ fontWeight: 700, color: "#111827", fontSize: 13, marginBottom: 2 }}>{a.tipo}</div>
                                  <div style={{ fontSize: 11, color: "#9ca3af" }}>{a.dias} día{a.dias > 1 ? "s" : ""} · Computa para premios</div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </>
                );
              })}

              {/* Footer: totals per month */}
              <tr style={{ background: "#f0f4ff", borderTop: "2px solid #c7d2fe" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "#1e40af", position: "sticky", left: 0, background: "#f0f4ff", zIndex: 1, fontSize: 12 }}>
                  Total afectaciones
                </td>
                <td style={{ padding: "10px 14px" }} />
                {MESES_WD.map(mes => {
                  const total = WD_DATA.reduce((s, emp) => s + emp.meses[mes].length, 0);
                  return (
                    <td key={mes} style={{ padding: "10px 14px", textAlign: "center" }}>
                      <span style={{ fontWeight: 800, fontSize: 14, color: total === 0 ? "#065f46" : "#991b1b" }}>{total}</span>
                    </td>
                  );
                })}
                <td style={{ padding: "10px 14px", textAlign: "center" }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: "#1e40af" }}>
                    {WD_DATA.reduce((s, emp) => s + MESES_WD.reduce((ss, mes) => ss + emp.meses[mes].length, 0), 0)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 12, fontSize: 11, color: "#9ca3af", fontStyle: "italic" }}>
          * Datos de ejemplo ilustrativos. Jugadores y legajos ficticios usados como referencia de formato.
        </div>
      </Card>

      <Card accent="#059669" title="📐 Campos Calculados necesarios en Workday">
        {[
          { campo: "Ausencias_Computables_MesAnterior", tipo: "Integer", desc: "Cuenta las ausencias etiquetadas como 'Afecta' en el mes anterior al período de cobro." },
          { campo: "Base_Presentismo_Activa", tipo: "Boolean", desc: "Evalúa los últimos 6 meses: true si cumple la regla de distancia mínima entre ausencias (≥3 meses limpios entre afectaciones)." },
          { campo: "Premio_Presentismo_Pct", tipo: "Decimal", desc: "14% si Base_Activa=true Y Ausencias_Computables=0. De lo contrario 0%." },
          { campo: "Premio_Productividad_Pct", tipo: "Decimal", desc: "16% si 0 aus., 12% si 1 aus., 8% si 2 aus., 0% si 3+ aus. Basado en Ausencias_Computables_MesAnterior." },
        ].map((f, i) => (
          <div key={i} style={{ display: "flex", gap: 12, padding: "12px 0", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none" }}>
            <div style={{ minWidth: 8, height: 8, borderRadius: "50%", background: "#059669", marginTop: 6 }} />
            <div>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#065f46" }}>{f.campo} <span style={{ background: "#d1fae5", color: "#065f46", fontSize: 10, borderRadius: 4, padding: "1px 6px", fontFamily: "sans-serif" }}>{f.tipo}</span></div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{f.desc}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ─── TAB: ROADMAP ────────────────────────────────────────────────────────────
function TabRoadmap() {
  const [expanded, setExpanded] = useState(null);

  const estadoLabel = { "completado": "✅ Completado", "en-progreso": "🔵 En Progreso", "pendiente": "⏳ Pendiente" };

  return (
    <div>
      <Card title="🗺️ Roadmap — Automatización de Premios en Workday">
        <Alert type="info">
          Este roadmap contempla el proceso completo desde el mapeo de reglas hasta la automatización full en Workday, incluyendo integración con liquidación de haberes.
        </Alert>

        {/* Timeline visual */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
            {ROADMAP.map((fase, i) => (
              <div key={fase.fase} style={{ flex: 1, position: "relative" }}>
                <div style={{ background: fase.color, height: 6, borderRadius: i === 0 ? "3px 0 0 3px" : i === ROADMAP.length - 1 ? "0 3px 3px 0" : 0 }} />
                <div style={{ position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)", width: 18, height: 18, borderRadius: "50%", background: fase.color, border: "3px solid #fff", boxShadow: "0 0 0 2px " + fase.color }} />
                <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: fase.color, fontWeight: 700 }}>F{fase.fase}</div>
                <div style={{ textAlign: "center", fontSize: 10, color: "#6b7280" }}>{fase.desde}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fase cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ROADMAP.map((fase) => (
            <div key={fase.fase} style={{ border: `1px solid ${fase.color}30`, borderLeft: `4px solid ${fase.color}`, borderRadius: 10, overflow: "hidden" }}>
              <div
                onClick={() => setExpanded(expanded === fase.fase ? null : fase.fase)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", cursor: "pointer", background: expanded === fase.fase ? `${fase.color}08` : "#fff" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: fase.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14 }}>{fase.fase}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#111827" }}>{fase.nombre}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{fase.desde} → {fase.hasta}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Badge color={fase.estado}>{estadoLabel[fase.estado]}</Badge>
                  <span style={{ color: "#9ca3af", fontSize: 18 }}>{expanded === fase.fase ? "▲" : "▼"}</span>
                </div>
              </div>
              {expanded === fase.fase && (
                <div style={{ padding: "0 18px 16px 62px", background: `${fase.color}04` }}>
                  <div style={{ fontWeight: 600, fontSize: 12, color: "#6b7280", marginBottom: 8, marginTop: 4 }}>HITOS</div>
                  <ul style={{ margin: 0, paddingLeft: 16, color: "#374151", fontSize: 13, lineHeight: 2 }}>
                    {fase.hitos.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                  <div style={{ marginTop: 12, background: `${fase.color}15`, borderRadius: 8, padding: "10px 14px" }}>
                    <span style={{ fontWeight: 700, fontSize: 12, color: fase.color }}>📦 Entregable: </span>
                    <span style={{ fontSize: 12, color: "#374151" }}>{fase.entregable}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card accent="#1e40af" title="🔗 Dependencias Clave">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { dep: "Workday Admin access", desc: "Permisos para crear campos calculados y leave types personalizados", urgencia: "Alta" },
            { dep: "Mapeo Leave Types existentes", desc: "Asegurar que cada tipo de ausencia en WD tenga etiqueta Afecta/No Afecta", urgencia: "Alta" },
            { dep: "Aprobación RRHH / Legal", desc: "Validación de reglas de presentismo y productividad con partes interesadas", urgencia: "Media" },
            { dep: "Integración con Payroll", desc: "Conectar output de premios calculados con proceso de liquidación mensual", urgencia: "Alta" },
          ].map((d, i) => (
            <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 14px" }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#111827", marginBottom: 4 }}>{d.dep}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 6 }}>{d.desc}</div>
              <span style={{ fontSize: 11, fontWeight: 700, background: d.urgencia === "Alta" ? "#fee2e2" : "#fef3c7", color: d.urgencia === "Alta" ? "#991b1b" : "#92400e", borderRadius: 4, padding: "2px 8px" }}>Urgencia: {d.urgencia}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState("reglas");

  const tabContent = {
    reglas: <TabReglas />,
    presentismo: <TabPresentismo />,
    productividad: <TabProductividad />,
    combinaciones: <TabCombinaciones />,
    simulador: <TabSimulador />,
    licencias: <TabLicencias />,
    datos: <TabDatos />,
    workday: <TabWorkday />,
    roadmap: <TabRoadmap />,
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#111827" }}>
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #3b82f6 100%)", padding: "24px 32px 0", color: "#fff" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
            <div style={{ fontSize: 28 }}>🏆</div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.5 }}>Sistema de Premios — Indicadores & Automatización</h1>
              <p style={{ margin: 0, fontSize: 12, opacity: 0.8, marginTop: 2 }}>Presentismo (14%) + Productividad (hasta 16%) · Datos 2021–2026 · Roadmap Workday</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 20, overflowX: "auto" }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: "9px 14px", border: "none", borderRadius: "8px 8px 0 0", cursor: "pointer", fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 500, background: activeTab === tab.id ? "#fff" : "rgba(255,255,255,0.12)", color: activeTab === tab.id ? "#1e40af" : "rgba(255,255,255,0.85)", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 32px" }}>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}
