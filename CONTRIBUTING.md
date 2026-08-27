# Contributing to StartupET Platform

Thank you for your interest in contributing to the StartupET platform! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing to this project.

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher
- Basic knowledge of React, Next.js, and TypeScript

### Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/Startup-Des.git`
3. Add the original repository as upstream: `git remote add upstream https://github.com/Yesunewh/Startup-Des.git`
4. Install dependencies: `npm install`
5. Create a new branch for your feature or bugfix: `git checkout -b feature/your-feature-name`

## Development Process

1. Make your changes in your feature branch
2. Keep your branch updated with upstream: 
   ```
   git fetch upstream
   git rebase upstream/master
   ```
3. Run tests to ensure your changes don't break existing functionality
4. Commit your changes with a clear and descriptive commit message
5. Push your branch to your fork
6. Submit a pull request to the main repository

## Pull Request Process

1. Fill out the pull request template completely
2. Link your PR to any relevant issues
3. Make sure all automated checks pass
4. Address any feedback from code reviewers
5. Once approved, your PR will be merged by a maintainer

## Coding Standards

- Follow the existing code style in the project
- Use TypeScript for type safety
- Keep components modular and reusable
- Write meaningful variable and function names
- Add comments for complex logic

### Naming Conventions

- React components: PascalCase (e.g., `ApplicationForm.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useApplicationStore.ts`)
- Utilities/helpers: camelCase (e.g., `formatDate.ts`)
- Files containing multiple utilities: kebab-case (e.g., `date-utils.ts`)

## Testing

Before submitting your PR, make sure to:

1. Run existing tests: `npm test`
2. Add tests for new functionality
3. Ensure all tests pass

## Documentation

Any new feature or change should be documented:

1. Update READMEs if necessary
2. Add inline code documentation for complex functions
3. Update user documentation in the `/docs` directory

## Community

Join our community channels to get help and discuss the project:

- [GitHub Discussions](https://github.com/Yesunewh/Startup-Des/discussions)
- Email: startupet@mint.gov.et

---

Thank you for contributing to the Ethiopian startup ecosystem through the StartupET platform!
