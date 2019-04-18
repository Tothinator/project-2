$(document).ready(function() {
    $.get("/api/calendar/").then(function({ Meals }){
        var eventArray = [];

        for(var i = 0; i < Meals.length; i++){
            var event = {
   
                title: Meals[i].name,
                url: Meals[i].recipeLink,
                start: Meals[i].Day.date,
                end: Meals[i].Day.date
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
 
                // $.ajax({
                //     url:"update.php",
                //     type:"POST",
                //     data:{title:title, start:start, end:end, id:id},
                //     success:function(){
                //         calendar.fullCalendar("refetchEvents");
                //         alert("Event Update");
                //     }
                // })
            },
     
            eventDrop:function(event)
            {
                console.log(event);
                var start = $.fullCalendar.formatDate(event.start, "Y-MM-DD HH:mm:ss");
                var end = $.fullCalendar.formatDate(event.end, "Y-MM-DD HH:mm:ss");
                var title = event.title;
                var id = event.id;
                console.log(start)
                console.log(end)
                console.log(title)
                // $.ajax({
                //     url:"/api/calendar",
                //     type:"PUT",
                //     data:{title:title, start:start, end:end, id:id},
                //     success:function()
                //     {
                //         calendar.fullCalendar("refetchEvents");
                //         alert("Event Updated");
                //     }
                // });
            },
     
            eventClick:function(event)
            {
                if(confirm("Are you sure you want to remove it?"))
                {
                    var id = event.id;
                    // $.ajax({
                    //     url:"/api/calendar/",
                    //     type:"DELETE",
                    //     data:{id:id},
                    //     success:function()
                    //     {
                    //         calendar.fullCalendar("refetchEvents");
                    //         alert("Event Removed");
                    //     }
                    // });
                }
            },
     
        });
    });



    
});