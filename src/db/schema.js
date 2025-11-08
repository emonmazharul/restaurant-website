import { json,boolean,date,time,integer,serial,numeric, pgTable, varchar,text } from "drizzle-orm/pg-core";
import { timestamps } from './helpers.js';

export const usersTable = pgTable("users", {
  id: text().notNull().primaryKey(),
  fullName: varchar({length:255}).notNull(),
  email: varchar({length:255}).notNull().unique(),
  fullAddress:text().notNull(),
  postCode: text().notNull(),
  password: text().notNull(),
  phone: text().notNull(),
  ...timestamps
});


export const menuTable = pgTable("menus", {
  id:serial(),
  category: varchar({length:150}).notNull(),
  name:varchar({length:255}).notNull(),
  price: numeric({mode:'number'}).notNull(),
  variant : json(),
  ...timestamps
})

export const reservationTable = pgTable("reservations", {
  id: serial(),
  fullName:varchar({length:255}).notNull(),
  email:varchar({length:255}).notNull(),
  phone:text().notNull(),
  guests:integer().notNull(),
  booking_date:date().notNull(),
  booking_time:time().notNull(),
  special_request:text(),
  confirmed:boolean().default(false),
  ...timestamps
});

export const orderTable = pgTable('orders', {
  id:serial(),
  orderId:text().notNull().unique(),
  fullName:varchar({length:255}).notNull(),
  email:varchar({length:255}).notNull(),
  phone:text().notNull(),
  cart:json().notNull(),
  fullAddress:text(),
  postCode:text(),
  orderType:varchar({length:50}).notNull(),
  paymentMethod:varchar({length:50}).notNull(),
  checkoutId:text(),
  deliveryTime:text().notNull().default('ASAP'),
  totalPrice:numeric({mode:'number'}).notNull(),
  orderCanceled:boolean().default(false),
  checkedByAdmin:boolean().default(false),
  checkoutCompleted:boolean().default(false),
  specialRequest:text(),
  ...timestamps
});

export const salesTable = pgTable('sales', {
  id:serial(),
  totalSale:numeric({mode:'number'}).notNull(),
  saleDate:text().notNull(),
  ...timestamps
})


