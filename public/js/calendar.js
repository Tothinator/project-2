$(document).ready(function() {
    $.get("/api/calendar/").then(function(results){
        console.log(results);
        var eventArray = [];

        for(var i = 0; i < results.length; i++){

            var data = {
                id: results[i].id,
                start: results[i].startDate,
                end: results[i].endDate,
                title: results[i].Meal.name,
                url: results[i].Meal.recipeURL
            };
            eventArray.push(data);
        }


        // console.log(eventArray);

        var calendar = $("#calendar").fullCalendar({
            editable:true,
            header:{
                left:"prev, next today",
                center:"title",
                right:"month,agendaWeek,agendaDay"
            },
            events: eventArray,
            selectable:true,
            selectHelper:true,
            editable:true,
            eventDrop:function(event)
            {
                console.log(event);
                var start = $.fullCalendar.formatDate(event.start, "Y-MM-DD HH:mm:ss");
                var end = $.fullCalendar.formatDate(event.end, "Y-MM-DD HH:mm:ss");
                var title = event.title;
                var id = event.id;
                $.ajax({
                    url:"/api/calendar",
                    type:"PUT",
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
            //      $.ajax({
            //       url:"delete.php",
            //       type:"POST",
            //       data:{id:id},
            //       success:function()
            //       {
            //        calendar.fullCalendar('refetchEvents');
            //        alert("Event Removed");
            //       }
            // })
        }
    }
        
    });



    
});
