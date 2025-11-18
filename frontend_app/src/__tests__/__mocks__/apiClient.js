const api = {
  get: jest.fn(),
  post: jest.fn(),
};

export const apiGet = api.get;
export const apiPost = api.post;

const defaultExport = {
  get: apiGet,
  post: apiPost,
};

export default defaultExport;
