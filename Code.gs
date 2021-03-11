/**
 * 機器リストのスプレッドシートID
 * @type {string}
 */
const KIKILIST_ID = "15kxbRYtUJem2hDERSDJHMg7RkWKmEXUtwdrx7ZHfZYM";

/**
 * doGet関数
 * @param {Object} e parameter
 * @return {HtmlOutput}
 */
function doGet(e) {
  // htmlオブジェクトを生成
  const html = HtmlService.createTemplateFromFile("Index");

  // htmloutputを生成
  const htmlOutput = html.evaluate();

  // タグを追加
  htmlOutput
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("機器予約");
  return htmlOutput;
}

/**
 * .htmlファイルをテキストとして出力
 * @param {string} filename
 * @return {string}
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * 機器のリストをオブジェクトとして返す。
 * @return {Object}
 */
function getKikiList() {
  const ss = SpreadsheetApp.openById(KIKILIST_ID);
  const sheets = ss.getSheets();
  const kikiList = {};
  sheets.forEach(function (sheet) {
    const name = sheet.getName();
    kikiList[name] = [];
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, 2)
      .getValues()
      .forEach(function (row) {
        kikiList[name].push({ name: row[0], cal_id: row[1] });
      });
  });
  return kikiList;
}

/**
 * カレンダーにイベントを追加
 * @param {Object} param0
 * @param {string} param0.name
 * @param {string} param0.start
 * @param {string} param0.end
 * @param {string} param0.comment
 * @param {string} param0.calId
 * @param {boolean} param0.force
 * @return {Object}
 */
function addNewEvent({ name, start, end, comment, calId, force = false }) {
  const startTime = new Date(start + ":00+09:00");
  const endTime = new Date(end + ":00+09:00");
  const cal = CalendarApp.getCalendarById(calId);
  //指定した時間の予約を取得
  const events = cal.getEvents(startTime, endTime);
  if (events.length > 0 && force == false) {
    //既に予約がある時、f==trueの時はあっても記入する
    return {
      done: false,
      msg: "既に予約している人がいます。\nそれでも登録しますか？",
    };
  }
  // 予約をカレンダーに記入
  const event = cal.createEvent(name, startTime, endTime, {
    description: comment,
  });
  if (event.getId) {
    return { done: true, msg: "予約完了" };
  } else {
    throw "登録中に問題が発生しました。\nしばらくしてからもう一度お試しください。";
  }
}

/**
 * カレンダーのイベントを編集
 * @param {Object} param0
 * @param {string} param0.name
 * @param {string} param0.start
 * @param {string} param0.end
 * @param {string} param0.comment
 * @param {string} param0.calId
 * @param {string} param0.eventId
 * @param {boolean} param0.force
 * @return {Object}
 */
function editEvent({
  name,
  start,
  end,
  comment,
  calId,
  eventId,
  force = false,
}) {
  const startTime = new Date(start + ":00+09:00");
  const endTime = new Date(end + ":00+09:00");
  const cal = CalendarApp.getCalendarById(calId);

  //指定した時間の予約を取得
  const events = cal
    .getEvents(startTime, endTime)
    .filter((event) => event.getTitle() != name);

  if (events.length > 0 && force == false) {
    //既に予約がある時、f==trueの時はあっても記入する
    return {
      done: false,
      msg: "既に予約している人がいます。\nそれでも登録しますか？",
    };
  }

  // 予約をカレンダーに記入
  const event = cal.getEventById(eventId);
  event.setTime(startTime, endTime);
  event.setDescription(comment);
  return { done: true, msg: "予約完了" };
}

/**
 * カレンダーのイベントのリストを取得
 * @param {Object} param0
 * @param {string} param0.name
 * @param {string} param0.calId
 * @return {Object[]}
 */
function listEvents({ name, calId }) {
  //現在から半年先の予定を取得
  const now = new Date();
  const sixMonthFromNow = new Date(
    now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000
  );
  const events = CalendarApp.getCalendarById(calId).getEvents(
    now,
    sixMonthFromNow,
    { search: name }
  );

  //名前を完全一致のみ抽出→開始時間でソート→リストにフォーマット
  const eventList = events
    .filter((event) => event.getTitle() == name)
    .sort(function (a, b) {
      const timeA = a.getStartTime();
      const timeB = b.getStartTime();
      if (timeA < timeB) {
        return -1;
      }
      if (timeA > timeB) {
        return 1;
      }
      return 0;
    })
    .map(function (event) {
      const id = event.getId();
      const start = event.getStartTime();
      const end = event.getEndTime();
      const comment = event.getDescription();
      const eventURL =
        "https://www.google.com/calendar/event?eid=" +
        Utilities.base64Encode(event.getId().split("@")[0] + " " + calId);
      return {
        eventId: id,
        start: Utilities.formatDate(start, "JST", "yyyy-MM-dd'T'HH:mm+09:00"),
        end: Utilities.formatDate(end, "JST", "yyyy-MM-dd'T'HH:mm+09:00"),
        comment: comment,
        link: eventURL,
      };
    });
  return eventList;
}

/**
 * イベントを削除
 * @param {string} calId
 * @param {string} eventId
 */
function deleteEvent({ calId, eventId }) {
  const event = CalendarApp.getCalendarById(calId).getEventById(eventId);
  event.deleteEvent();
}

function test() {
  Logger.log(new Date() > new Date("Wed Dec 31 19:00:00 GMT-05:00 1969"));
}
