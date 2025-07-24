# Development Archive

This directory contains the experimental and test scripts from our Pokemon card recognition development adventure. These scripts have been organized into proper services in the main codebase, but are preserved here for historical reference.

## Archived Scripts

### `debug-garganacl.ts`
- **Purpose**: Early debugging of Garganacl recognition
- **Status**: Functionality moved to `PokemonCardAnalyzer.findPokemonNameCandidates()`

### `test-garganacl.ts` 
- **Purpose**: Basic Garganacl recognition testing
- **Status**: Functionality moved to `CardRecognitionService.findPokemonName()`

### `final-garganacl-push.ts`
- **Purpose**: Advanced Garganacl recognition with smart correction
- **Status**: Smart correction logic moved to `PokemonCardAnalyzer.smartCorrectPokemonName()`

### `final-pokemon-test.ts`
- **Purpose**: Comprehensive Pokemon card element recognition
- **Status**: Element search moved to `CardRecognitionService.searchPokemonCardElements()`

### `test-pokemon-card.ts`
- **Purpose**: Multi-configuration OCR testing
- **Status**: Configuration testing incorporated into service options

### `test-vision-simple.ts`
- **Purpose**: Basic vision service testing
- **Status**: Basic functionality available through `CardRecognitionService.recognizeCard()`

## Migration Notes

All the valuable functionality from these scripts has been extracted and organized into:

1. **CardRecognitionService**: Core OCR and image processing
2. **PokemonCardAnalyzer**: Pokemon-specific analysis and correction
3. **PokemonCardDemoService**: Clean demonstration of capabilities

Use the new `clean-pokemon-demo.ts` script to see all the functionality in action with proper service architecture.

## Development Journey

These scripts represent our exploration of:
- OCR parameter optimization
- Pokemon name correction algorithms
- Text classification strategies
- Confidence scoring systems
- Multi-pass recognition approaches

The final services incorporate the best insights from this experimental phase while providing a clean, maintainable API.
