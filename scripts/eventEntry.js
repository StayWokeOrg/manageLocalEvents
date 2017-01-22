(function(module) {

  var eventEntry = {};
  eventEntry.save = function (e) {
    e.preventDefault();
    var newEvent = new Event( $('#save-event input').get().reduce(function(newObj, cur){
      newObj[cur.id] = $(cur).val();
      return newObj;
    }, {})
  );
    Event.getLatandLog(newEvent, newEvent.address);
  };

  $('#save-event').on('submit', eventEntry.save);
  module.eventEntry = eventEntry;
})(window);
