"use server";

import { revalidatePath } from "next/cache";
import { KanbanAPI } from "@/shared/api/services";

export async function createBoardAction(body: Record<string, unknown>) {
  return KanbanAPI.create(body);
}

export async function createCardAction(
  boardId: string,
  body: Record<string, unknown>,
) {
  return KanbanAPI.createCard(boardId, body);
}

export async function updateCardAction(
  boardId: string,
  cardId: string,
  body: Record<string, unknown>,
) {
  return KanbanAPI.updateCard(cardId, body);
}

export async function moveCardAction(
  boardId: string,
  cardId: string,
  columnId: string,
  position: number,
) {
  return KanbanAPI.moveCard(cardId, columnId, position);
}

export async function archiveCardAction(boardId: string, cardId: string) {
  await KanbanAPI.archiveCard(cardId);
}

export async function addCommentAction(
  boardId: string,
  cardId: string,
  body: string,
) {
  return KanbanAPI.comment(cardId, body);
}

export async function getCardTimelineAction(cardId: string) {
  const [activities, comments] = await Promise.all([
    KanbanAPI.activities(cardId),
    KanbanAPI.comments(cardId),
  ]);
  return { activities, comments };
}

export async function updateBoardAction(
  boardId: string,
  body: Record<string, unknown>,
) {
  const board = await KanbanAPI.update(boardId, body);
  revalidatePath("/app/boards");
  revalidatePath(`/app/boards/${boardId}`);
  return board;
}

export async function setBoardProjectAction(
  boardId: string,
  projectId: string,
  linked: boolean,
) {
  if (linked) await KanbanAPI.linkProject(boardId, projectId);
  else await KanbanAPI.unlinkProject(boardId, projectId);
  revalidatePath(`/app/boards/${boardId}`);
}

export async function createColumnAction(
  boardId: string,
  body: Record<string, unknown>,
) {
  const column = await KanbanAPI.createColumn(boardId, body);
  revalidatePath(`/app/boards/${boardId}`);
  return column;
}

export async function updateColumnAction(
  boardId: string,
  columnId: string,
  body: Record<string, unknown>,
) {
  const column = await KanbanAPI.updateColumn(boardId, columnId, body);
  revalidatePath(`/app/boards/${boardId}`);
  return column;
}

export async function removeColumnAction(boardId: string, columnId: string) {
  await KanbanAPI.removeColumn(boardId, columnId);
  revalidatePath(`/app/boards/${boardId}`);
}

export async function reorderColumnsAction(
  boardId: string,
  columnIds: string[],
) {
  const columns = await KanbanAPI.reorderColumns(boardId, columnIds);
  revalidatePath(`/app/boards/${boardId}`);
  return columns;
}

export async function archiveBoardAction(boardId: string) {
  await KanbanAPI.archive(boardId);
  revalidatePath("/app/boards");
}

export async function restoreBoardAction(boardId: string) {
  const board = await KanbanAPI.restore(boardId);
  revalidatePath("/app/boards");
  return board;
}

export async function listArchivedCardsAction(
  boardId: string,
  projectId?: string,
) {
  return KanbanAPI.archivedCards(boardId, projectId);
}

export async function restoreCardAction(cardId: string) {
  return KanbanAPI.restoreCard(cardId);
}

type SettingsColumn = {
  id: string;
  name: string;
  color: string;
  wip_limit: number | null;
  is_terminal: boolean;
};

export async function saveBoardSettingsAction(input: {
  boardId: string;
  board: Record<string, unknown>;
  columns: SettingsColumn[];
  previousProjectIds: string[];
  projectIds: string[];
}) {
  const [, ...savedColumns] = await Promise.all([
    KanbanAPI.update(input.boardId, input.board),
    ...input.columns.map((column) =>
      column.id.startsWith("new:")
        ? KanbanAPI.createColumn(input.boardId, column)
        : KanbanAPI.updateColumn(input.boardId, column.id, column),
    ),
  ]);
  await Promise.all([
    KanbanAPI.reorderColumns(
      input.boardId,
      savedColumns.map((column) => (column as { id: string }).id),
    ),
    ...Array.from(
      new Set([...input.previousProjectIds, ...input.projectIds]),
    ).map((projectId) => {
      const wasLinked = input.previousProjectIds.includes(projectId);
      const isLinked = input.projectIds.includes(projectId);
      if (wasLinked === isLinked) return Promise.resolve();
      return isLinked
        ? KanbanAPI.linkProject(input.boardId, projectId)
        : KanbanAPI.unlinkProject(input.boardId, projectId);
    }),
  ]);
  revalidatePath(`/app/boards/${input.boardId}`);
}
