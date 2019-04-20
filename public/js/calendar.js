// eslint-disable-next-line
function newCalendar(defaultView) {
    return $("#calendar").fullCalendar({
        editable:true,
        defaultView: defaultView,
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
        editable:true,
        eventDrop: function(event)
        {

            var newStart = $.fullCalendar.formatDate(event.start, "Y-MM-DD HH:mm:ss");

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
                    calendar.fullCalendar("refetchEvents");
                }
            });
        }

    });
}
