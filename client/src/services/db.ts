import { type Low } from 'lowdb'
import { browser } from 'lowdb/lib'

// Define your database structure
interface Card {
  id: string
  name: string
  set: string
  condition: string
  quantity: number
  tags: string[]
  notes?: string
  dateAdded: string
}

interface DB {
  cards: Card[]
}

// Initial database state
const defaultData: DB = {
  cards: []
}

class DatabaseService {
  private db: Low<DB>
  private static instance: DatabaseService

  private constructor() {
    const file = join(__dirname, '../data/db.json')
    const adapter = new JSONFile<DB>(file)
    this.db = new Low<DB>(adapter, defaultData)
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  async init() {
    await this.db.read()
    this.db.data ||= defaultData
    await this.db.write()
  }

  // Cards operations
  async getAllCards(): Promise<Card[]> {
    return this.db.data.cards
  }

  async addCard(card: Omit<Card, 'id' | 'dateAdded'>): Promise<Card> {
    const newCard: Card = {
      ...card,
      id: crypto.randomUUID(),
      dateAdded: new Date().toISOString()
    }
    this.db.data.cards.push(newCard)
    await this.db.write()
    return newCard
  }

  async updateCard(id: string, updates: Partial<Omit<Card, 'id'>>): Promise<Card | null> {
    const cardIndex = this.db.data.cards.findIndex(card => card.id === id)
    if (cardIndex === -1) return null

    const updatedCard = {
      ...this.db.data.cards[cardIndex],
      ...updates
    }
    this.db.data.cards[cardIndex] = updatedCard
    await this.db.write()
    return updatedCard
  }

  async deleteCard(id: string): Promise<boolean> {
    const initialLength = this.db.data.cards.length
    this.db.data.cards = this.db.data.cards.filter(card => card.id !== id)
    if (this.db.data.cards.length === initialLength) return false
    
    await this.db.write()
    return true
  }

  async searchCards(query: string): Promise<Card[]> {
    const lowercaseQuery = query.toLowerCase()
    return this.db.data.cards.filter(card => 
      card.name.toLowerCase().includes(lowercaseQuery) ||
      card.set.toLowerCase().includes(lowercaseQuery) ||
      card.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }
}

// Export a singleton instance
export const db = DatabaseService.getInstance()
export type { Card, DB }
