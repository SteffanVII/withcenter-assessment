import { Selectable } from "kysely";
import { BlogUserUser } from "../../db.js";

export type TUser = Omit<Selectable<BlogUserUser>, "password_hashed">