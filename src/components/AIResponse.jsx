export default function AIResponse({ data }) {
  if (!data || typeof data !== "object") return null;

  const summary = data.summary ?? "";
  const keyPoints = Array.isArray(data.keyPoints) ? data.keyPoints : [];
  const nextActions = Array.isArray(data.nextActions) ? data.nextActions : [];

  return (
    <div>
      {summary && (
        <>
          <strong>Summary</strong>
          <p style={{ marginTop: 6 }}>{summary}</p>
        </>
      )}

      {keyPoints.length > 0 && (
        <>
          <strong>Key Points</strong>
          <ul style={{ marginTop: 6 }}>
            {keyPoints.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}

      {nextActions.length > 0 && (
        <>
          <strong>Next Actions</strong>
          <ul style={{ marginTop: 6 }}>
            {nextActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
