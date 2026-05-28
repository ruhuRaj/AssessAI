/**
 * End-to-end demo: create assignment, generate questions, print paper output.
 * Requires backend on http://localhost:3001 and Docker (MongoDB + Redis).
 */

const API = process.env.API_URL || 'http://localhost:3001';

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `HTTP ${res.status} ${path}`);
  }
  return body;
}

async function waitForJob(jobId, maxWaitMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const status = await request(`/api/jobs/${jobId}`);
    if (status.state === 'completed') return status;
    if (status.state === 'failed') {
      throw new Error('Question generation job failed');
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error('Timed out waiting for generation');
}

async function main() {
  console.log('AssessAI demo — checking API health...');
  const health = await request('/health');
  console.log('Health:', health);

  console.log('\nCreating assignment...');
  const created = await request('/api/assignments', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Demo Science Quiz',
      subject: 'Science',
      totalMarks: 10,
      numberOfQuestions: 3,
      questionTypes: ['MCQ', 'Short Answer'],
      difficulty: 'easy',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      additionalInstructions: 'Keep questions concise for demo output.',
    }),
  });

  const assignmentId = created.assignment._id;
  console.log('Assignment ID:', assignmentId);

  console.log('\nStarting question generation...');
  const gen = await request(`/api/assignments/${assignmentId}/generate`, {
    method: 'POST',
    body: JSON.stringify({ force: false }),
  });

  if (gen.cached && gen.paper) {
    console.log('(used cached paper)');
  } else {
    console.log('Job ID:', gen.jobId);
    process.stdout.write('Waiting for AI');
    await waitForJob(gen.jobId);
    console.log(' done\n');
  }

  console.log('Fetching question paper...\n');
  const paper = await request(`/api/papers/${assignmentId}`);

  console.log('='.repeat(60));
  console.log('GENERATED QUESTION PAPER');
  console.log('='.repeat(60));
  console.log(
    `Marks: ${paper.metadata.totalMarks} | Questions: ${paper.metadata.totalQuestions}`
  );
  console.log(`Generated: ${paper.generatedAt}\n`);

  for (const section of paper.sections) {
    console.log(`--- ${section.title} ---`);
    if (section.instructions) console.log(section.instructions);
    console.log('');
    for (const q of section.questions) {
      console.log(`Q${q.id}. [${q.difficulty}, ${q.marks} marks] ${q.text}`);
      if (q.options?.length) {
        q.options.forEach((opt, i) => {
          console.log(`   ${String.fromCharCode(97 + i)}) ${opt}`);
        });
      }
      console.log('');
    }
  }

  console.log('='.repeat(60));
  console.log('Demo complete. Open the UI at http://localhost:3000');
  console.log(`Paper URL: http://localhost:3000/paper/${assignmentId}`);
}

main().catch((err) => {
  console.error('\nDemo failed:', err.message);
  console.error(
    'Ensure Docker is running (npm run docker:up) and backend is up (npm run dev:backend).'
  );
  process.exit(1);
});
