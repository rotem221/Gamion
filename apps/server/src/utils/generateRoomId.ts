export function generateRoomId(existingIds: Set<string>): string {
  let id: string;
  do {
    id = String(Math.floor(1000 + Math.random() * 9000));
  } while (existingIds.has(id));
  return id;
}
