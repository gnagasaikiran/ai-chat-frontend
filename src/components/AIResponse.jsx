export default function AIResponse({ data }) {
  const { summary, keyPoints, nextActions } = data || {};

  return (
    <div>
      {summary && (
        <>
          <strong>Summary</strong>
          <p>{summary}</p>
        </>
      )}

      {Array.isArray(keyPoints) && keyPoints.length > 0 && (
        <>
          <strong>Key Points</strong>
          <ul>
            {keyPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {Array.isArray(nextActions) && nextActions.length > 0 && (
        <>
          <strong>Next Actions</strong>
          <ul>
            {nextActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
