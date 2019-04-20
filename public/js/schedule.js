$(document).ready(function() {

    newCalendar("month");

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