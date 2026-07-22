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
