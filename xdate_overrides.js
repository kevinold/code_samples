/* Interface to enforce valid dates. 
 * An extention to the XDate library (https://github.com/arshaw/xdate) */


// Public interface
iso8601Date: function(input_date) {
  if (validYMD(input_date) || validMDY(input_date)) {
    var d = XDate(input_date);
    if (d && d.valid()) {
      return d.toString(DG.properties.iso8601DateFormat);
    }
  }
  return false;
}


/* Validation methods */

// parses dates like "19810528"
function parseDICOMDate(str) {
    var m = str.match(/^(\d{4})(\d{2})(\d{2})$/);
    if (m && m.length === 4) {
        return new XDate(
            parseInt(m[1],10),
            parseInt(m[2] ? m[2]-1 : 0,10),
            parseInt(m[3],10)
        );
    }
}

// valid month if between 1-12
function validMonth(m) {
  m = parseInt(m, 10);
  if (m >= 1 && m <= 12) {
    return true;
  }
  return false;
}

// valid day if between 1-31
function validDay(m) {
  m = parseInt(m, 10);
  if (m >= 1 && m <= 31) {
    return true;
  }
  return false;
}

// validate the number of days for the month passed
function validNumberOfDaysForMonth(mo, day) {
  mo = parseInt(mo, 10);
  var numOfDays = XDate.getDaysInMonth(XDate().getFullYear(), mo-1);

  if (day >= 1 && day <= numOfDays) {
    return true;
  }
  return false;
}

// validate year
function validYear(m) {
  if (m >= 0000 && m <= 9999) {
    return true;
  }
  return false;
}

// validate YYYY-MM-DD or YYYY/MM/DD
function validYMD(str) {
    if (str && str.match(/^(\d{4})[/|-](\d{2})[/|-](\d{2})$/)) {
        var parts = str.split(/[/|-]/);
        var yr = parseInt(parts[0],10), // year
            mo = parseInt(parts[1],10), // month
            day = parseInt(parts[2],10); // day

        // validate parts of date
        if ((validYear(yr) && validMonth(mo) && validDay(day))) {
          if (validNumberOfDaysForMonth(mo, day)) {
            return true;
          }
        }
    }
    return false;
}

// validate MM-DD-YYYY or MM/DD/YYYY
function validMDY(str) {
    if (str && str.match(/^(\d{2})[/|-](\d{2})[/|-](\d{4})$/)) {
        var parts = str.split(/[/|-]/);
        var yr = parseInt(parts[2],10), // year
            mo = parseInt(parts[0],10), // month
            day = parseInt(parts[1],10); // day

        // validate parts of date
        if ((validYear(yr) && validMonth(mo) && validDay(day))) {
          if (validNumberOfDaysForMonth(mo, day)) {
            return true;
          }
        }
    }
    return false;
}

// parses dates like "05/28/1981" or "05-28-1981"
function parseMDY(str) {
    if (str && str.match(/^(\d{2})[/|-](\d{2})[/|-](\d{4})$/)) {
        var parts = str.split(/[/|-]/);
        var yr = parseInt(parts[2],10), // year
            mo = parseInt((parts[0] ? parts[0]-1 : 0),10), // month
            day = parseInt(parts[1],10); // day

        // validate parts of date
        if (validYear(yr) && validMonth(mo) && validDay(day)) {
          var xd = new XDate(yr, mo, day);
        }

        return xd && xd.valid() ? xd : false;
    }
}

// parses something like: 20080429 090010 into: 2008/04/29 09:00:10
function parseDateTime(str) {
    var parts = str.split(" ");
    if (parts.length === 2) {
        var xDate = parseDICOMDate(parts[0]);
        var m = parts[1].match(/^(\d{2})(\d{2})(\d{2})?.?/);
        if (xDate && m && m.length === 4) {
            return xDate.setHours(parseInt(m[1],10)).setMinutes(parseInt(m[2],10)).setSeconds(parseInt(m[3],10) || 0);
        }
        else {
            return xDate;
        }
    }
}

XDate.parsers.push(parseDICOMDate);
XDate.parsers.push(parseMDY);
XDate.parsers.push(parseDateTime);
