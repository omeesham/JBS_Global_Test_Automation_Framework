/**
 * scripts/lib/stopwords.mjs
 *
 * Shared stopword set for tokenization across scanner scripts.
 * Imported by ticket-skill-scan.mjs and run-relevant-scan.mjs so both stay in sync.
 * Excludes domain-meaningful tokens like "plan", "spec", "test".
 */

export const STOPWORDS = new Set([
  "the","a","an","of","in","to","for","on","at","by","with","from","is","are","was","were",
  "be","been","being","have","has","had","do","does","did","will","would","can","could",
  "may","might","must","shall","should","that","this","these","those","it","its","my","your",
  "his","her","our","their","all","any","every","some","not","and","or","but","if","then",
  "when","what","where","who","why","how","also","just","now","here","there","i","you","we",
  "they","he","she","them","us","me","him","which","such","more","less","than","very",
  "out","up","down","over","under","into","onto","upon","off","about","against","between",
  "during","before","after","above","below","through","without","within","across",
  "yes","ok","okay","one","two","three","first","next","old","good","bad",
  "make","made","get","got","see","look","took","go","goes","went","come","came",
  "use","used","using","done","mean","means","need","needs",
  "let","like","want","find","found","tell","ask","asked","please",
  "via","per","upon","onto","through","along","among",
  "say","said","sure","seem","seems","really","try","tried","again","still",
]);
