import { authenticatedRequest } from "./authApi";

const statusFromApi = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

const statusToApi = {
  Active: "ACTIVE",
  Inactive: "INACTIVE",
};

export function normalizeBoard(board) {
  return {
    ...board,
    status: statusFromApi[board.status] || board.status,
  };
}

const toApiPayload = (board) => ({
  name: board.name.trim(),
  code: board.code.trim().toUpperCase(),
  description: board.description?.trim() || null,
  status: statusToApi[board.status] || String(board.status).toUpperCase(),
});

export async function fetchBoards() {
  const payload = await authenticatedRequest("/boards");
  return payload.data.boards.map(normalizeBoard);
}

export async function createBoard(board) {
  const payload = await authenticatedRequest("/boards", {
    method: "POST",
    body: JSON.stringify(toApiPayload(board)),
  });
  return normalizeBoard(payload.data.board);
}

export async function updateBoard(id, board) {
  const payload = await authenticatedRequest(`/boards/${id}`, {
    method: "PUT",
    body: JSON.stringify(toApiPayload(board)),
  });
  return normalizeBoard(payload.data.board);
}
