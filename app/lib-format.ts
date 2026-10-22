export function formatDate(sqliteDate: string) {
  return new Date(sqliteDate.replace(" ", "T") + "Z").toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
