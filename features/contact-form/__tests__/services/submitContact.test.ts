import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const validPayload = {
  name: 'Jane',
  email: 'jane@example.com',
  message: 'Hello there, ten chars+',
};

describe('submitContact', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY', 'test-key-123');
    vi.stubGlobal('fetch', vi.fn());
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  async function loadService() {
    const mod = await import('@/features/contact-form/services/submitContact');
    return mod.submitContact;
  }

  it('POSTs JSON to Web3Forms with all expected fields', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    const submitContact = await loadService();

    await submitContact(validPayload);

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://api.web3forms.com/submit',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      }),
    );
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(call[1].body as string);
    expect(body).toMatchObject({
      access_key: 'test-key-123',
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello there, ten chars+',
      botcheck: '',
      from_name: 'Jane',
      replyto: 'jane@example.com',
    });
    expect(body.subject).toContain('Jane');
  });

  it('throws when env key is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY', '');
    const submitContact = await loadService();
    await expect(submitContact(validPayload)).rejects.toThrow(
      /Missing NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY/,
    );
  });

  it('throws on non-2xx HTTP status', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 422,
    });
    const submitContact = await loadService();
    await expect(submitContact(validPayload)).rejects.toThrow(/422/);
  });

  it('throws on success:false with API message', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false, message: 'Bad access key' }),
    });
    const submitContact = await loadService();
    await expect(submitContact(validPayload)).rejects.toThrow(/Bad access key/);
  });

  it('throws on success:false without message', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    });
    const submitContact = await loadService();
    await expect(submitContact(validPayload)).rejects.toThrow(/submission failed/);
  });

  it('throws on malformed response shape', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => null,
    });
    const submitContact = await loadService();
    await expect(submitContact(validPayload)).rejects.toThrow(/Unexpected/);
  });

  it('honeypot is forwarded when present', async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
    const submitContact = await loadService();
    await submitContact({ ...validPayload, botcheck: 'bot-filled' });
    const call = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const body = JSON.parse(call[1].body as string);
    expect(body.botcheck).toBe('bot-filled');
  });
});
