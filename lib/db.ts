import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { isAdminEmail } from "@/lib/admin";
import type { ChatMessage } from "@/lib/chat";

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");

const globalForDb = globalThis as unknown as { db?: Database.Database };

function addColumn(
  conn: Database.Database,
  table: string,
  name: string,
  def: string,
) {
  const cols = conn.prepare(`PRAGMA table_info(${table})`).all() as {
    name: string;
  }[];
  if (!cols.some((c) => c.name === name)) {
    conn.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${def}`);
  }
}

function migrate(conn: Database.Database) {
  conn.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT NOT NULL UNIQUE,
      name          TEXT,
      picture       TEXT,
      created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
      last_login_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
  `);

  addColumn(conn, "users", "display_name", "TEXT");
  addColumn(conn, "users", "bio", "TEXT");
  addColumn(conn, "users", "avatar_ver", "INTEGER NOT NULL DEFAULT 0");
  addColumn(conn, "users", "banner_ver", "INTEGER NOT NULL DEFAULT 0");

  conn.exec(`
    CREATE TABLE IF NOT EXISTS user_images (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kind    TEXT NOT NULL CHECK (kind IN ('avatar', 'banner')),
      mime    TEXT NOT NULL,
      data    BLOB NOT NULL,
      PRIMARY KEY (user_id, kind)
    )
  `);

  const exists = !!conn
    .prepare(
      `SELECT 1 FROM sqlite_master WHERE type='table' AND name='bookmarks'`,
    )
    .get();
  const hasType = (
    conn.prepare(`PRAGMA table_info(bookmarks)`).all() as { name: string }[]
  ).some((c) => c.name === "type");
  const legacy = exists && !hasType;

  if (legacy) conn.exec(`ALTER TABLE bookmarks RENAME TO bookmarks_old`);

  conn.exec(`
    CREATE TABLE IF NOT EXISTS bookmarks (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type       TEXT NOT NULL DEFAULT 'movie',
      movie_slug TEXT NOT NULL,
      title      TEXT NOT NULL,
      poster     TEXT,
      year       INTEGER,
      rating     TEXT,
      quality    TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (user_id, type, movie_slug)
    )
  `);

  if (legacy) {
    conn.exec(`
      INSERT INTO bookmarks (user_id, type, movie_slug, title, poster, year, rating, quality, created_at)
      SELECT user_id, 'movie', movie_slug, title, poster, year, rating, quality, created_at
      FROM bookmarks_old;
      DROP TABLE bookmarks_old;
    `);
  }
}

function createDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const conn = new Database(DB_PATH);
  conn.pragma("journal_mode = WAL");
  conn.pragma("foreign_keys = ON");
  return conn;
}

export const db = globalForDb.db ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.db = db;

migrate(db);

export type User = {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_ver: number;
  banner_ver: number;
  created_at: number;
  last_login_at: number;
};

export type ImageKind = "avatar" | "banner";
export type BookmarkType = "movie" | "series";

export type Bookmark = {
  user_id: string;
  type: BookmarkType;
  movie_slug: string;
  title: string;
  poster: string | null;
  year: number | null;
  rating: string | null;
  quality: string | null;
  created_at: number;
};

const upsertStmt = db.prepare(`
  INSERT INTO users (id, email, name, picture)
  VALUES (@id, @email, @name, @picture)
  ON CONFLICT(id) DO UPDATE SET
    email = excluded.email,
    name = excluded.name,
    picture = excluded.picture,
    last_login_at = unixepoch()
  RETURNING *
`);
const getStmt = db.prepare(`SELECT * FROM users WHERE id = ?`);
const updateProfileStmt = db.prepare(
  `UPDATE users SET display_name = @display_name, bio = @bio WHERE id = @id`,
);

const putImageStmt = db.prepare(`
  INSERT INTO user_images (user_id, kind, mime, data)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(user_id, kind) DO UPDATE SET
    mime = excluded.mime,
    data = excluded.data
`);
const deleteImageStmt = db.prepare(
  `DELETE FROM user_images WHERE user_id = ? AND kind = ?`,
);
const getImageStmt = db.prepare(
  `SELECT mime, data FROM user_images WHERE user_id = ? AND kind = ?`,
);
const versionStmt = {
  avatar: db.prepare(`UPDATE users SET avatar_ver = ? WHERE id = ?`),
  banner: db.prepare(`UPDATE users SET banner_ver = ? WHERE id = ?`),
};

const addBookmarkStmt = db.prepare(`
  INSERT INTO bookmarks (user_id, type, movie_slug, title, poster, year, rating, quality)
  VALUES (@user_id, @type, @movie_slug, @title, @poster, @year, @rating, @quality)
  ON CONFLICT(user_id, type, movie_slug) DO UPDATE SET
    title = excluded.title,
    poster = excluded.poster,
    year = excluded.year,
    rating = excluded.rating,
    quality = excluded.quality
`);
const removeBookmarkStmt = db.prepare(
  `DELETE FROM bookmarks WHERE user_id = ? AND type = ? AND movie_slug = ?`,
);
const hasBookmarkStmt = db.prepare(
  `SELECT 1 FROM bookmarks WHERE user_id = ? AND type = ? AND movie_slug = ?`,
);
const listBookmarksStmt = db.prepare(
  `SELECT * FROM bookmarks WHERE user_id = ? ORDER BY created_at DESC`,
);

export function upsertUser(u: {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
}) {
  return upsertStmt.get(u) as User;
}

export function getUser(id: string) {
  return getStmt.get(id) as User | undefined;
}

export function updateProfile(
  userId: string,
  p: { display_name: string | null; bio: string | null },
) {
  updateProfileStmt.run({ id: userId, ...p });
}

export const setImage = db.transaction(
  (userId: string, kind: ImageKind, mime: string, data: Buffer) => {
    putImageStmt.run(userId, kind, mime, data);
    versionStmt[kind].run(Date.now(), userId);
  },
);

export const removeImage = db.transaction(
  (userId: string, kind: ImageKind) => {
    deleteImageStmt.run(userId, kind);
    versionStmt[kind].run(0, userId);
  },
);

export function getImage(userId: string, kind: ImageKind) {
  return getImageStmt.get(userId, kind) as
    | { mime: string; data: Buffer }
    | undefined;
}

export function addBookmark(b: Omit<Bookmark, "created_at">) {
  addBookmarkStmt.run(b);
}

export function removeBookmark(
  userId: string,
  type: BookmarkType,
  slug: string,
) {
  removeBookmarkStmt.run(userId, type, slug);
}

export function hasBookmark(userId: string, type: BookmarkType, slug: string) {
  return !!hasBookmarkStmt.get(userId, type, slug);
}

export function listBookmarks(userId: string) {
  return listBookmarksStmt.all(userId) as Bookmark[];
}

db.exec(`
  CREATE TABLE IF NOT EXISTS chat_messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    channel    TEXT NOT NULL,
    user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    reply_to   INTEGER REFERENCES chat_messages(id) ON DELETE SET NULL,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
  );
  CREATE INDEX IF NOT EXISTS idx_chat_channel_id ON chat_messages(channel, id);
  CREATE TABLE IF NOT EXISTS chat_reports (
    message_id  INTEGER NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
    reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
    PRIMARY KEY (message_id, reporter_id)
  );
`);

type ChatRow = {
  id: number;
  channel: string;
  user_id: string;
  content: string;
  created_at: number;
  reply_to: number | null;
  email: string;
  name: string | null;
  picture: string | null;
  avatar_ver: number;
  reply_content: string | null;
  reply_name: string | null;
};

const CHAT_SELECT = `
  SELECT m.id, m.channel, m.user_id, m.content, m.created_at, m.reply_to,
         u.email, COALESCE(u.display_name, u.name) AS name, u.picture, u.avatar_ver,
         r.content AS reply_content, COALESCE(ru.display_name, ru.name) AS reply_name
  FROM chat_messages m
  JOIN users u ON u.id = m.user_id
  LEFT JOIN chat_messages r ON r.id = m.reply_to
  LEFT JOIN users ru ON ru.id = r.user_id
`;

const toChatMessage = (r: ChatRow): ChatMessage => ({
  id: r.id,
  channel: r.channel,
  userId: r.user_id,
  name: r.name ?? r.email.split("@")[0],
  avatar: r.avatar_ver
    ? `/api/users/${r.user_id}/avatar?v=${r.avatar_ver}`
    : r.picture,
  isAdmin: isAdminEmail(r.email),
  content: r.content,
  createdAt: r.created_at,
  replyTo:
    r.reply_to && r.reply_content !== null
      ? {
          id: r.reply_to,
          name: r.reply_name ?? "Pengguna",
          content: r.reply_content.slice(0, 80),
        }
      : null,
});

const chatRecentStmt = db.prepare(
  `${CHAT_SELECT} WHERE m.channel = ? ORDER BY m.id DESC LIMIT 50`,
);
const chatAfterStmt = db.prepare(
  `${CHAT_SELECT} WHERE m.channel = ? AND m.id > ? ORDER BY m.id ASC LIMIT 100`,
);
const chatByIdStmt = db.prepare(`${CHAT_SELECT} WHERE m.id = ?`);
const chatLatestStmt = db.prepare(`${CHAT_SELECT} ORDER BY m.id DESC LIMIT 1`);
const chatLatestIdStmt = db.prepare(
  `SELECT COALESCE(MAX(id), 0) AS id FROM chat_messages`,
);
const chatCountAfterStmt = db.prepare(
  `SELECT COUNT(*) AS n FROM (SELECT 1 FROM chat_messages WHERE id > ? LIMIT 100)`,
);
const chatInsertStmt = db.prepare(
  `INSERT INTO chat_messages (channel, user_id, content, reply_to) VALUES (?, ?, ?, ?)`,
);
const chatLastByUserStmt = db.prepare(
  `SELECT created_at FROM chat_messages WHERE user_id = ? ORDER BY id DESC LIMIT 1`,
);
const chatReportStmt = db.prepare(
  `INSERT OR IGNORE INTO chat_reports (message_id, reporter_id) VALUES (?, ?)`,
);

const chatDeleteStmt = db.prepare(`DELETE FROM chat_messages WHERE id = ?`);

export function listChat(channel: string, after?: number) {
  if (after === undefined) {
    return (chatRecentStmt.all(channel) as ChatRow[]).reverse().map(toChatMessage);
  }
  return (chatAfterStmt.all(channel, after) as ChatRow[]).map(toChatMessage);
}

export function getChatMessage(id: number) {
  const row = chatByIdStmt.get(id) as ChatRow | undefined;
  return row ? toChatMessage(row) : undefined;
}

export function latestChatMessage() {
  const row = chatLatestStmt.get() as ChatRow | undefined;
  return row ? toChatMessage(row) : null;
}

export function latestChatId() {
  return (chatLatestIdStmt.get() as { id: number }).id;
}

export function countChatAfter(id: number) {
  return (chatCountAfterStmt.get(id) as { n: number }).n;
}

export function lastChatAt(userId: string) {
  return (chatLastByUserStmt.get(userId) as { created_at: number } | undefined)
    ?.created_at;
}

export function addChatMessage(m: {
  channel: string;
  userId: string;
  content: string;
  replyTo: number | null;
}) {
  const { lastInsertRowid } = chatInsertStmt.run(
    m.channel,
    m.userId,
    m.content,
    m.replyTo,
  );
  return getChatMessage(Number(lastInsertRowid))!;
}

export function reportChatMessage(messageId: number, reporterId: string) {
  chatReportStmt.run(messageId, reporterId);
}

export function deleteChatMessage(id: number) {
  return chatDeleteStmt.run(id).changes > 0;
}

export function getPublicProfile(id: string) {
  const u = getStmt.get(id) as User | undefined;
  if (!u) return null;

  return {
    id: u.id,
    name: u.display_name ?? u.name ?? "Pengguna",
    avatar: u.avatar_ver
      ? `/api/users/${u.id}/avatar?v=${u.avatar_ver}`
      : u.picture,
    banner: u.banner_ver ? `/api/users/${u.id}/banner?v=${u.banner_ver}` : null,
    bio: u.bio,
    joinedAt: u.created_at,
    isAdmin: isAdminEmail(u.email),
  };
}

const countUsersStmt = db.prepare(`SELECT COUNT(*) AS n FROM users`);

export function countUsers() {
  return (countUsersStmt.get() as { n: number }).n;
}