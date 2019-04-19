


$(document).ready(function() {
  
    
    //Getting scheduled meals from database
    $.get("/api/calendar/").then(function(results){
        console.log(results);
        var eventArray = [];

        for(var i = 0; i < results.length; i++){

            var data = {
                id: results[i].id,
                date: results[i].date,
                title: results[i].Meal.name,
                url: results[i].Meal.recipeURL
            };
            eventArray.push(data);
        }

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
        
                var newStart = $.fullCalendar.formatDate(event.start, "Y-MM-DD HH:mm:ss");

                // if(event.end){
                //     var newEnd = $.fullCalendar.formatDate(event.end, "Y-MM-DD HH:mm:ss");
                // }else{
                //     var newEnd = newStart;
                // }
                
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
            },
        
        });

        $(".delete").on("click", function(e){
            e.preventDefault();
            var id = $(this).data("id");
            console.log(id);
            $.ajax({
                url:"/api/calendar",
                type:"DELETE",
                data:{id:id},
                success:function(res)
                {
                    console.log(res);
                    window.location.reload();
                    
    
                }
    
            });
        });

        $(".favorite").on("click", function(e){
            e.preventDefault();
            var MealId = $(this).data("mealid");
            $.ajax({
                url:"/api/favorites",
                type:"POST",
                data:{MealId:MealId},
                success:function(res)
                {
                    console.log(res);
                    window.location.reload();
                    
    
                }
    
            });
        });

    });


});