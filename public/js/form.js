
$(function(){

    $("#accordion").accordion();
    // $("#init").click();

    $(document).on("keypress",function(e) {
        if(e.which === 13) {
            $("#submit").click();
        }
    });

});

$("#result").on("click", "#schedule", function(){
    if($(this).next("form").prop("hidden")){

        $(this).next("form").prop("hidden", false);
        var date = new Date().toISOString().substr(0, 10);
        $("input[type=date]").val(date);
    }
    else{
        $(this).next("form").prop("hidden", true);
    }
});

$("#result").on("click", "#scheduleSubmit", function(event){
    event.preventDefault();

    var mealData = {data: {
        name: $(this).data("title"),
        image: $(this).data("image"),
        recipeURL: $(this).data("url"),
        servings: $(this).data("servings"),
        dietLabels: $(this).data("diet"),
        healthLabels: $(this).data("health"),
        ingredients: $(this).data("ingredients"),
        calories: $(this).data("calories"),
        time: $(this).data("time")
    },
    date: $(this).parents(".card-body").find(".date").val()
    };
    console.log(mealData.date);
    
    $.post("/api/calendar/", mealData)

        .then(function(res){
            console.log(res);
            alert("Your recipe has been scheduled.");

        });
});


$("#result").on("click", ".btn-favorite", function() {

    var url = $(this).data("url");
    var mealData = {
        name: $(this).data("title"),
        image: $(this).data("image"),
        servings: $(this).data("servings"),
        dietLabels: $(this).data("diet"),
        healthLabels: $(this).data("health"),
        ingredients: $(this).data("ingredients"),
        calories: $(this).data("calories"),
        time: $(this).data("time")
    };

    console.log(mealData);
    var favBtn = $(this);

    $.ajax("/api/meals", {
        method: "POST",
        data: {
            url: url,
            data: mealData,
            table: "favorite"
        }
    }).then(function(results){
        console.log(results);
        if(results.status === "not logged in") {
            localStorage.clear();
            localStorage.setItem(url, JSON.stringify(mealData));
            $("#loginModal").modal("show");
        }
        favBtn.children("i").toggleClass("fas far");
    });

});

$(function() {
    if($(".card-text li").length!==0){
        $("#click").click();
    }
});
