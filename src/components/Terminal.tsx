type Props = { text: string; title?: string };

function Terminal({ text, title = 'You should see' }: Props) {
  return (
    <div className="terminal">
      <div className="terminal-head">
        <span className="terminal-dots" aria-hidden="true"><i /><i /><i /></span>
        <span>{title}</span>
      </div>
      <pre className="terminal-body">{text}</pre>
    </div>
  );
}

export default Terminal;
