import Stack from './Stack';
import type { QuizQuestion } from '../lib/types';

type Props = { questions: QuizQuestion[]; answers: Record<number, number>; onAnswer: (q: number, option: number) => void };

function Quiz({ questions, answers, onAnswer }: Props) {
  return (
    <div className="quiz">
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        const correctIndex = q.options.findIndex((o) => o.correct);
        const correct = q.options[correctIndex];
        return (
          <div key={qi} className="quiz-q" data-stable="quiz" data-state={chosen === undefined ? 'open' : chosen === correctIndex ? 'right' : 'wrong'}>
            <p className="quiz-question"><span className="quiz-n">{qi + 1}</span>{q.q}</p>
            <div className="quiz-options" role="group" aria-label={`Question ${qi + 1}`}>
              {q.options.map((o, oi) => (
                <button
                  key={oi}
                  type="button"
                  className="quiz-option"
                  aria-pressed={chosen === oi}
                  data-mark={chosen === undefined ? undefined : oi === correctIndex ? 'right' : chosen === oi ? 'wrong' : undefined}
                  onClick={() => onAnswer(qi, oi)}
                >
                  <span className="quiz-letter">{String.fromCharCode(65 + oi)}</span>
                  <span>{o.text}</span>
                </button>
              ))}
            </div>
            <Stack index={chosen === undefined ? 0 : chosen + 1} className="quiz-feedback">
              {[
                <p key="none" className="quiz-hint">Pick the answer you believe. You can change it.</p>,
                ...q.options.map((o, oi) => (
                  <div key={oi} className="quiz-why" data-right={o.correct || undefined}>
                    <p><b>{o.correct ? 'Correct.' : 'Not quite.'}</b> {o.why}</p>
                    {!o.correct && correct && (
                      <p className="quiz-answer"><b>The answer:</b> {correct.text}. {correct.why}</p>
                    )}
                  </div>
                )),
              ]}
            </Stack>
          </div>
        );
      })}
    </div>
  );
}

export default Quiz;
