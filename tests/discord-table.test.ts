import {createDiscordTable, DiscordTableLine} from "../src/discord-table";

describe("discord-table unit tests", () => {
  it("should pass", () => {
    const headers: DiscordTableLine = [
      ["USERNAME"], ["ROLES"], ["AGE"], ["DAYS SINCE JOINED"]
    ];
    const content: Array<DiscordTableLine> = [
      [["Jeremy"], ["Admin", "Regular"], ["18"], ["45 days"]],
      [["James"], ["Newcomer"], [], ["2 days"]],
      [["Marc"], ["Regular"], ["22"], ["20 days"]],
      [],
      [["Karl"], ["BANNED"], ["BANNED"], ["BANNED"]]
    ]
    const discordTable = createDiscordTable({
      headers: headers,
      content: content,
      spacesBetweenColumns: [5, 5, 5],
      maxColumnLengths: [30, 30, 30, 30]
    })
    expect(discordTable).toEqual([
      "```USERNAME     ROLES        AGE        DAYS SINCE JOINED     ",
      "Jeremy       Admin        18         45 days               ",
      "             Regular                                       ",
      "James        Newcomer                2 days                ",
      "Marc         Regular      22         20 days               ",
      " ",
      "Karl         BANNED       BANNED     BANNED                ```"
    ])
  })
})
