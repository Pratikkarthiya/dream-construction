import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const workers=sqliteTable('workers',{id:text('id').primaryKey(),name:text('name').notNull(),role:text('role').notNull(),rate:integer('rate').notNull()});
export const sites=sqliteTable('sites',{id:text('id').primaryKey(),name:text('name').notNull()});
export const attendance=sqliteTable('attendance',{id:text('id').primaryKey(),worker:text('worker').notNull().references(()=>workers.id),date:text('date').notNull(),site:text('site').references(()=>sites.id),units:integer('units').notNull(),rate:integer('rate').notNull(),otHours:integer('ot_hours').notNull().default(0)},t=>[uniqueIndex('attendance_worker_date').on(t.worker,t.date)]);
export const payments=sqliteTable('payments',{id:text('id').primaryKey(),worker:text('worker').notNull().references(()=>workers.id),date:text('date').notNull(),amount:integer('amount').notNull(),kind:text('kind').notNull(),note:text('note').notNull().default('')});

export const members=sqliteTable('members',{email:text('email').primaryKey(),userId:text('user_id'),role:text('role').notNull()},t=>[uniqueIndex('members_user_id').on(t.userId)]);

export const accounts=sqliteTable('accounts',{username:text('username').primaryKey(),passwordHash:text('password_hash').notNull(),salt:text('salt').notNull(),role:text('role').notNull()});
export const sessions=sqliteTable('sessions',{tokenHash:text('token_hash').primaryKey(),username:text('username').notNull().references(()=>accounts.username),expires:integer('expires').notNull()});
export const loginAttempts=sqliteTable('login_attempts',{key:text('key').primaryKey(),count:integer('count').notNull(),expires:integer('expires').notNull()});
