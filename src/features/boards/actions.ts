"use server";

import { revalidatePath } from "next/cache";
import { KanbanAPI } from "@/shared/api/services";

export async function createBoardAction(body: Record<string, unknown>) {
  const board = await KanbanAPI.create(body);
  revalidatePath("/app/boards");
  return board;
}

export async function createCardAction(boardId: string, body: Record<string, unknown>) {
  const card = await KanbanAPI.createCard(boardId, body);
  revalidatePath(`/app/boards/${boardId}`);
  return card;
}

export async function updateCardAction(boardId: string, cardId: string, body: Record<string, unknown>) {
  const card = await KanbanAPI.updateCard(cardId, body);
  revalidatePath(`/app/boards/${boardId}`);
  return card;
}

export async function moveCardAction(boardId: string, cardId: string, columnId: string, position: number) {
  const card = await KanbanAPI.moveCard(cardId, columnId, position);
  revalidatePath(`/app/boards/${boardId}`);
  return card;
}

export async function archiveCardAction(boardId: string, cardId: string) {
  await KanbanAPI.archiveCard(cardId);
  revalidatePath(`/app/boards/${boardId}`);
}

export async function addCommentAction(boardId: string, cardId: string, body: string) {
  const comment = await KanbanAPI.comment(cardId, body);
  revalidatePath(`/app/boards/${boardId}`);
  return comment;
}

export async function getCardTimelineAction(cardId: string) {
  const [activities, comments] = await Promise.all([
    KanbanAPI.activities(cardId),
    KanbanAPI.comments(cardId),
  ]);
  return { activities, comments };
}

export async function updateBoardAction(boardId: string, body: Record<string, unknown>) {
  const board = await KanbanAPI.update(boardId, body);
  revalidatePath("/app/boards");
  revalidatePath(`/app/boards/${boardId}`);
  return board;
}

export async function setBoardProjectAction(boardId: string, projectId: string, linked: boolean) {
  if (linked) await KanbanAPI.linkProject(boardId, projectId);
  else await KanbanAPI.unlinkProject(boardId, projectId);
  revalidatePath(`/app/boards/${boardId}`);
}

export async function createColumnAction(boardId: string, body: Record<string, unknown>) {
  const column = await KanbanAPI.createColumn(boardId, body);
  revalidatePath(`/app/boards/${boardId}`);
  return column;
}

export async function updateColumnAction(boardId: string, columnId: string, body: Record<string, unknown>) {
  const column = await KanbanAPI.updateColumn(boardId, columnId, body);
  revalidatePath(`/app/boards/${boardId}`);
  return column;
}

export async function removeColumnAction(boardId: string, columnId: string) {
  await KanbanAPI.removeColumn(boardId, columnId);
  revalidatePath(`/app/boards/${boardId}`);
}

export async function reorderColumnsAction(boardId: string, columnIds: string[]) {
  const columns = await KanbanAPI.reorderColumns(boardId, columnIds);
  revalidatePath(`/app/boards/${boardId}`);
  return columns;
}

export async function archiveBoardAction(boardId: string) {
  await KanbanAPI.archive(boardId);
  revalidatePath("/app/boards");
}
