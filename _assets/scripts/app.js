(function () {
  var Today = new Date();

  function getMonthFormatted(date) {
    var month = date.getUTCMonth() + 1;
    return month < 10 ? '0' + month : month;
  }

  function getYearMonthFormatted(date) {
    return [date.getUTCFullYear(), getMonthFormatted(date)].join('-');
  }

  function isCurrentMonth(entry) {
    var entryYearMonth = entry.id.substring(0, 7);
    return entryYearMonth === getYearMonthFormatted(Today);
  }

  var emTimetableDownloadButton = document.querySelector('.em-timetable-download-button');

  if (emTimetableDownloadButton) {
    var emLatestTimetable = (window.em_timetable.filter(isCurrentMonth))[0];

    if (emLatestTimetable === undefined) {
      return;
    }

    var emTimetableDownloadButtonGuid = emTimetableDownloadButton.dataset.timetableGuid;

    if (emLatestTimetable.guid !== emTimetableDownloadButtonGuid) {
      var emTimetableDownloadButtonUri = emTimetableDownloadButton.dataset.timetableUri;

      var currentMonthDownloadUrl = emTimetableDownloadButtonUri.replace('$guid', emLatestTimetable.guid);
      emTimetableDownloadButton.setAttribute('href', currentMonthDownloadUrl);

      var label = emTimetableDownloadButton.querySelector('.em-timetable-month-label');
      label.textContent = emLatestTimetable.label;
    }
  }
})();
