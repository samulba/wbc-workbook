import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AGB",
  description: "Allgemeine Geschäftsbedingungen des Wellbeing Workbook",
};

export default function AGBPage() {
  return (
    <>
      <h1>Allgemeine Geschäftsbedingungen</h1>
      <p className="text-sm text-gray-500">
        Stand: {new Date().toLocaleDateString("de-DE", { month: "long", year: "numeric" })}
      </p>

      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB“) gelten für die
        Nutzung der Web-Anwendung <strong>Wellbeing Workbook</strong> (nachfolgend
        „Anwendung“), betrieben durch die <strong>Wellbeing Concepts GbR</strong>{" "}
        (nachfolgend „Anbieter“), und regeln das Vertragsverhältnis zwischen dem
        Anbieter und dir als Nutzer:in (nachfolgend „Nutzer“).
      </p>

      <h2>§ 2 Vertragsgegenstand</h2>
      <p>
        Der Anbieter stellt eine Software-as-a-Service-Anwendung bereit, mit der
        Nutzer ihr persönliches Raumkonzept in strukturierten Modulen entwickeln
        können. Enthalten sind u. a.:
      </p>
      <ul>
        <li>Projekt- und Raumverwaltung</li>
        <li>Modul-1-Raumanalyse (Farben, Materialien, Wirkung, Moodboard)</li>
        <li>Produktempfehlungen mit Affiliate-Links</li>
        <li>KI-gestützte Raum-Analysen und Visualisierungen (begrenzt auf tägliche Kontingente)</li>
        <li>Shopping-Listen und Favoriten</li>
        <li>Teilen-Funktion via öffentlichen Links</li>
      </ul>

      <h2>§ 3 Registrierung und Account</h2>
      <p>
        Die Nutzung der Anwendung setzt eine Registrierung mit gültiger
        E-Mail-Adresse und Passwort voraus. Der Nutzer versichert, dass seine
        Angaben wahrheitsgemäß sind. Er ist verpflichtet, seine Zugangsdaten
        geheim zu halten. Der Anbieter haftet nicht für Schäden, die durch
        missbräuchliche Nutzung des Accounts entstehen, soweit der Nutzer die
        missbräuchliche Nutzung zu verantworten hat.
      </p>

      <h2>§ 4 Preise und Leistungsumfang</h2>
      <p>
        Die Nutzung der Anwendung ist aktuell{" "}
        <strong>kostenfrei</strong> (Beta-Phase). Der Anbieter behält sich vor,
        einzelne Funktionen oder Bereiche künftig kostenpflichtig anzubieten. In
        einem solchen Fall wird der Nutzer <strong>vorher</strong> deutlich
        informiert und kann entscheiden, ob er die kostenpflichtige Leistung
        buchen möchte. Ohne aktive Zustimmung wird nichts berechnet.
      </p>

      <h2>§ 5 Affiliate-Links</h2>
      <p>
        Die Anwendung enthält Links zu Produkten bei Partner-Shops. Klickt der
        Nutzer auf einen solchen Link und tätigt einen Kauf, erhält der Anbieter
        unter Umständen eine Provision. Für den Nutzer entstehen dadurch{" "}
        <strong>keine Mehrkosten</strong>. Die Kaufabwicklung erfolgt
        ausschließlich zwischen dem Nutzer und dem Partner-Shop; es gelten die
        AGB und Datenschutzbestimmungen des jeweiligen Partners.
      </p>

      <h2>§ 6 KI-Funktionen</h2>
      <p>
        Analysen und Visualisierungen durch KI (Anthropic Claude, Stability AI)
        werden auf Grundlage der vom Nutzer bereitgestellten Daten erstellt. Der
        Nutzer bestätigt, dass er die nötigen Rechte an hochgeladenen Bildern
        besitzt. KI-Ergebnisse sind als <strong>Vorschläge</strong> zu verstehen;
        der Anbieter übernimmt keine Gewähr für ihre Richtigkeit, Vollständigkeit
        oder Verwertbarkeit.
      </p>
      <p>
        Tägliche Kontingente für KI-Aufrufe können durch den Anbieter angepasst
        werden, um Missbrauch und unverhältnismäßige Kosten zu vermeiden.
      </p>

      <h2>§ 7 Pflichten des Nutzers</h2>
      <p>Der Nutzer verpflichtet sich, die Anwendung nicht zu nutzen, um:</p>
      <ul>
        <li>rechtswidrige, beleidigende oder jugendgefährdende Inhalte hochzuladen</li>
        <li>Urheber- oder Persönlichkeitsrechte Dritter zu verletzen</li>
        <li>die technische Infrastruktur zu beeinträchtigen (z. B. DDoS, Scraping, Reverse-Engineering)</li>
        <li>Sicherheitsmaßnahmen oder Kontingente zu umgehen</li>
      </ul>
      <p>
        Bei Verstoß behält sich der Anbieter vor, den Account zu sperren und
        Inhalte zu entfernen.
      </p>

      <h2>§ 8 Haftung</h2>
      <p>
        Der Anbieter haftet unbeschränkt für Vorsatz und grobe Fahrlässigkeit
        sowie nach dem Produkthaftungsgesetz. Für leichte Fahrlässigkeit haftet
        der Anbieter nur bei Verletzung wesentlicher Vertragspflichten
        (Kardinalpflichten) und begrenzt auf den vertragstypischen,
        vorhersehbaren Schaden.
      </p>
      <p>
        Der Anbieter übernimmt keine Gewähr für ständige Verfügbarkeit der
        Anwendung. Geplante Wartungsarbeiten werden nach Möglichkeit angekündigt.
      </p>

      <h2>§ 9 Datenschutz</h2>
      <p>
        Informationen zur Verarbeitung personenbezogener Daten finden sich in
        der{" "}
        <a href="/legal/datenschutz">Datenschutzerklärung</a>. Der Nutzer kann
        seine Daten jederzeit unter{" "}
        <em>Einstellungen → Meine Daten exportieren</em> herunterladen und seinen
        Account unter <em>Einstellungen → Account löschen</em> vollständig
        entfernen.
      </p>

      <h2>§ 10 Laufzeit und Kündigung</h2>
      <p>
        Der Vertrag beginnt mit der Registrierung und läuft auf unbestimmte Zeit.
        Der Nutzer kann ihn jederzeit ohne Angabe von Gründen durch Löschen seines
        Accounts beenden. Der Anbieter kann den Vertrag mit einer Frist von
        30 Tagen kündigen; das Recht zur außerordentlichen Kündigung (insb. bei
        Verstoß gegen § 7) bleibt unberührt.
      </p>

      <h2>§ 11 Änderungen der AGB</h2>
      <p>
        Der Anbieter ist berechtigt, diese AGB anzupassen, wenn Änderungen aus
        gesetzlichen, technischen oder wirtschaftlichen Gründen erforderlich
        werden. Nutzer werden über Änderungen rechtzeitig per E-Mail oder in der
        Anwendung informiert. Widerspricht der Nutzer nicht innerhalb von 30 Tagen,
        gelten die geänderten AGB als angenommen.
      </p>

      <h2>§ 12 Schlussbestimmungen</h2>
      <p>
        Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Ist der
        Nutzer Verbraucher, gelten zwingende Verbraucherschutzvorschriften seines
        gewöhnlichen Aufenthaltsstaates unberührt fort. Gerichtsstand für
        Kaufleute ist der Sitz des Anbieters.
      </p>
      <p>
        Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die
        Wirksamkeit der übrigen Bestimmungen unberührt.
      </p>

      <p className="text-xs text-gray-400 mt-8">
        <em>
          Hinweis: Diese AGB-Vorlage ist branchenüblich formuliert, ersetzt aber
          keine anwaltliche Einzelprüfung. Vor Go-Live sollten die Platzhalter
          ausgefüllt und der Text anwaltlich auf den konkreten Geschäftsbetrieb
          angepasst werden.
        </em>
      </p>
    </>
  );
}
