$(document).ready(function() {
    $.get("/api/calendar/").then(function({ Meals }){
        console.log(Meals)
        var eventArray = [];

        for(var i = 0; i < Meals.length; i++){
            var event = {
                title: Meals[i].name,
                url: Meals[i].recipeLink,
                start: Meals[i].Day.date
            }
            eventArray.push(event)
        }

        var calendar = $("#calendar").fullCalendar({
            editable:true,
            header:{
                left:"prev,next today",
                center:"title",
                right:"month,agendaWeek,agendaDay"
            },
            events: eventArray,
            selectable:true,
            selectHelper:true,
            select: function(start, end, allDay)
            {
                var title = prompt("Enter Event Title");
                if(title)
                {
                    var start = $.fullCalendar.formatDate(start, "Y-MM-DD HH:mm:ss");
                    var end = $.fullCalendar.formatDate(end, "Y-MM-DD HH:mm:ss");
                    $.ajax({
                        url:"insert.php",
                        type:"POST",
                        data:{title:title, start:start, end:end},
                        success:function()
                        {
                            calendar.fullCalendar("refetchEvents");
                            alert("Added Successfully");
                        }
                    })
                }
            },
            editable:true,
            eventResize:function(event)
            {
                var start = $.fullCalendar.formatDate(event.start, "Y-MM-DD HH:mm:ss");
                var end = $.fullCalendar.formatDate(event.end, "Y-MM-DD HH:mm:ss");
                var title = event.title;
                var id = event.id;
                $.ajax({
                    url:"update.php",
                    type:"POST",
                    data:{title:title, start:start, end:end, id:id},
                    success:function(){
                        calendar.fullCalendar("refetchEvents");
                        alert("Event Update");
                    }
                })
            },
     
            eventDrop:function(event)
            {
                console.log(event);
                var start = $.fullCalendar.formatDate(event.start, "Y-MM-DD HH:mm:ss");
                var end = $.fullCalendar.formatDate(event.end, "Y-MM-DD HH:mm:ss");
                var title = event.title;
                var id = event.id;
                $.ajax({
                    url:"update.php",
                    type:"POST",
                    data:{title:title, start:start, end:end, id:id},
                    success:function()
                    {
                        calendar.fullCalendar("refetchEvents");
                        alert("Event Updated");
                    }
                });
            },
     
            eventClick:function(event)
            {
                if(confirm("Are you sure you want to remove it?"))
                {
                    var id = event.id;
                    $.ajax({
                        url:"delete.php",
                        type:"POST",
                        data:{id:id},
                        success:function()
                        {
                            calendar.fullCalendar("refetchEvents");
                            alert("Event Removed");
                        }
                    });
                }
            },
     
        });
    });



    
});

// [
//     {
//         title: "Spaghetti",
//         start: "2019-04-01",
//         backgroundColor:"red"
//     },
//     {
//         title: "Pasta",
//         start: "2019-04-07",
//         end: "2019-04-10",
//         backgroundColor:"green"
//     },
//     {
//         id: 999,
//         title: "Pizza",
//         start: "2019-04-09T16:00:00"
//     },
//     {
//         id: 999,
//         title: "Macaroni",
//         start: "2019-04-16T16:00:00"
//     },
//     {
//         title: "Roast Beef",
//         start: "2019-04-11",
//         end: "2019-04-13"
//     },
//     {
//         title: "Bolognese",
//         start: "2019-04-12T10:30:00",
//         end: "2019-04-12T12:30:00"
//     },
//     {
//         title: "Panini",
//         start: "2019-04-12T12:00:00"
//     },
//     {
//         title: "Pizza",
//         start: "2019-04-12T14:30:00"
//     },
//     {
//         title: "Roasted Chicken",
//         start: "2019-04-12T17:30:00"
//     },
//     {
//         title: "Bagels",
//         start: "2019-04-12T20:00:00"
//     },
//     {
//         title: "Chips",
//         start: "2019-04-18T07:00:00"
//     },
//     {
//         title: "Click for Bon Apetit",
//         url: "http://www.bonappetit.com/",
//         start: "2019-04-28"
//     }
// ]