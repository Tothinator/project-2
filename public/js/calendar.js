// eslint-disable-next-line
function newCalendar(calendarEl, defaultView, editable, cb) {
    var calendar = new FullCalendar.Calendar(calendarEl, {
        editable: editable,
        defaultView: defaultView,
        navLinks: true,
        header:{
            left:"prev, next today",
            center:"title",
            right:"month,agendaWeek,agendaDay"
        },
        eventSources: [
            {
                url: "/api/calendar",
                method: "GET",
                failure: function() {
                    alert("There was an error while fetching events!");
                }
            }
        ],
        selectable:true,
        selectHelper:true,
        eventDrop: function(event)
        {

            var newStart = moment(event.start).format("Y-MM-DD HH:mm:ss");

            var title = event.title;
            var id = event.id;

            var data = {
                title:title,
                date: newStart,
                id:id
            };
            $.ajax({
                url:"/api/calendar",
                type:"PUT",
                data: data,
                success:function(res)
                {
                    console.log(res);
                    window.location.reload();
                }
            });
        }

    });

    calendar.render();
}
