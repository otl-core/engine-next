/**
 * Test Utilities - Mock Backend
 */

export function mockBackendResponse(type: string, data: unknown) {
  return {
    type,
    content: data,
    redirect: null,
  };
}

export function mockPageResponse(sections: unknown[]) {
  return mockBackendResponse("page", { sections });
}

export function mockEntryResponse(post: unknown) {
  return mockBackendResponse("entry", post);
}
