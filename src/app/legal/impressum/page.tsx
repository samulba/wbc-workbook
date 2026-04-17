import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum des Wellbeing Workbook",
};

export default function ImpressumPage() {
  return (
    <>
      <h1>Impressum</h1>
      <p className="text-sm text-gray-500">Angaben gemäß § 5 TMG</p>

      <h2>Anbieter</h2>
      <p>
        <strong>Samuel Liba Unternehmensberatung</strong><br />
        Geranienweg 7<br />
        85586 Poing<br />
        Deutschland
      </p>

      <h2>Vertretungsberechtigter</h2>
      <p>Samuel Liba</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: <a href="tel:+4917631335327">+49 176 31335327</a><br />
        E-Mail: <a href="mailto:info@vicinusmedia.com">info@vicinusmedia.com</a>
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
        DE450215192
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        Samuel Liba<br />
        Geranienweg 7<br />
        85586 Poing
      </p>

      <h2>Streitbeilegung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung
        (OS) bereit:{" "}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
          https://ec.europa.eu/consumers/odr
        </a>
        . Unsere E-Mail-Adresse findest du oben im Impressum.
      </p>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor
        einer Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach den
        §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
        übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach
        Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      </p>
      <p>
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
        nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche
        Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten
        Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen
        werden wir diese Inhalte umgehend entfernen.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
        wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte
        auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist
        stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
        Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
        Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
        Verlinkung nicht erkennbar.
      </p>
      <p>
        Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch
        ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei
        Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend
        entfernen.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen
        Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
        Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen
        des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen
        Autors bzw. Erstellers.
      </p>
      <p>
        Downloads und Kopien dieser Seite sind nur für den privaten, nicht
        kommerziellen Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht
        vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet.
      </p>

      <p className="text-xs text-gray-400 mt-8">
        <em>
          Hinweis: Das Wellbeing Workbook wird übergangsweise durch Samuel Liba
          Unternehmensberatung betrieben, bis die Wellbeing Concepts GbR eigene
          Firmendaten erhalten hat. Die Verantwortlichkeit für Inhalt und
          Datenverarbeitung liegt so lange beim oben genannten Anbieter.
        </em>
      </p>
    </>
  );
}
