# AssessAI - AI Assessment Creator

Hiring-assignment implementation: [Figma — VedaAI Assessment Creator](https://www.figma.com/design/nB2HMm1BhTpmHcHrmEslGB/VedaAI---Hiring-Assignment?node-id=0-1). The UI follows the spec (assignment form, step flow, exam-paper output) with AssessAI branding, responsive layout, and bonus features below.

## Approach

1. **Structured AI pipeline** — User input is turned into a strict JSON prompt; the LLM response is parsed into `sections[]` with questions, difficulty, and marks. The UI never renders `rawAiResponse`.
2. **Async generation** — `POST /generate` enqueues BullMQ work; a worker calls the LLM, saves MongoDB, caches in Redis, and WebSocket pushes job state to the client.
3. **Redux** — Assignment form draft and generation state live in Redux Toolkit slices; pages dispatch actions on create / generate / view.
4. **Reference files** — Optional PDF/TXT upload on create; text is extracted server-side and injected into the prompt as `fileContent`.
5. **Exam-paper UX** — Output page uses section hierarchy, student info fields, difficulty badges (Easy / Moderate / Hard), marks, MCQ options, server PDF download, print, and regenerate.

## Hiring checklist

| Requirement | Status |
|-------------|--------|
| Assignment form (due date, types, marks, questions, instructions) | Done |
| Optional file upload (PDF / text) | Done |
| Validation (required fields, positive numbers) | Done |
| Redux state management | Done |
| WebSocket real-time generation | Done |
| Sections A/B, difficulty, marks (parsed, not raw LLM) | Done |
| MongoDB + Redis + BullMQ + Express TS | Done |
| Student info + structured question paper UI | Done |
| PDF export (server PDFKit + print) | Done |
| Regenerate + force bypass cache | Done |
| Mobile responsive | Done |

## Features

### Core Functionality
- **Assignment Creation**: Create assignments with custom parameters (marks, questions, types, difficulty)
- **AI Question Generation**: Generate questions using GPT/Claude with structured output
- **Real-time Progress Tracking**: WebSocket-based live updates during generation
- **Professional Output**: Clean, exam-paper-formatted question display
- **PDF Export**: Download question papers in professional PDF format
- **Regeneration**: Re-generate questions without recreating the assignment

### Bonus Features
- **State Management**: Redux for predictable state management
- **Job Queue**: BullMQ for reliable background processing
- **Caching**: Redis caching for improved performance
- **WebSocket Integration**: Real-time communication between frontend and backend
- **Mobile Responsive**: Works seamlessly on all devices
- **Type Safety**: Full TypeScript support

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│  - Assignment Creation Form                         │
│  - Generation Progress Tracker                      │
│  - Question Paper Display                           │
│  - PDF Export                                        │
└──────────────────┬──────────────────────────────────┘
                   │ HTTP + WebSocket
┌──────────────────▼──────────────────────────────────┐
│                  Backend (Express)                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ API Routes                                     │ │
│  │ - POST /api/assignments (Create)              │ │
│  │ - GET /api/assignments/:id (Fetch)            │ │
│  │ - POST /api/assignments/:id/generate (Start)  │ │
│  │ - GET /api/jobs/:jobId (Status)               │ │
│  │ - GET /api/papers/:assignmentId (Fetch Paper) │ │
│  │ - GET /api/papers/:assignmentId/pdf (PDF)     │ │
│  │ - POST multipart /api/assignments (+ file)    │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │ Services                                       │ │
│  │ - AIService (GPT/Claude integration)           │ │
│  │ - CacheService (Redis)                         │ │
│  │ - PDFService                                    │ │
│  └────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────┐ │
│  │ Job Queue (BullMQ)                             │ │
│  │ - Question Generation Worker                   │ │
│  │ - PDF Generation Worker                        │ │
│  └────────────────────────────────────────────────┘ │
└──────────────┬─────────────────┬────────────────────┘
               │                 │
        ┌──────▼──────┐   ┌──────▼──────┐
        │   MongoDB   │   │    Redis    │
        │ - Users     │   │ - Cache     │
        │ - Papers    │   │ - Jobs      │
        └─────────────┘   └─────────────┘
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Docker and Docker Compose
- OpenAI API key or other LLM API key

### Installation

1. **Clone and Setup**
```bash
cd VedaAI\ Project

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

2. **Start Services**
```bash
# In project root
docker-compose up -d
```

3. **Configure Environment**

Backend (`backend/.env`):
```env
PORT=3001
MONGODB_URI=mongodb://root:password@localhost:27017/veda-ai
REDIS_URL=redis://localhost:6379
LLM_API_KEY=your_groq_or_openai_api_key
LLM_MODEL=llama-3.3-70b-versatile
FRONTEND_URL=http://localhost:3000
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

4. **Start Applications**

From the project root (recommended):
```bash
npm run dev:backend   # http://localhost:3001
npm run dev:frontend  # http://localhost:3000
```

Or start each app separately:
```bash
cd backend && npm run dev
cd frontend && npm run dev
```

5. **Verify with demo output (CLI)**

With the backend running:
```bash
npm run demo
```

This creates a sample assignment, generates questions via AI, and prints the question paper to the terminal.

## Usage

### Step 1: Create Assignment
1. Navigate to http://localhost:3000
2. Fill in assignment details:
   - Title, Subject, Description
   - Total Marks & Number of Questions
   - Question Types (MCQ, Short Answer, Essay, True/False)
   - Difficulty Level
   - Due Date
   - Additional Instructions
3. Click "Create Assignment"

### Step 2: Generate Questions
1. Click "Generate Questions"
2. Watch real-time progress via WebSocket
3. AI will generate structured questions with:
   - Proper sections (A, B, C, etc.)
   - Difficulty-based distribution
   - Marks allocation

### Step 3: View & Export Paper
1. Review the generated question paper
2. Fill in student information fields (optional)
3. Click "Export as PDF" to download
4. Use "Regenerate" to create new questions

## Tech Stack

### Frontend
- **Framework**: Next.js 14 with TypeScript
- **State Management**: Redux Toolkit
- **UI**: Tailwind CSS
- **HTTP Client**: Axios
- **PDF Export**: jsPDF + html2canvas
- **Real-time**: WebSocket

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Cache**: Redis
- **Job Queue**: BullMQ
- **AI/LLM**: OpenAI GPT-4 / Claude
- **PDF Generation**: PDFKit

### Infrastructure
- **Containerization**: Docker
- **Process Management**: Docker Compose

## Project Structure

```
VedaAI Project/
├── backend/
│   ├── src/
│   │   ├── config/          # DB, Redis, Queue config
│   │   ├── models/          # Mongoose schemas
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API endpoints
│   │   ├── jobs/            # Job workers
│   │   ├── websocket/       # WebSocket handler
│   │   ├── utils/           # Types & helpers
│   │   └── index.ts         # Entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── store/           # Redux slices
│   │   ├── services/        # API client
│   │   ├── hooks/           # Custom hooks
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helpers
│   │   └── styles/          # CSS
│   ├── package.json
│   └── tsconfig.json
├── shared/                  # Shared types & utilities
└── docker-compose.yml
```

## API Endpoints

### Assignments
```
POST   /api/assignments              Create (JSON or multipart + referenceFile)
POST   /api/assignments/:id/reference  Replace reference file
GET    /api/assignments/:id          Get assignment details
POST   /api/assignments/:id/generate Start question generation ({ force: true })
```

### Generation & output
```
GET    /api/jobs/:jobId              Get job status
GET    /api/papers/:assignmentId     Get generated paper (structured JSON)
GET    /api/papers/:assignmentId/pdf Download PDF (PDFKit)
```

## Data Models

### Assignment
```typescript
{
  title: string;
  subject: string;
  totalMarks: number;
  numberOfQuestions: number;
  questionTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  dueDate: Date;
  additionalInstructions?: string;
  teacherId: string;
}
```

### Question Paper
```typescript
{
  assignmentId: ObjectId;
  sections: Section[];
  rawAiResponse: string;
  generatedAt: Date;
  metadata: {
    totalMarks: number;
    totalQuestions: number;
    generationTime: number;
  };
}
```

### Section
```typescript
{
  id: string;
  title: string;
  instructions: string;
  questions: Question[];
}
```

### Question
```typescript
{
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  marks: number;
  options?: string[];
}
```

## Testing

```bash
# Backend
cd backend
npm run lint
npm run build

# Frontend
cd frontend
npm run build
```

## Security

- Environment variables for sensitive data
- Input validation on frontend and backend
- Error handling without exposing internal details
- CORS configured properly

## Error Handling

The system includes comprehensive error handling:
- Validation errors with specific messages
- Network error recovery
- Job failure handling with retries
- WebSocket reconnection logic

## Performance

- **Caching**: Redis for question paper caching
- **Job Queue**: BullMQ for reliable background processing
- **Pagination**: Ready for implementation
- **Database Indexes**: Configured on frequently queried fields

## UI/UX Features

- Clean, professional design inspired by exam papers
- Responsive layout for mobile/tablet/desktop
- Real-time progress indication
- Color-coded difficulty levels:
  - 🟢 Easy
  - 🟡 Medium
  - 🔴 Hard
- Intuitive workflow (Create → Generate → View → Export)

## Contributing

1. Create feature branches
2. Follow TypeScript conventions
3. Test thoroughly before PR
4. Update documentation

## Future Enhancements

- [ ] User authentication & authorization
- [ ] Multiple template designs
- [ ] Answer key generation
- [ ] Question bank management
- [ ] Analytics dashboard
- [ ] Batch question generation
- [ ] Custom branding options
- [ ] Integration with Learning Management Systems (LMS)

## Troubleshooting

### MongoDB Connection Failed
```bash
docker-compose logs mongodb
# Ensure MongoDB is running and password is correct
```

### Redis Connection Failed
```bash
docker-compose logs redis
# Ensure Redis is running on port 6379
```

### API Key Issues
- Verify LLM_API_KEY in backend/.env
- Check API key is valid and has sufficient quota
- Ensure model name (LLM_MODEL) is correct

### WebSocket Connection Issues
- Check NEXT_PUBLIC_WS_URL is correct
- Verify backend is running
- Check browser console for errors

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Check API health endpoint: `GET http://localhost:3001/health`

## License

MIT License - Feel free to use and modify

---

Built with LOVE ❤️ 
