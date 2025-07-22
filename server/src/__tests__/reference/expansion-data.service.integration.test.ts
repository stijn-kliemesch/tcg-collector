import { ExpansionService } from '../../services/reference/expansion.service'

describe('Reference Data Management Integration', () => {
  let expansionService: ExpansionService
  
  // Increase timeout for web scraping
  jest.setTimeout(60000)

  beforeAll(() => {
    expansionService = new ExpansionService()
  })

  it('should be able to fetch expansion data for storage', async () => {
    // This simulates what the bootstrap process would do
    const expansions = await expansionService.getExpansions()
    
    expect(expansions.length).toBeGreaterThan(0)
    expect(expansions[0]).toMatchObject({
      name: expect.any(String),
      languages: expect.any(Array),
      cardSetCount: expect.any(Number),
      promoSetCount: expect.any(Number)
    })

    console.log(`✅ Successfully fetched ${expansions.length} expansions for reference data storage`)
  })

  it('should have well-formed data suitable for caching', async () => {
    const expansions = await expansionService.getExpansions()
    
    // Verify data structure is suitable for JSON storage
    const jsonString = JSON.stringify(expansions)
    const parsed = JSON.parse(jsonString)
    
    expect(parsed).toEqual(expansions)
    expect(parsed.length).toBe(expansions.length)
    
    // Verify required fields are present
    expansions.forEach(expansion => {
      expect(expansion.name).toBeTruthy()
      expect(Array.isArray(expansion.languages)).toBe(true)
      expect(typeof expansion.cardSetCount).toBe('number')
      expect(typeof expansion.promoSetCount).toBe('number')
    })
  })
})
