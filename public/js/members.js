$(document).ready(function() {
    $.get("/calendar").then(function(){

        $("#calendar").fullCalendar({
            header: {
                left: "prev,next today",
                center: "title",
                right: "month,basicWeek,basicDay"
            },
            height: 500,
            defaultView: 'basicWeek',
            defaultDate: "2019-04-18",
            navLinks: true, // can click day/week names to navigate views
            editable: true,
            eventLimit: true, // allow "more" link when too many events
            events: [
                {
                    title: "Spaghetti",
                    start: "2019-04-01",
                    backgroundColor:"red"
                },
                {
                    title: "Pasta",
                    start: "2019-04-07",
                    end: "2019-04-10",
                    backgroundColor:"green"
                },
                {
                    id: 999,
                    title: "Pizza",
                    start: "2019-04-09T16:00:00"
                },
                {
                    id: 999,
                    title: "Macaroni",
                    start: "2019-04-16T16:00:00"
                },
                {
                    title: "Roast Beef",
                    start: "2019-04-11",
                    end: "2019-04-13"
                },
                {
                    title: "Bolognese",
                    start: "2019-04-12T10:30:00",
                    end: "2019-04-12T12:30:00"
                },
                {
                    title: "Panini",
                    start: "2019-04-12T12:00:00"
                },
                {
                    title: "Pizza",
                    start: "2019-04-12T14:30:00"
                },
                {
                    title: "Roasted Chicken",
                    start: "2019-04-12T17:30:00"
                },
                {
                    title: "Bagels",
                    start: "2019-04-12T20:00:00"
                },
                {
                    title: "Chips",
                    start: "2019-04-18T07:00:00"
                },
                {
                    title: "Click for Bon Apetit",
                    url: "http://www.bonappetit.com/",
                    start: "2019-04-28"
                }
            ],
            eventClick: function(calEvent) {
                swal({
                    title: calEvent.title,
                    icon: "success",
                });
            }
        });

    });
});
