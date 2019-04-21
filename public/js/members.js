$(document).ready(function() {
    $.get("/api/calendar").then(function(data){
        var events=[];
        for(var i=0;i<data.length; i++) {
            var event={
                title:data[i].Meal.name,
                start:data[i].date
            };
            events.push(event);
        }
        var d = new Date();
        // d.setDate(d.getDate()+1);

        $("#calendar").fullCalendar({
            header: {
                left: "prev,next today",
                center: "title",
                right: "month,basicWeek,basicDay"
            },
            height: 500,
            defaultView: "basicWeek",
            defaultDate: d,
            navLinks: true, // can click day/week names to navigate views
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            events:events,
            eventClick: function(calEvent) {
                swal({
                    title: calEvent.title,
                    icon: "success",
                });
            }
        });
    });
});