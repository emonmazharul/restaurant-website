import { sql } from 'drizzle-orm';
import {int,integer,sqliteTable, text,} from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable("users_table", {
  id: text().primaryKey({}),
  fullName: text().notNull(),
  email: text().notNull().unique(),
  fullAddress:text().notNull(),
  postCode: text().notNull(),
  password: text().notNull(),
  phone: text().notNull(),

});


export const menuTable = sqliteTable("menu", {
  id:int().primaryKey({autoIncrement:true}),
  category: text().notNull(),
  name:text().notNull(),
  price: int().notNull(),
  variant : text('', {mode:'json'}),
  lastUpdate: integer("last_update", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
})

export const reservationTable = sqliteTable("reservations", {
  id:int().primaryKey({autoIncrement:true}),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  fullName:text().notNull(),
  email:text().notNull(),
  phone:text().notNull(),
  guests:int().notNull(),
  booking_date:integer({mode:'timestamp'}).notNull(),
  booking_time:text().notNull(),
  special_request:text(),
  confirmed:integer({mode:'boolean'}).default(false),
});

export const orderTable = sqliteTable('order', {
  id:int().primaryKey({autoIncrement:true}),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
  orderId:text().notNull().unique(),
  fullName:text().notNull(),
  email:text().notNull(),
  phone:text().notNull(),
  cart:text({mode:'json'}).notNull(),
  fullAddress:text(),
  postCode:text(),
  orderType:text().notNull(),
  paymentMethod:text().notNull(),
  checkoutId:text(),
  deliveryTime:text().notNull().default('ASAP'),
  totalPrice:integer().notNull(),
  orderCanceled:integer({mode:'boolean'}).default(false),
  checkedByAdmin:integer({mode:'boolean'}).default(false),
  checkoutCompleted:integer({mode:'boolean'}).default(false),
  specialRequest:text(),
});

export const salesTable = sqliteTable('sale', {
  id:int().primaryKey({autoIncrement:true}),
  totalSale:integer().notNull(),
  saleDate:text().notNull(),
})


