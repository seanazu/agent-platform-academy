import CopyButton from './CopyButton';

function CommandBlock({ command }: { command: string }) {
  return (
    <div className="command">
      <span className="command-prompt" aria-hidden="true">$</span>
      <pre className="command-text">{command}</pre>
      <CopyButton text={command} />
    </div>
  );
}

export default CommandBlock;
