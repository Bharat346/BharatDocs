# 🤝 Contributing to Bharat Docs

Thank you for your interest in contributing to **Bharat Docs**! We welcome contributions from the community and are grateful for any help you can provide.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Commit Message Convention](#commit-message-convention)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

---

## 📜 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. Please:

- Be respectful and considerate in all interactions
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept differing viewpoints gracefully

---

## 🚀 Getting Started

Before you begin contributing, please:

1. **Read the [README.mdx](./README.mdx)** to understand the project architecture and setup
2. **Fork the repository** to your GitHub account
3. **Clone your fork** locally
4. **Set up the development environment** (see below)

---

## 🛠️ Development Setup

### Prerequisites

- **Node.js** 18.17 or higher
- **npm** or **pnpm**
- **Neon PostgreSQL** account (or local PostgreSQL)
- **Git** for version control

### Installation Steps

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/docs.git
cd docs

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your database credentials

# 4. Run database migrations
npm run migrate:push

# 5. Seed the database (optional)
npm run seed

# 6. Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Useful Commands

| Command                  | Description                         |
| ------------------------ | ----------------------------------- |
| `npm run dev`            | Start development server            |
| `npm run build`          | Build for production                |
| `npm run lint`           | Run ESLint to check code quality    |
| `npm run migrate:push`   | Push schema changes to database     |
| `npm run seed`           | Seed the database with initial data |
| `npm run generate:types` | Generate Drizzle types              |

---

## 💡 How to Contribute

### Types of Contributions We Welcome

- 🐛 **Bug fixes** – Help us squash bugs
- ✨ **New features** – Add new functionality
- 📚 **Documentation** – Improve or add documentation
- 🎨 **UI/UX improvements** – Enhance the user interface
- ⚡ **Performance optimizations** – Make things faster
- 🧪 **Tests** – Add or improve test coverage
- ♿ **Accessibility** – Improve accessibility features

### Finding Issues to Work On

- Look for issues labeled `good first issue` for beginner-friendly tasks
- Check `help wanted` labels for issues needing community help
- Feel free to ask questions in issue comments before starting

---

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
# Create a new branch from main
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/bug-description
```

### 2. Make Your Changes

- Follow the [Coding Guidelines](#coding-guidelines)
- Write clear, readable code with comments where needed
- Update documentation if your changes require it

### 3. Test Your Changes

```bash
# Run linting
npm run lint

# Build to check for errors
npm run build

# Test locally
npm run dev
```

### 4. Commit Your Changes

Follow our [Commit Message Convention](#commit-message-convention):

```bash
git add .
git commit -m "feat: add new search functionality"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:

- **Clear title** describing the change
- **Description** explaining what and why
- **Screenshots** for UI changes
- **Link to related issue** (if applicable)

### PR Review Checklist

- [ ] Code follows project style guidelines
- [ ] Self-reviewed the code
- [ ] No console errors or warnings
- [ ] Build passes successfully
- [ ] Documentation updated (if needed)

---

## 📝 Coding Guidelines

### JavaScript/React

- Use **functional components** with hooks
- Use **ES6+ syntax** (arrow functions, destructuring, etc.)
- Keep components **small and focused**
- Use **meaningful variable and function names**

### File Structure

```
components/
├── ComponentName/
│   ├── ComponentName.jsx    # Main component
│   ├── SubComponent.jsx     # Sub-components (if any)
│   └── index.js             # Export file
```

### Styling

- Use **Tailwind CSS** for styling
- Follow the existing design system
- Maintain **dark/light theme** compatibility
- Ensure **responsive design** for all screen sizes

### Database

- Use **Drizzle ORM** for database operations
- Follow existing schema patterns in `lib/db/schema.js`
- Create migrations for schema changes

---

## 💬 Commit Message Convention

We follow the **Conventional Commits** specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Description                                      |
| ---------- | ------------------------------------------------ |
| `feat`     | New feature                                      |
| `fix`      | Bug fix                                          |
| `docs`     | Documentation changes                            |
| `style`    | Code style changes (formatting, no logic change) |
| `refactor` | Code refactoring                                 |
| `perf`     | Performance improvements                         |
| `test`     | Adding or updating tests                         |
| `chore`    | Maintenance tasks, dependencies                  |

### Examples

```bash
feat(notes): add folder creation functionality
fix(api): resolve null pointer in docs endpoint
docs: update contributing guidelines
style: format components with prettier
refactor(ui): simplify theme toggle logic
```

---

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the bug
3. **Expected behavior** vs **actual behavior**
4. **Screenshots or error messages** (if applicable)
5. **Environment details**:
   - Browser and version
   - Operating system
   - Node.js version

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug.

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**

- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 18.19.0]
```

---

## ✨ Feature Requests

We love new ideas! When suggesting features:

1. **Check existing issues** to avoid duplicates
2. **Describe the problem** the feature would solve
3. **Explain your proposed solution**
4. **Consider alternatives** you've thought of

### Feature Request Template

```markdown
**Problem**
Describe the problem this feature would solve.

**Proposed Solution**
How you'd like the feature to work.

**Alternatives**
Any alternative solutions you've considered.

**Additional Context**
Any other information or screenshots.
```

---

## 📞 Getting Help

- 💬 **GitHub Issues** – For bugs and feature requests
- 📧 **Email** – Reach out to the maintainers
- 📖 **Documentation** – Check the README.mdx

---

## 🙏 Thank You!

Every contribution, no matter how small, helps make Bharat Docs better. We appreciate your time and effort!

<div align="center">
  <strong>Happy Contributing! 🎉</strong>
</div>
