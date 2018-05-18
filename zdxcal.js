/*!
    @Name：日历
    @version：1.0.0
    @Author：钟德贤
    @Website：https://github.com/xian107/zdxcal
    @Time：2018-05-18
*/
(function () {
  var zdx = {}
  function pad(n) {
    var n_ = n.toString();
    return new Array(3 - n_.length).join('0') + n_;
  }
  function iso8601(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }
  function renderWeek(date, table) {
    var day = date;
    var row = $("<tr />");
    for (var i = 1; i <= 7; i++) {
      var td = $("<td />");
      td.attr('date', iso8601(day));
      td.attr('year', day.getFullYear());
      td.attr('month', day.getMonth() + 1);
      td.attr('day', day.getDate());
      row.append(td);

      table.trigger('renderDay',{'element': td,'date': day});

      day = new Date(day);
      day.setDate(day.getDate() + 1);
    }
    return row;
  }
  window.zdxCal = function (options) {
    var weekdays = options !== undefined && 'weekdays' in options ? options.weekdays : ['日', '一', '二', '三', '四', '五', '六'];
    var months = options !== undefined && 'months' in options ? options.months : ['1月', '2月', '3月', '4月', '5月', '6月','7月', '8月', '9月', '10月', '11月', '12月'];

    var startDay = options !== undefined && 'startDay' in options ? options.startDay : 0;

    var weeks = []; // cache

    var prev = $('<a href="javascript:;" class="zdxPrev">上个月</a>');
    var next = $('<a href="javascript:;" class="zdxNext">下个月</a>');
    var monthyear = $('<span class="monthyear" />');
    var monthbox = $('<div class="monthbox" />');
    monthbox.append(prev);
    monthbox.append(monthyear);
    monthbox.append(next);

    var monthHeader = $('<th />');
    monthHeader.attr("colspan",7);
    monthHeader.append(monthbox);

    var weekdayHeader = $('<tr class="monthweek" />');
    for (var i = 0; i < weekdays.length; i++) {
      var th = $('<th />');
      th.append(weekdays[(i + startDay) % weekdays.length]);
      weekdayHeader.append(th);
    }

    var table = $('<table class="calendar" />');

    var tHead = $('<thead />').appendTo(table);
    tHead.append(monthHeader);
    tHead.append(weekdayHeader);
    var tbody = $('<tbody />');
    table.append(tbody);

    zdx.table = table;
    zdx.year = function () {return table.attr('year') ? parseInt(table.attr('year'), 10) : null;};
    zdx.month = function () {return table.attr('month') ? parseInt(table.attr('month'), 10) : null;};

    zdx.findCell = function (date) {return table('[date="' + iso8601(date) + '"]');};
    zdx.changeMonth = function (date) {

      var first = new Date(date.getFullYear(), date.getMonth(), 1);
      var dif = first.getDay() - startDay;
      if (dif < 0)
        dif += 7;
      var weekStart = new Date(first);
      weekStart.setDate(weekStart.getDate() - dif);
      var week = weekStart;
      var now = new Date();
      var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      var year = date.getFullYear();
      var month = date.getMonth();

      table.attr('year', year);
      table.attr('month', month + 1);

      $(table).trigger('monthChange',{})

      // 清空tbody
      tbody.empty();

      do {
        // 如果有缓存就用缓存
        var tr = weeks[iso8601(week)];
        if (!tr) { 
          tr = renderWeek(week, table);
          weeks[iso8601(week)] = tr;
        }
        tr.children('td').each(function(index, el) {
            $(this).removeClass().addClass($(this).attr('month') == month + 1 ? 'current' : 'extra');
            $(this).addClass($(this).attr('date') === iso8601(today) ? ' today' : '');
        });

        tbody.append(tr);
        
        week = new Date(week);
        week.setDate(week.getDate() + 7);
      } while (week.getMonth() === date.getMonth());

      monthyear.empty();
      monthyear.html(months[month] + ' ' + year);
    };

    prev.on('click', function () {
      zdx.changeMonth(new Date(zdx.year() - (zdx.month() === 1  ? 1 : 0), zdx.month() === 1 ? 11 : zdx.month() - 2, 1));
    });
    next.on('click', function () {
      zdx.changeMonth(new Date(zdx.year() + (zdx.month() === 12 ? 1 : 0), zdx.month() === 12 ? 0 : zdx.month(), 1));
    });

    return zdx;
  };
})();
