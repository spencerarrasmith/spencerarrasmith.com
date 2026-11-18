/* ═════════════════════════════════════════════════════════
   signs-conjuncts-data.js — what the Signs & Conjuncts page adds
   to telugu-data.js: the order of the sign columns, which conjunct
   forms are written below vs beside, and the notes on combinations
   that are not drawn the usual way.
   Needs ../telugu-data.js loaded first.

   HOW THE NOTES WERE FOUND
     They describe the shapes in Noto Sans Telugu, the font this app
     loads. Each consonant + sign and each conjunct was shaped with the
     font and looked at in a browser, then grouped by how it is drawn.
     Handwriting, printed books and other fonts differ in detail, so read
     these as "the letters to look at twice", not as spelling rules.

   A SIGN NOTE   { id, title, text, letters, signs, usual }
     letters × signs   every combination the note covers (so the page
                       can mark those cells in the chart)
     usual             an ordinary combination to compare against
   A CONJUNCT NOTE   { id, title, text, examples, usual }
═════════════════════════════════════════════════════════ */
(function (root) {
  'use strict';
  const TD = root.TeluguData || (typeof require === 'function' ? require('../telugu-data.js') : null);
  if (!TD) throw new Error('signs-conjuncts-data: load telugu-data.js first');

  /* Columns of the chart, in the order a textbook chart lists them.
     The last two are the rarest and only shown with "Include rare and extra letters". */
  const SIGN_ORDER = ['ా', 'ి', 'ీ', 'ు', 'ూ', 'ృ', 'ౄ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ', 'ం', 'ః', 'ౢ', 'ౣ'];

  /* Conjunct (second-letter) forms, by where the reduced letter goes. */
  const BELOW  = 'ఖగఘఙజఝఞటఠడఢణతథదధరఱలషహ';    // tucked under the first letter
  const BESIDE = 'కచఛనపఫబభమయళవశస';            // added after the first letter, at its lower right
  const HOST = 'క';                              // the first letter used for the examples
  const ALT = { 'ష': 'త్ష' };                    // after క, ష becomes the fused letter క్ష; this is its usual below-form

  const signNotes = [
    { id: 'o-flat', title: 'ొ ో ౌ on ఘ ఝ మ య',
      text: 'These four letters draw the o-signs as one flat stroke across the top, with the tail running off to the right. On other letters (కో నో లో) the top is a looped mark. So మొ, మో and మౌ are close in shape: tell them apart by the small marks at the right-hand end.',
      letters: 'ఘఝమయ', signs: 'ొోౌ', usual: ['కొ', 'కో', 'కౌ'] },
    { id: 'u-own', title: 'ు ూ on జ ఞ ప ఫ వ ళ హ',
      text: 'These seven letters have their own hand-drawn forms for ు and ూ. The sign is worked into the letter instead of simply hanging below it as on కు and కూ.',
      letters: 'జఞపఫవళహ', signs: 'ుూ', usual: ['కు', 'కూ'] },
    { id: 'ya-i', title: 'ి ీ on య',
      text: 'య is the odd one out for ి and ీ. Its top is two hooks, so the sign cannot sit on a head stroke as it does elsewhere: యి comes out shorter than య itself, and యీ is wider than other ీ forms.',
      letters: 'య', signs: 'ిీ', usual: ['కి', 'కీ'] },
    { id: 'ha-aa', title: 'ా on హ',
      text: 'హా is drawn more compactly than other ా forms: the tick tucks over the letter instead of adding width to it.',
      letters: 'హ', signs: 'ా', usual: ['కా'] },
    { id: 'ai-two', title: 'ై is two parts',
      text: 'ై is ె plus a second mark ౖ. Typing ె then ౖ gives the same shape as the single sign ై, so you may meet it written either way.',
      letters: '', signs: '', usual: [] },
    { id: 'vocalic', title: 'ృ and ౄ',
      text: 'ృ hangs below the letter at the lower right. ౄ is the long version, the same with an extra tick. Both turn up in Sanskrit loanwords (కృష్ణ), not in everyday Telugu words.',
      letters: '', signs: '', usual: [] },
    { id: 'nasal', title: 'ం and ః are not vowel signs',
      text: 'ం (a small circle) nasalises the vowel and ః (two dots) adds a puff of breath after it. They are listed here because they attach to the letter in the same way.',
      letters: '', signs: '', usual: [] },
  ];

  const conjNotes = [
    { id: 'first-full', title: 'Only the second letter shrinks',
      text: 'The first letter of a conjunct keeps its full form; the second becomes the reduced form shown on its card. ర్క is a full ర followed by a small క.',
      examples: ['ర్క', 'ల్ప', 'మ్మ'], usual: [] },
    { id: 'kssa', title: 'క్ష is a fused letter',
      text: 'After క, ష fuses into the single letter క్ష (counted as a letter in the alphabet). After any other letter ష has its ordinary below-form.',
      examples: ['క్ష'], usual: ['త్ష'] },
    { id: 'ra', title: '్ర (ర as the second letter)',
      text: 'ర as the second letter is a curved stroke that sweeps under the first letter. It is redrawn to fit each first letter, wider under ప్ర and మ్ర than under క్ర.',
      examples: ['క్ర', 'గ్ర', 'ప్ర', 'మ్ర'], usual: [] },
    { id: 'ta', title: '్త comes in three widths',
      text: 'The below-form of త is narrow after క గ ఠ ర శ, wide after ఘ ఝ ఞ ణ మ య ఱ హ, and sits low after ష. After any other letter it takes its ordinary form.',
      examples: ['క్త', 'గ్త', 'ఘ్త', 'మ్త', 'ష్త'], usual: ['ద్త'] },
  ];

  /* Guard: everything named here must exist in telugu-data.js */
  (function check() {
    const bad = [];
    const have = new Set(TD.signs.map(s => s.sign));
    SIGN_ORDER.forEach(s => { if (!have.has(s)) bad.push('sign ' + s); });
    const cons = TD.letters.filter(l => l.cat !== 'Vowel' && l.cat !== 'Conjunct').map(l => l.ch);
    cons.forEach(c => { const n = (BELOW.includes(c) ? 1 : 0) + (BESIDE.includes(c) ? 1 : 0); if (n !== 1) bad.push('conjunct family of ' + c); });
    [...BELOW, ...BESIDE].forEach(c => { if (!cons.includes(c)) bad.push('unknown conjunct letter ' + c); });
    signNotes.forEach(n => { [...n.letters].forEach(c => { if (!cons.includes(c)) bad.push(n.id + ': ' + c); }); [...n.signs].forEach(s => { if (!have.has(s)) bad.push(n.id + ': sign ' + s); }); });
    if (bad.length) throw new Error('signs-conjuncts-data: ' + bad.join(', '));
  })();

  const data = Object.freeze({ SIGN_ORDER, BELOW, BESIDE, HOST, ALT, signNotes, conjNotes });
  root.SignsConjunctsData = data;
  if (typeof module !== 'undefined' && module.exports) module.exports = data;
})(typeof window !== 'undefined' ? window : globalThis);
