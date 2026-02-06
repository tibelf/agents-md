# Quick Start Guide

Get your AI assistants up to speed with your Vue or uni-app project in 5 seconds.

## 🚀 One-Line Setup

```bash
npx @kipper/agents-md
```

That's it! The tool will:
1. ✅ Detect your framework (Vue or uni-app)
2. ✅ Download official documentation
3. ✅ Generate a compressed index
4. ✅ Inject it into AGENTS.md
5. ✅ Update .gitignore

## 📋 Prerequisites

- Node.js 18+ installed
- A Vue or uni-app project (with `package.json`)
- Git installed (for pulling docs)

## 🎯 Common Use Cases

### Use Case 1: Fresh Project
```bash
# Just created a new Vue project
npm create vue@latest my-project
cd my-project

# Add documentation index
npx @kipper/agents-md
```

**Result**: AGENTS.md created with Vue 3 docs index

---

### Use Case 2: Existing Project
```bash
# You have an existing Vue project
cd my-vue-project

# Add documentation index
npx @kipper/agents-md
```

**Result**: AGENTS.md created (or updated if it exists)

---

### Use Case 3: Preview Before Applying
```bash
# Want to see what will be added?
npx @kipper/agents-md --dry-run
```

**Result**: Shows what would be written to AGENTS.md without actually writing

---

### Use Case 4: Update Documentation
```bash
# Vue released a new version
npm update vue

# Update the docs index
npx @kipper/agents-md --force
```

**Result**: Re-downloads latest Vue docs and updates AGENTS.md

---

### Use Case 5: Manual Framework Selection
```bash
# Auto-detection failed? Specify manually
npx @kipper/agents-md --framework vue
```

**Result**: Forces Vue framework instead of auto-detecting

---

## 📁 What Gets Created

After running the command, your project will have:

```
your-project/
├── .vue-docs/              ← Full Vue documentation (gitignored)
├── .gitignore              ← Updated with .vue-docs/
└── AGENTS.md               ← Compressed docs index
```

## 📖 Reading the Index

The generated AGENTS.md contains a compressed index like this:

```
[Vue Docs Index]|root:.vue-docs|STOP. What you remember about Vue may be outdated...|api:{application,reactivity-core}|guide:{essentials,components}
```

**For AI Assistants**: This tells you:
- 📁 Docs location: `.vue-docs/`
- ⚠️ Important rules: "STOP. What you remember..."
- 📚 Available sections: `api/`, `guide/`, etc.
- 📄 Files in each section: `application.md`, `reactivity-core.md`, etc.

**For Humans**: Don't worry about reading this format. AI assistants parse it automatically. You can browse the actual docs in `.vue-docs/` folder.

## 🔧 Troubleshooting

### Problem: "No supported framework detected"

**Solution**:
```bash
# Make sure you have Vue in package.json
npm install vue

# Or specify the framework manually
npx @kipper/agents-md --framework vue
```

---

### Problem: "Git command failed"

**Solution**:
```bash
# Make sure git is installed
git --version

# Check internet connection (needed to pull docs)
```

---

### Problem: "Docs already exist"

**Solution**:
```bash
# Use --force to re-download
npx @kipper/agents-md --force
```

---

### Problem: Want to see detailed logs

**Solution**:
```bash
# Use --verbose for detailed output
npx @kipper/agents-md --verbose
```

---

## 🎓 Advanced Usage

### Generate for Both AGENTS.md and CLAUDE.md
```bash
npx @kipper/agents-md --claude
```

### Use Cached Docs (Offline Mode)
```bash
npx @kipper/agents-md --offline
```

### Custom Output File
```bash
npx @kipper/agents-md --output MY_DOCS.md
```

### List Supported Frameworks
```bash
npx @kipper/agents-md list-frameworks
```

**Output**:
```
Supported frameworks:
  uniapp       - uni-app 3.x
  vue          - Vue 3.x
```

---

## 📚 Documentation Locations

After running the tool, you can find docs at:

- **Vue**: `.vue-docs/`
- **uni-app**: `.uniapp-docs/`

Browse these folders for full documentation. The compressed index in AGENTS.md just helps AI assistants find files quickly.

---

## 🔄 Keeping Docs Up to Date

### After Framework Updates
```bash
# Update your framework
npm update vue

# Update the docs
npx @kipper/agents-md --force
```

### Periodic Updates (Optional)
```bash
# Every few months, refresh docs
npx @kipper/agents-md --force
```

**Why?**: Framework docs get updated with new features, examples, and best practices.

---

## 🤖 Using with AI Assistants

### Claude, ChatGPT, Cursor, etc.

Once you've run `npx @kipper/agents-md`, just tell your AI assistant:

> "I have AGENTS.md with Vue docs. Please check it before making any Vue-related suggestions."

Or even better, if your AI tool supports it, add this to your system prompt:

> "Always check AGENTS.md for framework documentation indices. When the user asks about Vue, search the .vue-docs/ directory for accurate information."

### Claude Code (CLI)

Claude Code automatically reads AGENTS.md! No extra configuration needed.

### Cursor IDE

Add this to your `.cursorrules`:
```
Before suggesting Vue code, check AGENTS.md and search .vue-docs/ for current best practices.
```

---

## 💡 Tips & Best Practices

### ✅ Do This
- Run the tool when starting a new project
- Re-run with `--force` after major framework updates
- Use `--dry-run` first if you want to preview changes
- Commit AGENTS.md to git (but .vue-docs/ is gitignored)

### ❌ Avoid This
- Don't commit `.vue-docs/` to git (it's auto-ignored)
- Don't manually edit the content between markers in AGENTS.md
- Don't delete the markers (`<!-- VUE-AGENTS-MD-START -->`)

### 📝 Custom Content in AGENTS.md

You can add your own content to AGENTS.md! Just don't edit between the markers:

```markdown
# My Project AGENTS.md

My custom instructions for AI assistants...

## Project Structure
- src/ contains all source code
- tests/ contains test files

<!-- VUE-AGENTS-MD-START -->
[Vue Docs Index]|...
<!-- VUE-AGENTS-MD-END -->

## Additional Notes
More custom content here...
```

✅ **Safe**: Content outside markers is preserved
❌ **Unsafe**: Editing between `START` and `END` markers gets overwritten

---

## 🎉 That's It!

You're now ready to give your AI assistants up-to-date framework documentation.

### Next Steps
1. Run `npx @kipper/agents-md` in your project
2. Ask your AI assistant to check AGENTS.md
3. Enjoy more accurate code suggestions!

### Questions?
- 📖 Read the full [README.md](./README.md)
- 🐛 Report issues on [GitHub](https://github.com/kipper/agents-md/issues)
- ⭐ Star the project if you find it useful!

---

*Happy coding! 🚀*
