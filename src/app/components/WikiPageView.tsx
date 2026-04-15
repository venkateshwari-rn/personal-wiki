import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Clock, Tag, FileText } from 'lucide-react';
import { getWikiPages } from '../utils/api';

interface WikiPage {
  id: string;
  title: string;
  content: string;
  tags: string[];
  lastUpdated: string;
}

interface WikiPageViewProps {
  page?: WikiPage | null;
}

export function WikiPageView({ page }: WikiPageViewProps) {
  if (!page) {
    return (
      <div className="h-full flex items-center justify-center text-neutral-500">
        <div className="text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
          <p>Select a page from the list to view its content</p>
        </div>
      </div>
    );
  }

  const currentPage = page;

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-3xl mx-auto p-8">
        <div className="flex items-center gap-4 mb-6 text-sm text-neutral-600">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Updated {currentPage.lastUpdated}</span>
          </div>
          {currentPage.tags && currentPage.tags.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              {currentPage.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="prose prose-neutral max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {currentPage.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

const _mockWikiContent: Record<string, { content: string; tags: string[]; lastUpdated: string }> = {
  'Transformer Architecture': {
    content: `# Transformer Architecture

## Overview

The Transformer is a neural network architecture introduced in "Attention is All You Need" (Vaswani et al., 2017). It revolutionized natural language processing by replacing recurrent architectures with self-attention mechanisms.

## Key Components

### Self-Attention Mechanism
- Allows the model to weigh the importance of different words in a sequence
- Computes attention scores between all pairs of positions
- Enables parallel processing unlike RNNs

### Multi-Head Attention
- Multiple attention mechanisms running in parallel
- Each "head" learns different representation subspaces
- Typically uses 8-16 attention heads

### Position Encoding
- Since transformers have no inherent notion of sequence order
- Sinusoidal position embeddings added to input
- Allows model to utilize sequence position information

## Applications
- Machine translation
- Text generation
- Question answering
- Code generation

## Related Concepts
- [[Attention Mechanism]]
- [[GPT-3 Overview]]
- [[LLM Evolution Timeline]]

---
*Compiled from: attention-is-all-you-need.pdf, GPT-3 paper*`,
    tags: ['neural-networks', 'nlp', 'deep-learning'],
    lastUpdated: '2026-04-14'
  },
  'Attention Mechanism': {
    content: `# Attention Mechanism

## Introduction

Attention mechanisms allow neural networks to focus on specific parts of the input when producing output. They are the foundation of modern transformer models.

## How It Works

1. **Query, Key, Value**: Each input is transformed into three vectors
2. **Similarity Scores**: Compute similarity between query and all keys
3. **Softmax**: Convert scores to probability distribution
4. **Weighted Sum**: Compute output as weighted sum of values

## Mathematical Formulation

\`\`\`
Attention(Q, K, V) = softmax(QK^T / √d_k)V
\`\`\`

Where:
- Q = Query matrix
- K = Key matrix
- V = Value matrix
- d_k = Dimension of keys

## Types of Attention

- **Self-Attention**: Attending to different positions within the same sequence
- **Cross-Attention**: Attending from one sequence to another
- **Scaled Dot-Product**: Most common, used in transformers

## Related Concepts
- [[Transformer Architecture]]
- [[Multi-Head Attention]]

---
*Compiled from: attention-is-all-you-need.pdf*`,
    tags: ['neural-networks', 'attention', 'fundamentals'],
    lastUpdated: '2026-04-13'
  },
  'Knowledge Management': {
    content: `# Knowledge Management

## Personal Knowledge Management (PKM)

PKM is the practice of capturing, organizing, and retrieving information in a way that supports learning and creativity.

## The Zettelkasten Method

A note-taking system developed by Niklas Luhmann:
- **Atomic Notes**: Each note contains one idea
- **Links**: Connect related concepts
- **Emergence**: New insights emerge from connections

## Digital Tools

### Obsidian
- Markdown-based
- Local-first storage
- Graph view for visualizing connections
- Extensive plugin ecosystem

### Second Brain Methodology
- Capture everything
- Organize for actionability
- Distill key insights
- Express through creation

## LLM-Powered Knowledge Systems

Modern approach using AI:
- Automated compilation from raw sources
- Intelligent summarization
- Question answering over knowledge base
- Automated maintenance and health checks

## Benefits
- Reduced cognitive load
- Better information retrieval
- Enhanced creativity through connections
- Long-term knowledge compound interest

## Related Concepts
- [[Second Brain Method]]
- [[PKM Tools Comparison]]
- [[Obsidian Workflow]]

---
*Compiled from: building-second-brain.md, obsidian-workflow.md*`,
    tags: ['productivity', 'pkm', 'tools'],
    lastUpdated: '2026-04-15'
  },
  'GPT-3 Overview': {
    content: `# GPT-3 Overview

## Introduction

GPT-3 (Generative Pre-trained Transformer 3) is a large language model developed by OpenAI with 175 billion parameters.

## Key Features

### Scale
- 175B parameters (10x larger than previous models)
- Trained on 45TB of text data
- Required significant computational resources

### Few-Shot Learning
- Can perform tasks with minimal examples
- No fine-tuning required for many applications
- Demonstrates emergent capabilities

### Capabilities
- Text generation
- Translation
- Code generation
- Question answering
- Summarization
- Creative writing

## Architecture

Built on the Transformer architecture:
- 96 layers
- 96 attention heads
- 12,288 hidden dimensions per head

## Limitations
- Can produce factually incorrect information
- Sensitive to prompt engineering
- No memory between conversations
- Training data cutoff

## Impact

GPT-3 demonstrated that scaling language models leads to qualitatively new capabilities, sparking the current AI revolution.

## Related Concepts
- [[Transformer Architecture]]
- [[LLM Evolution Timeline]]
- [[Attention Mechanism]]

---
*Compiled from: gpt-3-paper.pdf*`,
    tags: ['llm', 'gpt', 'openai'],
    lastUpdated: '2026-04-12'
  }
};
