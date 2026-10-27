/* Kursinhalte – europäisches Portugiesisch (PT-PT).
   Hinweis: PT-PT nutzt "tu" im Alltag, "está a fazer" statt "está fazendo",
   "pequeno-almoço" statt "café da manhã", "autocarro" statt "ônibus", "telemóvel" statt "celular". */

const LEVELS = [
  { id: 'A1', title: 'Anfänger', open: true },
  { id: 'A2', title: 'Grundlagen', open: false },
  { id: 'B1', title: 'Mittelstufe', open: false },
  { id: 'B2', title: 'Fortgeschritten', open: false },
];

/* Vokabeln: id, pt, de, Beispiel (pt/de), Kategorie */
const VOCAB = [
  // Begrüßung
  { id: 'olá', pt: 'Olá', de: 'Hallo', ex: 'Olá, tudo bem?', exde: 'Hallo, alles gut?', cat: 'Begrüßung' },
  { id: 'bom-dia', pt: 'Bom dia', de: 'Guten Morgen / Guten Tag', ex: 'Bom dia, senhor Silva.', exde: 'Guten Morgen, Herr Silva.', cat: 'Begrüßung' },
  { id: 'boa-tarde', pt: 'Boa tarde', de: 'Guten Nachmittag', ex: 'Boa tarde a todos!', exde: 'Guten Tag allerseits!', cat: 'Begrüßung' },
  { id: 'boa-noite', pt: 'Boa noite', de: 'Guten Abend / Gute Nacht', ex: 'Boa noite, até amanhã.', exde: 'Gute Nacht, bis morgen.', cat: 'Begrüßung' },
  { id: 'tudo-bem', pt: 'Tudo bem?', de: 'Alles gut?', ex: 'Olá! Tudo bem contigo?', exde: 'Hallo! Alles gut bei dir?', cat: 'Begrüßung' },
  { id: 'adeus', pt: 'Adeus', de: 'Auf Wiedersehen', ex: 'Adeus, até logo!', exde: 'Auf Wiedersehen, bis später!', cat: 'Begrüßung' },
  { id: 'até-logo', pt: 'Até logo', de: 'Bis später', ex: 'Até logo, boa tarde!', exde: 'Bis später, schönen Nachmittag!', cat: 'Begrüßung' },
  { id: 'obrigado', pt: 'Obrigado / Obrigada', de: 'Danke (m / w)', ex: 'Muito obrigado pela ajuda.', exde: 'Vielen Dank für die Hilfe.', cat: 'Höflichkeit' },
  { id: 'por-favor', pt: 'Por favor', de: 'Bitte (Aufforderung)', ex: 'Um café, por favor.', exde: 'Einen Kaffee, bitte.', cat: 'Höflichkeit' },
  { id: 'de-nada', pt: 'De nada', de: 'Gern geschehen', ex: '— Obrigada! — De nada.', exde: '— Danke! — Gern geschehen.', cat: 'Höflichkeit' },
  { id: 'desculpe', pt: 'Desculpe', de: 'Entschuldigung', ex: 'Desculpe, não percebo.', exde: 'Entschuldigung, ich verstehe nicht.', cat: 'Höflichkeit' },
  { id: 'com-licença', pt: 'Com licença', de: 'Mit Verlaub / Darf ich mal durch', ex: 'Com licença, posso passar?', exde: 'Darf ich mal vorbei?', cat: 'Höflichkeit' },
  { id: 'sim', pt: 'Sim', de: 'Ja', ex: 'Sim, é verdade.', exde: 'Ja, das stimmt.', cat: 'Höflichkeit' },
  { id: 'não', pt: 'Não', de: 'Nein / nicht', ex: 'Não, obrigado.', exde: 'Nein, danke.', cat: 'Höflichkeit' },
  // Vorstellung
  { id: 'eu', pt: 'eu', de: 'ich', ex: 'Eu sou alemão.', exde: 'Ich bin Deutscher.', cat: 'Vorstellung' },
  { id: 'tu', pt: 'tu', de: 'du', ex: 'Tu és de Lisboa?', exde: 'Kommst du aus Lissabon?', cat: 'Vorstellung' },
  { id: 'chamo-me', pt: 'Chamo-me …', de: 'Ich heiße …', ex: 'Chamo-me Philipp.', exde: 'Ich heiße Philipp.', cat: 'Vorstellung' },
  { id: 'como-te-chamas', pt: 'Como te chamas?', de: 'Wie heißt du?', ex: 'Olá! Como te chamas?', exde: 'Hallo! Wie heißt du?', cat: 'Vorstellung' },
  { id: 'prazer', pt: 'Muito prazer', de: 'Freut mich sehr', ex: 'Muito prazer em conhecer-te.', exde: 'Freut mich, dich kennenzulernen.', cat: 'Vorstellung' },
  { id: 'sou-de', pt: 'Sou de …', de: 'Ich komme aus …', ex: 'Sou da Alemanha.', exde: 'Ich komme aus Deutschland.', cat: 'Vorstellung' },
  { id: 'alemanha', pt: 'a Alemanha', de: 'Deutschland', ex: 'Moro na Alemanha.', exde: 'Ich wohne in Deutschland.', cat: 'Vorstellung' },
  { id: 'portugal', pt: 'Portugal', de: 'Portugal', ex: 'Vou viver em Portugal.', exde: 'Ich werde in Portugal leben.', cat: 'Vorstellung' },
  { id: 'trabalho', pt: 'o trabalho', de: 'die Arbeit', ex: 'O meu trabalho é em Lisboa.', exde: 'Meine Arbeit ist in Lissabon.', cat: 'Vorstellung' },
  { id: 'falo', pt: 'Falo um pouco de português', de: 'Ich spreche ein bisschen Portugiesisch', ex: 'Falo um pouco de português.', exde: 'Ich spreche ein bisschen Portugiesisch.', cat: 'Vorstellung' },
  { id: 'não-percebo', pt: 'Não percebo', de: 'Ich verstehe nicht', ex: 'Desculpe, não percebo.', exde: 'Entschuldigung, ich verstehe nicht.', cat: 'Vorstellung' },
  { id: 'devagar', pt: 'mais devagar', de: 'langsamer', ex: 'Pode falar mais devagar?', exde: 'Können Sie langsamer sprechen?', cat: 'Vorstellung' },
  // Café / Alltag
  { id: 'café', pt: 'o café', de: 'der Kaffee / das Café', ex: 'Quero um café, por favor.', exde: 'Ich möchte einen Kaffee, bitte.', cat: 'Café' },
  { id: 'bica', pt: 'a bica', de: 'der Espresso (Lissabon)', ex: 'Uma bica e um pastel de nata.', exde: 'Einen Espresso und ein Pastel de Nata.', cat: 'Café' },
  { id: 'água', pt: 'a água', de: 'das Wasser', ex: 'Uma garrafa de água.', exde: 'Eine Flasche Wasser.', cat: 'Café' },
  { id: 'pão', pt: 'o pão', de: 'das Brot', ex: 'O pão está fresco.', exde: 'Das Brot ist frisch.', cat: 'Café' },
  { id: 'pequeno-almoço', pt: 'o pequeno-almoço', de: 'das Frühstück', ex: 'O pequeno-almoço é às oito.', exde: 'Das Frühstück ist um acht.', cat: 'Café' },
  { id: 'conta', pt: 'a conta', de: 'die Rechnung', ex: 'A conta, por favor.', exde: 'Die Rechnung, bitte.', cat: 'Café' },
  { id: 'quanto-custa', pt: 'Quanto custa?', de: 'Was kostet das?', ex: 'Quanto custa o bilhete?', exde: 'Was kostet das Ticket?', cat: 'Café' },
  { id: 'quero', pt: 'Queria …', de: 'Ich hätte gern …', ex: 'Queria uma sandes mista.', exde: 'Ich hätte gern ein Schinken-Käse-Sandwich.', cat: 'Café' },
  // Zahlen
  { id: 'um', pt: 'um / uma', de: 'eins', ex: 'Um café, por favor.', exde: 'Einen Kaffee, bitte.', cat: 'Zahlen' },
  { id: 'dois', pt: 'dois / duas', de: 'zwei', ex: 'Dois cafés, por favor.', exde: 'Zwei Kaffee, bitte.', cat: 'Zahlen' },
  { id: 'três', pt: 'três', de: 'drei', ex: 'Tenho três irmãos.', exde: 'Ich habe drei Geschwister.', cat: 'Zahlen' },
  { id: 'quatro', pt: 'quatro', de: 'vier', ex: 'São quatro euros.', exde: 'Das macht vier Euro.', cat: 'Zahlen' },
  { id: 'cinco', pt: 'cinco', de: 'fünf', ex: 'Cinco minutos.', exde: 'Fünf Minuten.', cat: 'Zahlen' },
  { id: 'dez', pt: 'dez', de: 'zehn', ex: 'Custa dez euros.', exde: 'Es kostet zehn Euro.', cat: 'Zahlen' },
];

/* Lektionen. Übungstypen:
   teach   – neues Wort/neue Phrase lernen (Vokabel-ID)
   choose  – Multiple Choice (q, options, answer-Index)
   listen  – Hörverstehen: audio spricht `say`, Auswahl
   build   – Satz aus Wörtern bauen (de-Vorgabe, words, answer)
   type    – Übersetzen durch Tippen (q, accept[])
   gap     – Lückentext (before, after, options, answer)
   match   – Paare zuordnen
   tip     – Grammatikbox (kein Punkt)
   dialog  – Mini-Dialog lesen & hören
*/
const UNITS = [
  {
    id: 'a1-u1', level: 'A1', icon: '👋', title: 'Olá! Begrüßen & Vorstellen',
    desc: 'Hallo sagen, sich vorstellen, höflich sein', xp: 40,
    vocab: ['olá', 'bom-dia', 'boa-tarde', 'boa-noite', 'adeus', 'obrigado', 'por-favor', 'de-nada', 'chamo-me', 'como-te-chamas', 'prazer', 'sou-de'],
    exercises: [
      { t: 'teach', v: 'olá' },
      { t: 'teach', v: 'bom-dia' },
      { t: 'choose', q: 'Wie sagst du „Guten Morgen“ auf Portugiesisch?', options: ['Boa noite', 'Bom dia', 'Adeus', 'De nada'], a: 1 },
      { t: 'teach', v: 'boa-tarde' },
      { t: 'teach', v: 'boa-noite' },
      { t: 'listen', say: 'Boa tarde', options: ['Bom dia', 'Boa tarde', 'Boa noite', 'Olá'], a: 1 },
      { t: 'match', pairs: [['Olá', 'Hallo'], ['Adeus', 'Auf Wiedersehen'], ['Boa noite', 'Gute Nacht'], ['Bom dia', 'Guten Morgen']] },
      { t: 'tip', title: 'Höflich sein: obrigado oder obrigada?',
        html: '<p>Das Wort für „Danke“ richtet sich nach <b>dir</b>, nicht nach dem Gegenüber:</p><ul><li>Ein Mann sagt <b>obrigado</b></li><li>Eine Frau sagt <b>obrigada</b></li></ul><p>Typisch portugiesisch: <b>muito obrigado</b> (vielen Dank) und die Antwort <b>de nada</b>.</p>' },
      { t: 'teach', v: 'obrigado' },
      { t: 'teach', v: 'por-favor' },
      { t: 'type', q: 'Danke! (Du bist ein Mann.)', accept: ['obrigado', 'muito obrigado'] },
      { t: 'teach', v: 'de-nada' },
      { t: 'gap', before: '— Obrigada! — ', after: '.', options: ['De nada', 'Boa noite', 'Por favor'], a: 0, hint: 'Gern geschehen' },
      { t: 'teach', v: 'chamo-me' },
      { t: 'teach', v: 'como-te-chamas' },
      { t: 'build', de: 'Ich heiße Ana.', words: ['Chamo-me', 'Ana', 'Sou', 'tu', 'Como'], answer: ['Chamo-me', 'Ana'] },
      { t: 'build', de: 'Wie heißt du?', words: ['te', 'Como', 'chamas', 'Chamo-me', 'eu'], answer: ['Como', 'te', 'chamas'] },
      { t: 'teach', v: 'prazer' },
      { t: 'teach', v: 'sou-de' },
      { t: 'listen', say: 'Sou da Alemanha', options: ['Ich komme aus Portugal', 'Ich komme aus Deutschland', 'Ich heiße Alemanha', 'Ich bin müde'], a: 1 },
      { t: 'type', q: 'Guten Abend / Gute Nacht', accept: ['boa noite'] },
      { t: 'dialog', title: 'Erstes Treffen',
        lines: [
          { who: 'Inês', pt: 'Bom dia! Como te chamas?', de: 'Guten Morgen! Wie heißt du?' },
          { who: 'Du', pt: 'Bom dia! Chamo-me Philipp.', de: 'Guten Morgen! Ich heiße Philipp.' },
          { who: 'Inês', pt: 'Muito prazer, Philipp. Sou a Inês.', de: 'Freut mich, Philipp. Ich bin Inês.' },
          { who: 'Du', pt: 'Muito prazer! Sou da Alemanha.', de: 'Freut mich! Ich komme aus Deutschland.' },
        ] },
    ],
  },
  {
    id: 'a1-u2', level: 'A1', icon: '☕', title: 'Im Café bestellen',
    desc: 'Kaffee, Brot, Rechnung – und Zahlen bis zehn', xp: 40,
    vocab: ['café', 'bica', 'água', 'pão', 'pequeno-almoço', 'quero', 'conta', 'quanto-custa', 'um', 'dois', 'três', 'dez'],
    needs: 'a1-u1',
    exercises: [
      { t: 'teach', v: 'café' }, { t: 'teach', v: 'bica' }, { t: 'teach', v: 'água' },
      { t: 'match', pairs: [['o café', 'der Kaffee'], ['a água', 'das Wasser'], ['o pão', 'das Brot'], ['a bica', 'der Espresso']] },
      { t: 'teach', v: 'quero' },
      { t: 'build', de: 'Ich hätte gern einen Kaffee, bitte.', words: ['Queria', 'um', 'café', 'por', 'favor', 'conta'], answer: ['Queria', 'um', 'café', 'por', 'favor'] },
      { t: 'teach', v: 'conta' }, { t: 'teach', v: 'quanto-custa' },
      { t: 'listen', say: 'A conta, por favor', options: ['Die Rechnung, bitte', 'Ein Wasser, bitte', 'Was kostet das?', 'Guten Tag'], a: 0 },
      { t: 'tip', title: 'Der Artikel: o / a',
        html: '<p>Portugiesisch hat zwei Geschlechter:</p><table class="conj"><tr><td>männlich</td><td>o café</td><td>um café</td></tr><tr><td>weiblich</td><td>a água</td><td>uma água</td></tr></table><p class="muted small">Faustregel: Wörter auf <b>-o</b> sind meist männlich, auf <b>-a</b> meist weiblich.</p>' },
      { t: 'gap', before: '', after: ' água', options: ['o', 'a'], a: 1, hint: 'Artikel' },
      { t: 'type', q: 'Was kostet das?', accept: ['quanto custa'] },
    ],
  },
  { id: 'a1-u3', level: 'A1', icon: '🛒', title: 'Im Supermarkt', desc: 'Bald verfügbar', xp: 40, soon: true, needs: 'a1-u2', exercises: [], vocab: [] },
  { id: 'a1-u4', level: 'A1', icon: '🚌', title: 'Bus, Metro & Zug', desc: 'Bald verfügbar', xp: 40, soon: true, needs: 'a1-u3', exercises: [], vocab: [] },
];

/* Dialogszenarien (Vorschau; weitere folgen) */
const SCENES = [
  { id: 'alltag', icon: '🏠', title: 'Alltag', soon: false },
  { id: 'beruf', icon: '💼', title: 'Beruf', soon: true },
  { id: 'restaurant', icon: '🍽️', title: 'Restaurant', soon: true },
  { id: 'supermarkt', icon: '🛒', title: 'Supermarkt', soon: true },
  { id: 'verkehr', icon: '🚇', title: 'Öffentl. Verkehr', soon: true },
];
