// The stand-in voice until recorded narration exists: the browser's own speech, resolved when the line ends.
const pick = (): SpeechSynthesisVoice | undefined => {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
  const prefer = ['Samantha (Enhanced)', 'Ava (Premium)', 'Zoe (Premium)', 'Samantha', 'Google US English'];
  return prefer.map((n) => voices.find((v) => v.name === n)).find(Boolean) ?? voices.find((v) => v.lang === 'en-US') ?? voices[0];
};

export const speak = (text: string, rate = 1): Promise<void> =>
  new Promise((resolve) => {
    const fallback = Math.max(2800, text.split(/\s+/).length * 330) / rate;
    if (typeof speechSynthesis === 'undefined') {
      window.setTimeout(resolve, fallback);
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voice = pick();
    if (voice) u.voice = voice;
    u.rate = rate;
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      resolve();
    };
    u.onend = done;
    u.onerror = done;
    speechSynthesis.speak(u);
    // Some browsers never fire onend (no voices installed, tab in the background): never hang the journey.
    window.setTimeout(done, fallback + 4000);
  });

export const stopSpeaking = () => {
  if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
};
