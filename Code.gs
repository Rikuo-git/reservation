function doGet(e) {
  // htmlオブジェクトを生成
  const html = HtmlService.createTemplateFromFile("Index");

  //スプレッドシートから機器のリストを取得してhtmlに渡す
  const ss = SpreadsheetApp.openById("15kxbRYtUJem2hDERSDJHMg7RkWKmEXUtwdrx7ZHfZYM");
  const sheets = ss.getSheets();
  let kikiList = {};
  sheets.forEach(function (sheet) {
    const name = sheet.getName()
    kikiList[name] = [];
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 2).getValues().forEach(function (row) {
      kikiList[name].push({ "name": row[0], "cal_id": row[1] });
    })
  })
  html.kikiList = kikiList;

  // htmloutputを生成
  const htmlOutput = html.evaluate();

  // タグを追加
  htmlOutput
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setTitle('機器予約')
  return htmlOutput
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
    .getContent();
}

function addNewEvent(name, start, end, calId, f = false) {
  const startTime = new Date(start + ":00+09:00");
  const endTime = new Date(end + ":00+09:00");
  const cal = CalendarApp.getCalendarById(calId);

  //指定した時間の予約を取得
  const events = cal.getEvents(startTime, endTime);

  if (events.length > 0 && f == false) {
    //既に予約がある時、f==trueの時はあっても記入する
    return [false, "既に予約している人がいます。\nそれでも登録しますか？"]
  }

  // 予約をカレンダーに記入
  const event = cal.createEvent(name, startTime, endTime);
  if (event.getId) {
    return [true, "予約完了"]
  }
  else {
    return [true, "登録に問題が発生しました。"]
  }
}

function listEvents(name, calId) {
  //現在から半年先の予定を取得
  const now = new Date();
  const sixMonthFromNow = new Date(now.getTime() + (6 * 30 * 24 * 60 * 60 * 1000));
  const events = CalendarApp.getCalendarById(calId).getEvents(now, sixMonthFromNow, { search: name })

  //名前を完全一致のみ抽出→開始時間でソート→リストにフォーマット
  const eventList = events
    .filter(event => event.getTitle() == name)
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
      return [id, Utilities.formatDate(start, 'JST', 'yy/MM/dd HH:mm'), Utilities.formatDate(end, 'JST', 'yy/MM/dd HH:mm')];
    });
  return eventList;
}

function deleteEvent(calId, id) {
  const event = CalendarApp.getCalendarById(calId).getEventById(id);
  event.deleteEvent();
}