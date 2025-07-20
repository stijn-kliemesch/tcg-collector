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
  origin: true, // Since we're using GitHub Codespaces' port visibility setting
  credentials: true
}

// Apply CORS middleware
app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json())

// Mount routes
app.use('/api/cards', cardsRouter)

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
