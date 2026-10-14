import { createHighlighterCore, type HighlighterCore, type ThemedToken } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';
import type { CodeLang } from './types';

let ready: Promise<HighlighterCore> | undefined;

const load = (): Promise<HighlighterCore> => {
  ready ??= createHighlighterCore({
    themes: [import('@shikijs/themes/github-light'), import('@shikijs/themes/tokyo-night')],
    langs: [
      import('@shikijs/langs/typescript'),
      import('@shikijs/langs/javascript'),
      import('@shikijs/langs/yaml'),
      import('@shikijs/langs/hcl'),
      import('@shikijs/langs/python'),
      import('@shikijs/langs/bash'),
      import('@shikijs/langs/json'),
      import('@shikijs/langs/toml'),
      import('@shikijs/langs/markdown'),
      import('@shikijs/langs/diff'),
    ],
    engine: createJavaScriptRegexEngine({ forgiving: true }),
  });
  return ready;
};

import { type Token, type TokenLine } from './tokens';

const toToken = (t: ThemedToken): Token => {
  const style = t.htmlStyle as Record<string, string> | undefined;
  return style ? { text: t.content, style } : { text: t.content };
};

export const highlight = async (code: string, lang: CodeLang): Promise<TokenLine[]> => {
  const hl = await load();
  const language = lang === 'text' ? 'text' : lang;
  const { tokens } = hl.codeToTokens(code, {
    lang: language,
    themes: { light: 'github-light', dark: 'tokyo-night' },
    defaultColor: false,
  });
  return tokens.map((line) => line.map(toToken));
};
