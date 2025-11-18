import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useChatmodesData } from './useChatmodesData';

const SAMPLE_INDEX = {
  chatmodes: [
    {
      id: 'sample-chatmode',
      name: 'Sample Chatmode',
      summary: 'Assist with sample workflows.',
      description: 'Ensure code follows a sample flow.',
      category: 'testing',
      difficulty: 'intermediate',
      tags: ['sample', 'testing'],
      tools: ['codebase', 'editFiles'],
      model: 'gpt-4o',
      author: 'Test Author',
      license: 'MIT',
      version: '1.0.0',
      source: {
        url: 'https://github.com/example/repo/tree/main/skills/sample',
        owner: 'example',
        repository: 'repo',
        path: 'skills/sample',
      },
      paths: {
        metadata: 'chatmodes/examples/sample/metadata.json',
        chatmode: 'chatmodes/examples/sample/sample-chatmode.chatmode.md',
      },
      updatedAt: new Date().toISOString(),
      slug: 'examples/sample',
    },
  ],
};

describe('useChatmodesData', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('loads chatmodes and builds facets', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve(SAMPLE_INDEX),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useChatmodesData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.chatmodes).toHaveLength(1);
    const sampleTagFacet = result.current.tagIndex.find((facet) => facet.tag === 'sample');
    expect(sampleTagFacet?.count).toBe(1);
    expect(result.current.error).toBeNull();
  });

  test('captures fetch failures', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useChatmodesData());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.chatmodes).toHaveLength(0);
  });
});
