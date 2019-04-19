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
            window.location.replace("/");
        }
    });
});


$(function() {
    var numberCard;
    //var spaceNumber;
    //var testArray=[];

    if($(".card-text li").length!==0){
        numberCard=$(".card").length;
        spaceNumber=parseInt(numberCard/3)+(numberCard%3===0?0:1);
        $("#click").click();
    }

    $(".infoCard").hide();

    $(document).on("mouseenter", ".card-img-top", function(){
        var saveElement=$(this).parent().next();
        if(!$(this).parent().next().hasClass("animated")) {
            $(this).parent().next().show();
            $(this).parent().next().not(":animated").animate({
                top:0,
                width:$(this).parent().width()+1,
                "z-index":1000,
                "background-color":"rgb(48,48,48,0.8)"
            },600,function(){
                saveElement.addClass("animated");
            });
        } 
    });

    $(document).on("mouseleave", ".infoCard", function(){ 
        var thisElement=$(this);
        if($(this).hasClass("animated")) {
            $(this).hide();
            $(this).not(":animated").animate({
                "z-index":10
            },600,function(){
                thisElement.removeClass("animated");
            });
        }  
    });
});