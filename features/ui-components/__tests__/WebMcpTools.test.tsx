import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { WebMcpTools } from '@/features/ui-components/components/WebMcpTools';

interface Tool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => { content: { type: string; text: string }[] };
}

function mockModelContext() {
  const provideContext = vi.fn();
  Object.defineProperty(navigator, 'modelContext', {
    configurable: true,
    value: { provideContext },
  });
  return provideContext;
}

function registeredTools(provideContext: ReturnType<typeof vi.fn>): Tool[] {
  return provideContext.mock.calls[0][0].tools as Tool[];
}

describe('WebMcpTools', () => {
  beforeEach(() => {
    // jsdom implements neither of these
    Element.prototype.scrollIntoView = vi.fn();
    window.open = vi.fn();
  });

  it('is a no-op when navigator.modelContext is unavailable', () => {
    Object.defineProperty(navigator, 'modelContext', { configurable: true, value: undefined });
    expect(() => render(<WebMcpTools />)).not.toThrow();
  });

  it('registers the expected tool set, each with name/description/inputSchema/execute', () => {
    const provideContext = mockModelContext();
    render(<WebMcpTools />);

    expect(provideContext).toHaveBeenCalledTimes(1);
    const tools = registeredTools(provideContext);
    expect(tools.map((t) => t.name)).toEqual([
      'get_portfolio',
      'view_projects',
      'download_resume',
      'contact_me',
      'navigate_to_section',
    ]);
    for (const tool of tools) {
      expect(typeof tool.description).toBe('string');
      expect(tool.inputSchema).toMatchObject({ type: 'object' });
      expect(typeof tool.execute).toBe('function');
    }
  });

  it('get_portfolio returns the full Markdown profile', () => {
    const provideContext = mockModelContext();
    render(<WebMcpTools />);

    const result = registeredTools(provideContext)
      .find((t) => t.name === 'get_portfolio')!
      .execute({});
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('# Paula Magdy');
    expect(result.content[0].text).toContain('SELECTED WORK');
  });

  it('download_resume opens the resume PDF', () => {
    const provideContext = mockModelContext();
    render(<WebMcpTools />);

    registeredTools(provideContext)
      .find((t) => t.name === 'download_resume')!
      .execute({});
    expect(window.open).toHaveBeenCalledWith('/resume.pdf', '_blank', 'noopener,noreferrer');
  });

  it('navigate_to_section rejects unknown sections', () => {
    const provideContext = mockModelContext();
    render(<WebMcpTools />);

    const result = registeredTools(provideContext)
      .find((t) => t.name === 'navigate_to_section')!
      .execute({ section: 'bogus' });
    expect(result.content[0].text).toContain('Unknown section');
  });
});
