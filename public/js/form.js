$(function(){
    $("#accordion").accordion();
    // $("#init").click();

    $(document).on("keypress",function(e) {
        if(e.which === 13) {
            $("#submit").click();
        }
    });

});

$("#result").on("click", ".btn-favorite", function() {

    var mealData = {
        name: $(this).data("title"),
        image: $(this).data("image"),
        servings: $(this).data("servings"),
        dietLabels: $(this).data("diet"),
        healthLabels: $(this).data("health"),
        ingredients: $(this).data("ingredients"),
        calories: $(this).data("calories"),
        time: $(this).data("time"),
    };

    console.log(mealData);

    $.ajax("/api/meals", {
        method: "POST",
        data: {
            url: $(this).data("url"),
            data: mealData,
            table: "favorite"
        }
    }).then( function(results){
        console.log(results);
        if(results.status === "not logged in") {
            $("#loginModal").modal("show");
        }
    });
});

$(function() {
    if($(".card-text li").length!==0){
        $("#click").click();
    }
});
