/**
 * Tool call ko'rinishini odamga tushunarli qisqartirish.
 *
 * Har tool uchun `name` (O'zbekcha qisqa nom) va `args` (qisqa parametr satr).
 * `result` allaqachon agent yozgan tushunarli matn — uni o'zgartirmaymiz,
 * faqat truncate qilamiz.
 */

const TOOL_LABELS: Record<string, string> = {
  // plan.*
  "plan.set": "Reja tuzildi",
  "plan.update": "Qadam yangilandi",
  "plan.complete": "Reja yakunlandi",
  "plan.advance": "Qadam o'tdi",

  // project.*
  "project.list": "Loyihalar",
  "project.get": "Loyiha ma'lumoti",
  "project.create": "Yangi loyiha",
  "project.update": "Loyiha yangilandi",
  "project.delete": "Loyiha o'chirildi",

  // flow.*
  "flow.get": "Flow yuklandi",
  "flow.list_node_types": "Node katalogi",
  "flow.diff": "Flow farqi",
  "flow.validate": "Flow tekshirildi",
  "flow.save": "Flow saqlandi",
  "flow.layout_auto": "Joylashtirildi",
  "flow.design": "Flow blueprint",
  "flow.bulk_apply": "Flow qo'llandi",
  "flow.add_node": "Node qo'shildi",
  "flow.remove_node": "Node o'chirildi",
  "flow.clear": "Flow tozalandi",
  "flow.patch": "Node yangilandi",
  "flow.connect": "Ulandi",
  "flow.disconnect": "Ulanish o'chirildi",
  "flow.connect_button": "Tugma ulandi",
  "flow.connect_branch": "Branch ulandi",
  "flow.add_command_trigger": "Buyruq trigger",
  "flow.add_send_text_message": "Xabar",
  "flow.add_message_trigger": "Javob kutiladi",
  "flow.add_callback_query_trigger": "Callback handler",
  "flow.add_if_condition": "Shart (if)",
  "flow.add_collection": "Collection yozish",
  "flow.add_state": "State saqlash",
  "flow.add_custom_code": "JS kod",
  "flow.add_http_request": "HTTP so'rov",
  "flow.ask_text": "Matn so'raldi",
  "flow.ask_contact": "Kontakt so'raldi",
  "flow.ask_location": "Joylashuv so'raldi",
  "flow.ask_buttons": "Tugma savol",
  "flow.save_to_collection": "Collection'ga saqlash",
  "flow.finish": "Yakuniy xabar",

  // env / release / billing
  "env.list": "Env ro'yxati",
  "env.set": "Env o'rnatildi",
  "env.unset": "Env o'chirildi",
  "release.list": "Release ro'yxati",
  "release.deploy": "Deploy",
  "release.status": "Release statusi",
  "release.logs": "Pod loglari",
  "plans.list": "Tariflar",
  "subscription.current": "Joriy tarif",
  "subscription.upgrade": "Tarif almashtirish",
  "payment.link.create": "To'lov havolasi",

  // crm / cms / broadcast / chat / file / search
  "crm.list_collections": "CRM kollektsiyalar",
  "crm.find": "CRM qidiruv",
  "crm.count": "CRM hisob",
  "crm.aggregate": "CRM aggregatsiya",
  "crm.insert": "CRM insert",
  "crm.update": "CRM update",
  "crm.delete": "CRM delete",
  "crm.segment": "Segment yaratish",
  "cms.list_collections": "CMS kollektsiyalar",
  "cms.get_collection": "CMS collection",
  "cms.create_collection": "Yangi collection",
  "cms.delete_collection": "Collection o'chirildi",
  "cms.add_field": "Field qo'shildi",
  "cms.update_field": "Field yangilandi",
  "cms.remove_field": "Field o'chirildi",
  "cms.find": "CMS qidiruv",
  "cms.get_document": "Document",
  "cms.insert": "Document yozildi",
  "cms.bulk_insert": "Bulk insert",
  "cms.update": "Document yangilandi",
  "cms.delete": "Document o'chirildi",
  "cms.restore": "Document tiklandi",
  "cms.aggregate": "CMS aggregatsiya",
  "cms.audit_log": "Audit log",
  "broadcast.list": "Broadcast ro'yxati",
  "broadcast.preview": "Broadcast preview",
  "broadcast.send": "Broadcast yuborildi",
  "broadcast.status": "Broadcast status",
  "chat.list_users": "Foydalanuvchilar",
  "chat.user_history": "Chat tarixi",
  "file.list": "Fayllar",
  "file.delete": "Fayl o'chirildi",
  "search.semantic": "Hujjat qidiruvi",
  "task.run": "Sub-agent",
};

const SUB_AGENT_NAMES: Record<string, string> = {
  "flow-builder": "Flow Builder",
  "crm-manager": "CRM Manager",
  "cms-manager": "CMS Manager",
  "deploy-manager": "Deploy Manager",
};

export function summarizeName(toolName: string): string {
  return TOOL_LABELS[toolName] ?? toolName;
}

function trunc(s: string, n: number): string {
  if (typeof s !== "string") s = String(s);
  return s.length <= n ? s : s.slice(0, Math.max(0, n - 1)) + "…";
}

function get(args: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) if (args[k] !== undefined) return args[k];
  return undefined;
}

function getData(args: Record<string, unknown>, key: string): unknown {
  const d = args.data;
  if (d && typeof d === "object") return (d as Record<string, unknown>)[key];
  return undefined;
}

export function summarizeArgs(
  toolName: string,
  args: Record<string, unknown>,
): string {
  if (!args || typeof args !== "object") return "";

  switch (toolName) {
    case "plan.set": {
      const items = args.items as Array<{ title?: string }> | undefined;
      const n = items?.length ?? 0;
      const first = items?.[0]?.title ? `· ${trunc(items[0].title, 40)}` : "";
      return `${n} qadam ${first}`.trim();
    }
    case "plan.update":
      return `${args.id ?? "?"} → ${args.status ?? "?"}`;
    case "plan.complete":
      return "";
    case "plan.advance": {
      const completed = (args.complete as string[] | undefined) ?? [];
      const started = (args.start as string[] | undefined) ?? [];
      const parts: string[] = [];
      if (completed.length) parts.push(`✓ ${completed.join(",")}`);
      if (started.length) parts.push(`▶ ${started.join(",")}`);
      return parts.join(" · ");
    }

    case "project.list":
      return args.search ? `qidiruv: ${args.search}` : "barchasi";
    case "project.get":
    case "project.update":
    case "project.delete":
      return `id=${args.id}`;
    case "project.create":
      return trunc(String(args.name ?? ""), 40);

    case "flow.get":
      return args.summary_only ? "qisqacha" : "to'liq JSON";
    case "flow.list_node_types":
      return args.type
        ? String(args.type)
        : args.category
          ? `kategoriya: ${args.category}`
          : "barcha turlari";
    case "flow.diff":
    case "flow.validate":
    case "flow.save":
    case "flow.layout_auto":
      return "";

    case "flow.design": {
      const task = String(args.task ?? "");
      return task ? `"${trunc(task, 60)}"` : "";
    }
    case "flow.bulk_apply": {
      const nodes = (args.nodes as unknown[] | undefined)?.length;
      const edges = (args.edges as unknown[] | undefined)?.length;
      const parts: string[] = [];
      if (nodes !== undefined) parts.push(`${nodes} node`);
      if (edges !== undefined) parts.push(`${edges} edge`);
      if (args.save) parts.push("save");
      return parts.length ? parts.join(" · ") : "state'dan";
    }
    case "flow.add_node": {
      const t = args.type;
      const id = args.id;
      const after = args.after ? ` ← ${args.after}` : "";
      return `${t ?? "?"}${after}${id ? ` · ${id}` : ""}`;
    }
    case "flow.remove_node":
      return `id=${args.id}`;
    case "flow.patch":
      return `id=${args.id}`;

    case "flow.connect":
      return `${args.source} → ${args.target}`;
    case "flow.disconnect":
      return `${args.source} ⛔ ${args.target}`;
    case "flow.connect_button":
      return `${args.source} → ${args.target} · "${trunc(String(args.button_text ?? ""), 20)}"`;
    case "flow.connect_branch":
      return `${args.source} → ${args.target} (${args.source_handle})`;

    case "flow.add_command_trigger":
      return String(getData(args, "command") ?? "");
    case "flow.add_send_text_message": {
      const text = getData(args, "messageText") as string | undefined;
      return text ? `"${trunc(text, 60)}"` : "";
    }
    case "flow.add_message_trigger":
      return String(getData(args, "type") ?? "");
    case "flow.add_callback_query_trigger": {
      const f = getData(args, "filter");
      const ctx = getData(args, "context") as Record<string, unknown> | undefined;
      const val = ctx?.value;
      return val ? `${f}: "${val}"` : String(f ?? "");
    }
    case "flow.add_if_condition": {
      const cs = getData(args, "conditions") as unknown[] | undefined;
      return cs ? `${cs.length} ta shart` : "shart";
    }
    case "flow.add_collection":
      return String(getData(args, "collection_name") ?? "");
    case "flow.add_state":
      return `${getData(args, "key") ?? "?"} = ${getData(args, "type") ?? "?"}`;
    case "flow.add_custom_code":
      return "JavaScript";
    case "flow.add_http_request": {
      const method = getData(args, "method");
      const url = getData(args, "url") as string | undefined;
      return url ? `${method} ${trunc(url, 50)}` : String(method ?? "");
    }

    case "flow.ask_text":
    case "flow.ask_contact":
    case "flow.ask_location":
    case "flow.ask_buttons":
      return trunc(String(args.question ?? ""), 60);
    case "flow.save_to_collection":
      return String(args.collection_name ?? "");
    case "flow.finish":
      return trunc(String(args.message ?? ""), 50);

    case "env.list":
      return args.project_id ? `loyiha ${args.project_id}` : "";
    case "env.set":
      return String(args.key ?? "");
    case "env.unset":
      return `id=${args.env_id}`;

    case "release.list":
      return args.project_id ? `loyiha ${args.project_id}` : "";
    case "release.deploy":
      return `loyiha ${args.project_id ?? "?"}${args.plan_id ? ` · plan ${args.plan_id}` : ""}`;
    case "release.status":
    case "release.logs":
      return `release ${args.release_id}`;

    case "plans.list":
    case "subscription.current":
      return "";
    case "subscription.upgrade":
      return `plan ${args.plan_id} · ${args.months ?? 1} oy`;
    case "payment.link.create":
      return `${args.method} · ${args.amount} UZS`;

    case "task.run":
      return SUB_AGENT_NAMES[String(args.subagent_type)] ?? String(args.subagent_type ?? "");

    case "search.semantic":
      return `"${trunc(String(args.query ?? ""), 50)}"`;

    case "crm.find":
    case "crm.count":
    case "crm.aggregate":
    case "crm.insert":
    case "crm.update":
    case "crm.delete":
      return String(args.collection ?? "");
    case "crm.segment":
      return String(args.name ?? "");

    case "cms.create_collection":
    case "cms.delete_collection":
    case "cms.get_collection":
      return String(args.name ?? "");
    case "cms.add_field":
    case "cms.update_field":
    case "cms.remove_field":
      return `${args.collection ?? "?"}.${args.field_name ?? "?"}`;
    case "cms.find":
    case "cms.insert":
    case "cms.update":
    case "cms.delete":
    case "cms.aggregate":
      return String(args.collection ?? "");
    case "cms.get_document":
    case "cms.restore":
      return String(args.id ?? "");

    case "chat.list_users":
      return `loyiha ${args.project_id}`;
    case "chat.user_history":
      return `chat ${args.chat_id}`;

    case "broadcast.preview":
    case "broadcast.send":
      return trunc(String(args.message ?? args.text ?? ""), 50);
    case "broadcast.status":
    case "broadcast.list":
      return args.id ? `id=${args.id}` : "";

    case "file.list":
      return args.project_id ? `loyiha ${args.project_id}` : "";
    case "file.delete":
      return `id=${args.file_id}`;

    default:
      // Universal fallback — eng asosiy 2-3 ta field'ni ko'rsatamiz, id/handle'larsiz.
      return Object.entries(args)
        .filter(
          ([k]) =>
            !["id", "edge_id", "source_handle", "target_handle", "position"].includes(k),
        )
        .slice(0, 3)
        .map(([k, v]) => {
          const val =
            typeof v === "string"
              ? `"${trunc(v, 30)}"`
              : trunc(JSON.stringify(v), 30);
          return `${k}=${val}`;
        })
        .join(", ");
  }
}

/**
 * Tool natijasi — agent yozgan tushunarli matn (ToolResult.content).
 * Bizning ishimiz: bo'sh bo'lmasa, qisqartirib qaytarish.
 */
export function summarizeResult(result: string | undefined): string {
  if (!result) return "";
  // Birinchi satr odatda eng informativ
  const firstLine = result.split("\n")[0].trim();
  return trunc(firstLine, 100);
}
