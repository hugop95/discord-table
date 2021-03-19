export function createDiscordTable(props: DiscordTableProps): Array<string> {
  return new DiscordTable(props).constructTable();
}

const DEFAULT_MAX_COLUMN_LENGTH: number = 50;
const DEFAULT_SPACES_BETWEEN_COLUMNS: number = 5;


interface DiscordTableProps {
  readonly headers?: DiscordTableLine;
  readonly spacesBetweenColumns?: Array<number>;
  readonly ignoreFormatting?: boolean;
  readonly maxColumnLengths?: Array<number>;
  readonly content: Array<DiscordTableLine>;
}

export type DiscordTableCell = Array<string>;
export type DiscordTableLine = Array<DiscordTableCell>;

export class DiscordTable {

  private readonly _headers?: DiscordTableLine;

  private readonly _spacesBetweenColumns?: Array<number>;

  private readonly _maxColumnLengths?: Array<number>;

  private readonly _content: Array<DiscordTableLine>;

  private readonly _ignoreFormatting: boolean;


  constructor(props: DiscordTableProps) {
    this._headers = props.headers;
    this._spacesBetweenColumns = props.spacesBetweenColumns;
    this._maxColumnLengths = props.maxColumnLengths;
    this._content = props.content;
    this._ignoreFormatting = !!props.ignoreFormatting;
  }

  public constructTable(): Array<string> {
    let contentCopy: Array<DiscordTableLine> = JSON.parse(JSON.stringify(this._content));
    if (this._headers) {
      contentCopy.unshift(this._headers);
    }
    // make sure the table responds to the maxColumnLengths restrictions
    contentCopy = DiscordTable._adjustTableToSettingsIfNeeded(contentCopy, this._maxColumnLengths);

    // compute the max length taken by each column
    const columnLengths: Array<number> = DiscordTable._computeMaxColumnLengths(contentCopy);
    // compute max number of sublines per line
    const numberOfSublines: Array<number> = DiscordTable._computeNumberSublines(contentCopy);
    // build the table
    const returnValue: Array<string> = [];
    // for each line
    for (let line = 0; line < contentCopy.length; line++) {
      // for up to the higher number of sub-cells existing in the line
      for (let subLine = 0; subLine < numberOfSublines[line]; subLine++) {
        let returnLine: string = "";
        // for each column
        for (let column = 0; column < contentCopy[line].length; column++) {
          const columnLength: number = columnLengths[column] + ((this._spacesBetweenColumns && this._spacesBetweenColumns[column])
            ? this._spacesBetweenColumns[column] : DEFAULT_SPACES_BETWEEN_COLUMNS);
          const cell: DiscordTableCell = contentCopy[line][column];
          const sublineValue: string = cell[subLine] ? cell[subLine] : "";
          returnLine += DiscordTable._makeAppropriateTableString(sublineValue, columnLength);
        }
        returnValue.push(returnLine || " ");
      }
    }
    if (this._ignoreFormatting) {
      return returnValue;
    } else {
      return DiscordTable._code(returnValue);
    }
  }


  private static _computeNumberSublines(content: Array<DiscordTableLine>): Array<number> {
    const returnValue: Array<number> = [];
    for (const line of content) {
      let maxNumberSublines: number = 1;
      for (const cell of line) {
        if (cell.length > maxNumberSublines) {
          maxNumberSublines = cell.length;
        }
      }
      returnValue.push(maxNumberSublines);
    }
    return returnValue;
  }

  private static _computeMaxColumnLengths(content: Array<DiscordTableLine>): Array<number> {
    const numberOfColumns: number = content[0].length;
    const returnValue: Array<number> = [];
    for (let column = 0; column < numberOfColumns; column++) {
      let maxLengthFound: number = 0;
      for (let line = 0; line < content.length; line++) {
        const cell: DiscordTableCell = content[line][column];
        if (cell) {
          for (const subLine of cell) {
            const sublineLength: number = subLine.length;
            if (sublineLength > maxLengthFound) {
              maxLengthFound = sublineLength;
            }
          }
        }
      }
      returnValue.push(maxLengthFound);
    }
    return returnValue;
  }

  private static _adjustTableToSettingsIfNeeded(content: Array<DiscordTableLine>, maxColumnLengths?: Array<number>): Array<DiscordTableLine> {
    let returnValue: Array<DiscordTableLine> = [];
    // 1st run: each subline of a cell must be shorter than the column limit length
    // for each line
    for (let line = 0; line < content.length; line++) {
      // for each column
      let parsedLine: DiscordTableLine = [];
      for (let column = 0; column < content[line].length; column++) {
        const maxColumnLength: number = (maxColumnLengths && maxColumnLengths[column]) ? maxColumnLengths[column] : DEFAULT_MAX_COLUMN_LENGTH;
        const cell: DiscordTableCell = content[line][column];
        let newCell: DiscordTableCell = [];
        for (const subLine of cell) {
          newCell = newCell.concat(DiscordTable._splitStringByMaxLength(subLine, maxColumnLength));
        }
        // push the checked cell to the current line
        parsedLine.push(newCell);
      }
      // the line has been checked. push it to the content
      returnValue.push(parsedLine);
    }
    return returnValue;
  }

  private static _makeAppropriateTableString(value: string, columnLength: number): string {
    let difference: number = value ? columnLength - value.length : columnLength;
    if (difference <= 0) {
      return value;
    } else {
      for (let i = 0; i < difference; i++) {
        value += " ";
      }
      return value;
    }
  }


  private static _splitStringByMaxLength(stringToSplit: string, maxLength: number): Array<string> {
    if (!stringToSplit) {
      return [];
    }
    let current: number = maxLength;
    let previous: number = 0;
    const output: Array<string> = [];

    while (stringToSplit[current]) {
      if (stringToSplit[current++] === " ") {
        output.push(stringToSplit.substring(previous, current));
        previous = current;
        current += maxLength;
      }
    }
    output.push(stringToSplit.substring(previous));
    return output;
  }

  private static _code(messages: Array<string>): Array<string> {
    const returnValue: Array<string> = messages;
    returnValue[0] = "```" + returnValue[0];
    returnValue[returnValue.length - 1] = returnValue[returnValue.length - 1] + "```";
    return returnValue;
  }


}
