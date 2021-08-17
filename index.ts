type N0 = 0;
type N1to6 = 1 | 2 | 3 | 4 | 5 | 6;
type N7to12 = 7 | 8 | 9 | 10 | 11 | 12;
type N13to23 = 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23;
type N24to31 = 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31;
type N32to59 =
  | 32
  | 33
  | 34
  | 35
  | 36
  | 37
  | 38
  | 39
  | 40
  | 41
  | 42
  | 43
  | 44
  | 45
  | 46
  | 47
  | 48
  | 49
  | 50
  | 51
  | 52
  | 53
  | 54
  | 55
  | 56
  | 57
  | 58
  | 59;

type Hour = `${N0 | N1to6 | N7to12 | N13to23}`;
type DayOfMonth = `${N1to6 | N7to12 | N13to23 | N24to31}`;

// not using, the actually Month and DayOfWeek are checked from the map
// type Month = `${N1to6 | N7to12}`;
// type DayOfWeek = `${N0 | N1to6}`;

type Minute = `${N0 | N1to6 | N7to12 | N13to23 | N24to31 | N32to59}`;
type Err = "Cron Expression seems wrong";

type Plural<N extends string> = `${N extends "1" ? "" : "s"}`;
type Index<N extends string> = `${N}${N extends `${number}`
  ? N extends `1`
    ? "st"
    : N extends `2`
    ? "nd"
    : N extends `3`
    ? "rd"
    : "th"
  : ""}`;

type Op<
  Input extends string,
  Unit extends string,
  As extends "plural" | "index"
> = Input extends "*"
  ? ``
  : Input extends `*/${infer Interval}`
  ? Interval extends `${number}`
    ? `${As extends "index"
        ? `on every ${Index<Interval>}`
        : `on every ${Interval}`} ${Unit}${As extends "plural"
        ? Plural<Interval>
        : ""}`
    : Err
  : Input extends `${infer Start}-${infer End}`
  ? `every ${Unit} from ${Start} to ${End}`
  : Input extends `${string},${string}`
  ? `if ${Unit} in ${Input}`
  : Err;

type UnitOrEvery<
  U extends string,
  T extends string,
  N extends string,
  A extends "plural" | "index"
> = T extends U ? T : Op<T, N, A>;

type PrintMinute<M extends string> = UnitOrEvery<Minute, M, "minute", "plural">;
type PrintHour<H extends string> = UnitOrEvery<Hour, H, "hour", "plural">;
type PrintDayOfMonth<D extends string> = D extends DayOfMonth
  ? `on every ${Index<D>} day-of-month`
  : Op<D, "day-of-month", "index">;

type DayOfWeekMap = {
  "0": "Sunday";
  "1": "Monday";
  "2": "Tuesday";
  "3": "Wednesday";
  "4": "Thursday";
  "5": "Friday";
  "6": "Saturday";

  MON: "Monday";
  TUE: "Tuesday";
  WED: "Wednesday";
  THU: "Thursday";
  FRI: "Friday";
  SAT: "Saturday";
  SUN: "Sunday";
};

type PrintDayOfWeek<D extends string> =
  Uppercase<D> extends `${keyof DayOfWeekMap}`
    ? `if it's on ${Index<DayOfWeekMap[Uppercase<D>]>}`
    : Op<D, "day-of-week", "index">;

type MonthMap = {
  "1": "January";
  "2": "February";
  "3": "March";
  "4": "April";
  "5": "May";
  "6": "June";
  "7": "July";
  "8": "August";
  "9": "September";
  "10": "October";
  "11": "November";
  "12": "December";

  JAN: "January";
  FEB: "February";
  MAR: "March";
  APR: "April";
  MAY: "May";
  JUN: "June";
  JUL: "July";
  AUG: "August";
  SEP: "September";
  OCT: "October";
  NOV: "November";
  DEC: "December";
};

type PrintMonth<M extends string> = Uppercase<M> extends `${keyof MonthMap}`
  ? `in ${MonthMap[Uppercase<M>]}`
  : Op<`${M}`, "month", "index">;

type PadZero<I extends string> = I extends `${number}${number}` ? I : `0${I}`;

type PrintCombineHourAndMinute<
  H extends string,
  M extends string
> = H extends `${Hour}`
  ? M extends `${Minute}`
    ? `${PadZero<H>}:${PadZero<M>}`
    : `${M} past ${H} hour${Plural<H>}`
  : M extends `${Minute}`
  ? `minute ${M} ${H}`
  : `${M} past ${H}`;

type Print<
  Mi extends string,
  H extends string,
  DoM extends string,
  Mo extends string,
  DoW extends string
> = `At ${PrintCombineHourAndMinute<
  PrintHour<H>,
  PrintMinute<Mi>
>} ${PrintDayOfMonth<DoM>} ${PrintDayOfWeek<DoW>} ${PrintMonth<Mo>}`;

type ClearErr<I> = I extends `${string}${Err}${string}` ? Err : I;
type ReduceSpace<I> = I extends `${infer A}  ${infer B}`
  ? ReduceSpace<`${A} ${B}`>
  : I extends `${infer L} `
  ? ReduceSpace<L>
  : I extends ` ${infer R}`
  ? ReduceSpace<R>
  : I;

export type InferCron<CronString extends string> =
  CronString extends `${infer Mi} ${infer H} ${infer DoM} ${infer Mo} ${infer DoW}`
    ? ReduceSpace<ClearErr<Print<Mi, H, DoM, Mo, DoW>>>
    : Err;

/**
 *
 * @param input cron string
 * this is an noop only to provide inferred cron type.
 */
export function Cron<Input extends string, _State = { when: InferCron<Input> }>(
  input: Input
): Input {
  return input;
}
