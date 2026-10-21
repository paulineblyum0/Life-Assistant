// Today's date as "YYYY-MM-DD" in your local timezone
export function todayISO() {
  return new Date().toLocaleDateString("en-CA");
}

export function formatDate(d: string) {
  return new Date(d + "T00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}