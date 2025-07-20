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
  origin: 'https://literate-eureka-97x56g4wr4ppfpjgp-5173.app.github.dev',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 204,
  preflightContinue: false
}

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json())

// Routes with CORS
app.use('/api/cards', cors({
  origin: 'https://literate-eureka-97x56g4wr4ppfpjgp-5173.app.github.dev',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}), cardsRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
