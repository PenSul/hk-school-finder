## Core Principles

- **Problem Clarity First :** Always clarify the intent and problem before generating code. If requirements are unclear or ambiguous, request clarification instead of guessing. No code without a clear problem statement.
- **Simplicity First :** Always choose the simplest viable solution. Complex patterns or architectures require explicit justification. Ensure syntactic correctness and basic functionality before introducing abstractions or patterns.
- **Strategic Documentation :** Comment only complex logic or critical functions with consistent tsdoc. Avoid documenting the obvious.
- **Test-Driven Thinking :** Design all code to be easily testable from inception.
- **Emoji Restriction :** The use of emojis in any file—including code, comments, documentation, and metadata—is strictly prohibited.

## Code Quality Guarantees

- **DRY Principle :** No duplicate code. Reuse or extend existing functionality.
- **Clean Architecture :** Generate cleanly formatted, logically structured code with consistent patterns.
- **Robust Error Handling :** Integrate appropriate error handling for all edge cases and external interactions. Error handling verbosity may vary by environment (e.g., detailed logging in development, concise in production), but security measures must remain consistent across all stages.

## Security & Performance Considerations

- **Input Validation :** All external data must be validated before processing.
- **Resource Management :** Close connections and free resources appropriately.
- **Constants Over Magic Values :** No magic strings or numbers. Use named constants.
- **Security-First Thinking :** Implement proper authentication, authorization, and data protection.
- **Performance Awareness :** Consider computational complexity and resource usage.

## AI Communication Guidelines

- **Explanation Depth Control :** Scale explanation detail based on complexity, from brief to comprehensive.
- **Alternative Suggestions :** When relevant, offer alternative approaches with pros/cons.
- **Knowledge Boundary Transparency :** Clearly communicate when a request exceeds AI capabilities or project context.

## Continous documentation during development process

- **Keep all \*.md files up-to-date, which where used to keep track of progress, todos and helping infos**

* generate memories for each new created or new requested md file, which shall help the AI or the developer to keep track of the project context and progress.
* update the md files, when new tasks are added, completed or when new todos are added or completed.
* but do not touch \*.md files in doc folder!
