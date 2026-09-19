# Contributing to SCARLET

First off, thank you for considering contributing to SCARLET! 

## Development Process

1. **Fork** the repository.
2. **Clone** your fork locally.
3. **Create a branch** for your feature or bug fix (`git checkout -b feature/amazing-feature`).
4. **Commit** your changes (`git commit -m 'Add some amazing feature'`).
5. **Push** to the branch (`git push origin feature/amazing-feature`).
6. **Open a Pull Request** against the `main` branch.

## Setting Up Your Environment

Please refer to the `README.md` for instructions on setting up both the Python backend and the Next.js frontend. Make sure all tests pass before submitting a PR.

### Running Tests
To run the Python test suite, ensure your `.venv` is active and run:
```bash
pytest tests/ -v
```

## Code Style
- **Python:** Follow standard PEP 8 guidelines. Type hints are heavily encouraged for all new functions.
- **TypeScript/React:** Use functional components and hooks. Ensure no ESLint errors (`npm run lint`).

Thank you for helping make SCARLET better!
