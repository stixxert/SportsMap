"use client";

import { DBSchema, IDBPDatabase, openDB } from "idb";

const DBNAME = "keyval";

type KValue = string | object | number | boolean | undefined;
interface KVSchema extends DBSchema {
  keyval: {
    key: string;
    value: KValue;
  };
}

export type KVDB = IDBPDatabase<KVSchema>;

export async function openKVDB(): Promise<KVDB> {
  return openDB<KVSchema>(DBNAME, 1, {
    upgrade(db) {
      db.createObjectStore(DBNAME);
    },
  });
}

export async function get<T extends KValue>(db: KVDB, key: string): Promise<T> {
  return (await db.get(DBNAME, key)) as T;
}

export async function set<T extends KValue>(
  db: KVDB,
  key: string,
  value: T,
): Promise<string> {
  return db.put(DBNAME, value, key);
}

export async function del(db: KVDB, key: string): Promise<void> {
  return db.delete(DBNAME, key);
}
