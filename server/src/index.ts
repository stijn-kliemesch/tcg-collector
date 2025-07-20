import express from 'express'
import cors from 'cors'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import cardsRouter from './routes/cards'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

const corsOptions = {
  origin: function (origin: string | undefined, callback: (error: Error | null, success?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if the origin ends with .app.github.dev or is github.dev
    if (origin.endsWith('.app.github.dev') || origin === 'https://github.dev') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
}

// Apply CORS middleware globally
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json())

// Mount the cards router
app.use('/api/cards', cardsRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
