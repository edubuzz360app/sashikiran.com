document.addEventListener('DOMContentLoaded', () => {
  const chatHistory = document.querySelector('.chat-history');
  const inputField = document.getElementById('chat-input-field');
  const submitBtn = document.getElementById('chat-submit-btn');
  const docContentArea = document.getElementById('doc-content-area');
  const docTabsContainer = document.getElementById('doc-tabs-container');

  // Mock Content for the Document Viewer
  const mockDocs = {
    'prd': `
<h1>Product Requirements Document (PRD)</h1>
<h2>System Overview</h2>
<p>An Autonomous Data Analysis Platform designed to ingest, process, and extract insights from raw datasets using a multi-agent swarm architecture.</p>

<h2>Core Architecture</h2>
<ul>
  <li><strong>Ingestion Engine:</strong> Handles CSV, JSON, and direct database connections.</li>
  <li><strong>Analysis Swarm:</strong> Evaluator Agent, Statistician Agent, and Visualization Agent.</li>
  <li><strong>Output Layer:</strong> Generates dynamic dashboards and executive summaries.</li>
</ul>

<h2>Target Personas</h2>
<ul>
  <li>Data Engineers (System integrators)</li>
  <li>Business Analysts (Primary consumers)</li>
</ul>

<div class="code-block">
// Initial Schema Draft
{
  "project_id": "auto-data-01",
  "data_sources": ["aws_s3", "snowflake"],
  "agent_confidence_threshold": 0.85
}
</div>
    `,
    'ux': `
<h1>UX Flows & Interaction Models</h1>
<h2>Core Loop</h2>
<p>The primary interaction model is asynchronous collaboration. Users upload data and assign a high-level goal, then step back while the agent swarm works.</p>

<h3>Flow 1: Data Ingestion</h3>
<ol>
  <li>User clicks "New Analysis Workspace".</li>
  <li>System prompts for data source connection.</li>
  <li>User provides credentials or uploads file.</li>
  <li>System runs preliminary schema check and confirms ingestion.</li>
</ol>

<h3>Flow 2: Agent Monitoring</h3>
<p>While the swarm is processing, the user sees a live "thought stream" of the agents communicating and deciding on statistical models.</p>
    `,
    'arch': `
<h1>System Architecture</h1>
<h2>Node Infrastructure</h2>
<p>The system relies on an event-driven architecture to coordinate agent actions.</p>
<ul>
  <li>Event Bus: Apache Kafka</li>
  <li>Agent State: Redis</li>
  <li>Long-term Memory: Vector Database (Pinecone)</li>
</ul>
    `
  };

  // Switch tabs manually
  docTabsContainer.addEventListener('click', (e) => {
    const tab = e.target.closest('.doc-tab');
    if (!tab) return;

    document.querySelectorAll('.doc-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.getAttribute('data-target');
    if (mockDocs[target]) {
      docContentArea.innerHTML = mockDocs[target];
    } else {
      docContentArea.innerHTML = '<p style="color: var(--plat-text-muted); padding: 2rem;">Document not yet generated.</p>';
    }
  });

  // Handle Choice Chip clicks
  chatHistory.addEventListener('click', (e) => {
    const chip = e.target.closest('.choice-chip');
    if (!chip) return;

    const replyText = chip.getAttribute('data-reply');
    
    // Disable previous chips
    const allChips = chip.closest('.msg-choices');
    allChips.style.pointerEvents = 'none';
    allChips.style.opacity = '0.5';

    processUserInput(replyText);
  });

  // Handle manual input submit
  submitBtn.addEventListener('click', () => {
    const text = inputField.value.trim();
    if (text) {
      inputField.value = '';
      processUserInput(text);
    }
  });

  inputField.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      submitBtn.click();
    }
  });

  function processUserInput(text) {
    appendUserMessage(text);
    
    // Scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Simulate AI thinking and response
    setTimeout(() => {
      appendAIResponseForDataPlatform();
    }, 1500);
  }

  function appendUserMessage(text) {
    const msgHTML = `
      <div class="chat-msg msg-user">
        <div class="msg-avatar">YOU</div>
        <div class="msg-content">
          <div class="msg-bubble">${text}</div>
        </div>
      </div>
    `;
    chatHistory.insertAdjacentHTML('beforeend', msgHTML);
  }

  function appendAIResponseForDataPlatform() {
    const msgHTML = `
      <div class="chat-msg msg-ai">
        <div class="msg-avatar">
          <svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/></svg>
        </div>
        <div class="msg-content">
          <div class="msg-bubble">
            Excellent. An Autonomous Data Analysis Platform requires a robust multi-agent architecture.<br><br>
            I've drafted the initial Product Requirements Document (PRD) establishing the core ingestion and analysis loops.
            
            <div class="system-action">
              <svg viewBox="0 0 24 24"><path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"/></svg>
              <span>Generating prd.md...</span>
            </div>
          </div>
          
          <div class="msg-bubble" style="margin-top: 1rem; border-top-left-radius: 12px;">
            To proceed, we need to define the UX Strategy. How should the human interact with the swarm?
          </div>

          <!-- Next Set of Choices -->
          <div class="msg-choices">
            <button class="choice-chip" data-reply="Define UX Strategy: Asynchronous delegation. The human assigns goals, the swarm works in the background.">
              Asynchronous Delegation (Set and forget)
              <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
            <button class="choice-chip" data-reply="Define UX Strategy: Synchronous copilot. The human guides the swarm step-by-step.">
              Synchronous Copilot (Step-by-step)
              <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    chatHistory.insertAdjacentHTML('beforeend', msgHTML);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    // Simulate Document update in Right Pane
    setTimeout(() => {
      const prdTab = document.querySelector('.doc-tab[data-target="prd"]');
      if(prdTab) prdTab.click();
      
      const spinner = document.querySelector('.system-action svg');
      if(spinner) {
        spinner.style.animation = 'none';
        spinner.innerHTML = '<path d="M20 6L9 17l-5-5"/>';
        spinner.style.stroke = '#10B981'; // Green check
        spinner.nextElementSibling.innerText = 'prd.md generated successfully';
      }
    }, 1200);
  }
});
