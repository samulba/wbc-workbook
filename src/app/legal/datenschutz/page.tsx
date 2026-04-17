import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung",
  description: "Wie die Wellbeing Workbook-App mit personenbezogenen Daten umgeht",
};

export default function DatenschutzPage() {
  return (
    <>
      <h1>Datenschutzerklärung</h1>
      <p className="text-sm text-gray-500">
        Stand: {new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        Verantwortlich für die Datenverarbeitung auf dieser Website ist:<br />
        <strong>Wellbeing Concepts GbR</strong><br />
        [Straße und Hausnummer]<br />
        [PLZ] [Ort]<br />
        E-Mail: <a href="mailto:datenschutz@wellbeing-concepts.de">datenschutz@wellbeing-concepts.de</a>
      </p>

      <h2>2. Welche Daten wir erheben</h2>
      <h3>a) Registrierungsdaten</h3>
      <ul>
        <li>E-Mail-Adresse (zur Anmeldung und Kontaktaufnahme)</li>
        <li>Passwort (gehasht gespeichert)</li>
        <li>Anzeigename (optional)</li>
      </ul>

      <h3>b) Nutzungsdaten</h3>
      <ul>
        <li>Projekte, Räume und Raumanalysen, die du selbst anlegst</li>
        <li>Hochgeladene Bilder (Moodboards, Raumfotos, Inspirationen)</li>
        <li>Favoriten, Shopping-Listen, Notizen</li>
        <li>Freigeschaltete Achievements und Streak-Statistiken</li>
        <li>Feedback, das du freiwillig sendest</li>
      </ul>

      <h3>c) Technische Daten</h3>
      <ul>
        <li>
          IP-Adresse (nur kurzzeitig zur Fehlerbehebung und Missbrauchsabwehr;
          keine dauerhafte Speicherung im Rahmen unseres Produkts)
        </li>
        <li>Browser-Typ und Version, Betriebssystem</li>
        <li>Zugriffszeitpunkt</li>
        <li>Error-Logs (bei technischen Fehlern, anonymisiert nach 30 Tagen gelöscht)</li>
      </ul>

      <h2>3. Rechtsgrundlagen</h2>
      <p>
        Wir verarbeiten deine Daten auf folgenden Rechtsgrundlagen:
      </p>
      <ul>
        <li>
          <strong>Art. 6 Abs. 1 lit. b DSGVO</strong> (Vertragserfüllung) — für
          die Nutzung der Anwendung (Account, Projekte, Analysen)
        </li>
        <li>
          <strong>Art. 6 Abs. 1 lit. f DSGVO</strong> (berechtigtes Interesse) —
          für Betrieb, Sicherheit und Fehlerbehebung
        </li>
        <li>
          <strong>Art. 6 Abs. 1 lit. a DSGVO</strong> (Einwilligung) — für
          optionale Features wie KI-Analyse deiner Raumfotos
        </li>
      </ul>

      <h2>4. Dienste von Dritten (Auftragsverarbeiter)</h2>
      <p>
        Zum Betrieb der Anwendung setzen wir folgende externe Dienste ein.
        Mit allen bestehen Auftragsverarbeitungsverträge (AVV) gemäß Art. 28 DSGVO:
      </p>

      <h3>a) Supabase (Authentifizierung, Datenbank, Storage)</h3>
      <p>
        <strong>Anbieter:</strong> Supabase Inc., 970 Toa Payoh North #07-04,
        Singapore 318992<br />
        <strong>Zweck:</strong> Account-Management, Speicherung deiner Projektdaten
        und hochgeladenen Bilder.<br />
        <strong>Server-Standort:</strong> EU (Frankfurt)<br />
        <strong>Datenschutz:</strong>{" "}
        <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
          supabase.com/privacy
        </a>
      </p>

      <h3>b) Vercel (Hosting)</h3>
      <p>
        <strong>Anbieter:</strong> Vercel Inc., 340 S Lemon Ave #4133, Walnut CA
        91789, USA<br />
        <strong>Zweck:</strong> Auslieferung der Web-Anwendung. Zugriffs-Logs enthalten
        kurzzeitig IP-Adressen zur Missbrauchsabwehr.<br />
        <strong>Datenübermittlung:</strong> EU Standardvertragsklauseln (Art. 46 DSGVO)<br />
        <strong>Datenschutz:</strong>{" "}
        <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
          vercel.com/legal/privacy-policy
        </a>
      </p>

      <h3>c) Anthropic (KI-Analyse)</h3>
      <p>
        <strong>Anbieter:</strong> Anthropic PBC, 548 Market St PMB 90375, San
        Francisco CA 94104, USA<br />
        <strong>Zweck:</strong> Analyse von Raumfotos und Textantworten mit Claude
        (nur auf deine ausdrückliche Anfrage hin).<br />
        <strong>Zero-Data-Retention:</strong> Anthropic speichert API-Inhalte laut
        aktuellen Nutzungsbedingungen nicht langfristig und nutzt sie nicht zum
        Trainieren ihrer Modelle.<br />
        <strong>Datenübermittlung:</strong> EU Standardvertragsklauseln (Art. 46 DSGVO)<br />
        <strong>Datenschutz:</strong>{" "}
        <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">
          anthropic.com/privacy
        </a>
      </p>

      <h3>d) Stability AI (Bildgenerierung)</h3>
      <p>
        <strong>Anbieter:</strong> Stability AI Ltd., 86 — 90 Paul Street, London
        EC2A 4NE, Vereinigtes Königreich<br />
        <strong>Zweck:</strong> Generierung von Raumvisualisierungen auf Basis
        deiner Angaben und hochgeladener Fotos (nur auf deine ausdrückliche
        Anfrage).<br />
        <strong>Datenübermittlung:</strong> EU Standardvertragsklauseln (Art. 46 DSGVO)<br />
        <strong>Datenschutz:</strong>{" "}
        <a href="https://stability.ai/privacy-policy" target="_blank" rel="noopener noreferrer">
          stability.ai/privacy-policy
        </a>
      </p>

      <h2>5. Cookies</h2>
      <p>
        Wir setzen ausschließlich <strong>technisch notwendige Cookies</strong> ein,
        die für den Betrieb der Anwendung erforderlich sind (Einwilligung gemäß
        § 25 Abs. 2 Nr. 2 TTDSG nicht erforderlich):
      </p>
      <ul>
        <li>
          <strong>Session-Cookie (Supabase):</strong> Hält deine Anmeldung aktiv.
          Laufzeit: bis zum Logout bzw. Session-Ablauf.
        </li>
        <li>
          <strong>Theme-Einstellung (localStorage):</strong> Speichert deine
          Entscheidung zwischen hellem und dunklem Modus. Keine Weitergabe.
        </li>
      </ul>
      <p>
        Tracking-Cookies oder Analysetools (z. B. Google Analytics) setzen wir{" "}
        <strong>nicht</strong> ein. Ein Cookie-Banner ist daher nicht erforderlich.
      </p>

      <h2>6. Speicherdauer</h2>
      <ul>
        <li>Account-Daten: bis zur Löschung des Accounts durch dich</li>
        <li>Projekte &amp; Analysen: bis zur Löschung durch dich</li>
        <li>Error-Logs: maximal 30 Tage, danach automatische Löschung</li>
        <li>
          Feedback: solange zur Bearbeitung nötig, spätestens 24 Monate nach Eingang
        </li>
      </ul>

      <h2>7. Deine Rechte</h2>
      <p>Du hast jederzeit das Recht auf:</p>
      <ul>
        <li>
          <strong>Auskunft</strong> (Art. 15 DSGVO) — Kopie deiner gespeicherten
          Daten
        </li>
        <li>
          <strong>Berichtigung</strong> (Art. 16 DSGVO)
        </li>
        <li>
          <strong>Löschung</strong> (Art. 17 DSGVO) — direkt in der App unter{" "}
          <em>Einstellungen → Account löschen</em>
        </li>
        <li>
          <strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO)
        </li>
        <li>
          <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — direkt in der
          App unter <em>Einstellungen → Meine Daten exportieren</em> (JSON-Datei)
        </li>
        <li>
          <strong>Widerspruch</strong> (Art. 21 DSGVO)
        </li>
        <li>
          <strong>Beschwerde</strong> bei einer Aufsichtsbehörde (Art. 77 DSGVO)
        </li>
      </ul>
      <p>
        Zur Ausübung deiner Rechte genügt eine formlose Nachricht an{" "}
        <a href="mailto:datenschutz@wellbeing-concepts.de">
          datenschutz@wellbeing-concepts.de
        </a>
        .
      </p>

      <h2>8. Datensicherheit</h2>
      <p>
        Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL/TLS-
        Verfahren zur verschlüsselten Übertragung. Passwörter werden ausschließlich
        als Hashes (bcrypt) über Supabase Auth gespeichert. Der Zugriff auf die
        Datenbank ist durch Row-Level-Security auf den jeweiligen Account
        beschränkt.
      </p>

      <h2>9. Änderungen dieser Datenschutzerklärung</h2>
      <p>
        Wir passen diese Erklärung an, wenn sich Rechtslage oder Funktionsumfang
        ändern. Die jeweils aktuelle Fassung ist immer hier einsehbar.
      </p>

      <p className="text-xs text-gray-400 mt-8">
        <em>
          Hinweis: Markierungen in eckigen Klammern [ ] müssen vor Go-Live mit
          den tatsächlichen Angaben der Wellbeing Concepts GbR ersetzt werden.
          Die Angaben zu Dienstleistern sind nach bestem Wissen erstellt —
          rechtliche Prüfung durch eine fachkundige Person wird empfohlen.
        </em>
      </p>
    </>
  );
}
