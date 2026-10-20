import { ObjectId } from "mongodb";

/** Parses a route/form id; null for anything that isn't a valid ObjectId. */
export function toObjectId(id: string | null | undefined): ObjectId | null {
  return id && ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id) ? new ObjectId(id) : null;
}
