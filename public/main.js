
$(function() {
  $('#scheduler').kendoScheduler({
      date               : new Date('2024/9/2'),
      startTime          : new Date('2024/9/2 08:00 AM'),
      endTime            : new Date('2024/9/2 08:00 PM'),
      dateHeaderTemplate : kendo.template(
          "<strong>#=kendo.toString(date, 'D')# - #=kendo.toString(kendo.date.nextDay(date), 'D')#</strong>"
      ),
      eventHeight : 50,
      majorTick   : 360,
      views       : ['timeline', 'timelineWeek'],
      timezone    : 'Etc/UTC',
      dataSource  : {
          transport : {
              read : function(options) {
                  $.ajax({
                      url      : '/api/appointments/get',
                      dataType : 'json',
                      success  : function(result) {
                          options.success(result);
                      },
                      error : function(result) {
                          options.error(result);
                      }
                  });
              },
              submit : function(e) {
                  var data = e.data;

                  // Send batch update to desired URL, then notify success/error.
                  $.ajax({
                      url      : '/api/appointments/sync',
                      type     : 'POST',
                      dataType : 'json',
                      data,
                      success  : function(data) {
                          e.success(data.updated, 'update');
                          e.success(data.created, 'create');
                          e.success(data.destroyed, 'destroy');
                      },
                      error : function(result) {
                          e.error(result, 'customerror', 'custom error');
                      }
                  });
              }
          },
          batch  : true,
          schema : {
              model : {
                  id     : 'meetingID',
                  fields : {
                      meetingID : { from : 'meetingID', type : 'number' },
                      title     : {
                          defaultValue : 'No title',
                          validation   : { required : true }
                      },
                      start    : { type : 'date' },
                      end      : { type : 'date' },
                      roomId   : { type : 'number', nullable : true },
                      isAllDay : { type : 'boolean' }
                  }
              }
          }
      },
      group : {
          resources   : ['Rooms'],
          orientation : 'vertical'
      },
      resources : [
          {
              field      : 'roomId',
              name       : 'Rooms',
              dataSource : {
                  transport : {
                      read : {
                          url      : '/api/resources/get',
                          dataType : 'json'
                      }
                  },
                  schema : {
                      model : {
                          id     : 'value',
                          fields : {
                              value : { type : 'number' },
                              text  : {
                                  defaultValue : 'No title',
                                  validation   : { required : true }
                              },
                              color : { type : 'string' }
                          }
                      }
                  }
              },
              title : 'Room'
          }
      ]
  });
});
