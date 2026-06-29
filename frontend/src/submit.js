// submit.js

import { useStore } from './store';
import { shallow } from 'zustand/shallow';

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const SubmitButton = () => {
  const { nodes, edges } = useStore(selector, shallow);

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/pipelines/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        alert('Error: Could not reach the backend.');
        return;
      }

      const data = await response.json();

      alert(
        `Pipeline Analysis\n` +
        `─────────────────\n` +
        `Nodes     : ${data.num_nodes}\n` +
        `Edges     : ${data.num_edges}\n` +
        `Valid DAG : ${data.is_dag ? '✅ Yes' : '❌ No'}`
      );
    } catch (err) {
      alert('Error: Could not connect to the backend. Is it running?');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <button type="button" onClick={handleSubmit}>Submit</button>
    </div>
  );
};