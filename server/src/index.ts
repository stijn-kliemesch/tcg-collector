import express from 'express'
import cors from 'cors'
import cardsRouter from './routes/cards'

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
