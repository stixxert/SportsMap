type DateBoundary = {
  begin: Date;
  end: Date;
};

export function sameDay(date: Date): DateBoundary {
  const begin = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const end = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );

  return { begin, end };
}

export function sameMonth(date: Date): DateBoundary {
  const begin = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0,
    23,
    59,
    59,
    999,
  );

  return { begin, end };
}

export function sameYear(date: Date): DateBoundary {
  const begin = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);

  return { begin, end };
}
