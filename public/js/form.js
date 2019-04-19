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
    var spaceNumber;
    var testArray=[];

    if($(".card-text li").length!==0){
        numberCard=$(".card").length;
        spaceNumber=parseInt(numberCard/3)+(numberCard%3===0?0:1);
        //$("#result").height(($(".card").height()+30)*spaceNumber+"px");
        $("#click").click();
    }

    $(".card-text").hide();

    $(window).resize(function(){
        if($(".card").hasClass("open")) {
            $(".card").removeClass("open");
        }
        if($(".card").hasClass("animated")) {
            $(".card").removeClass("animated");
        }
        $(".card-text").hide();
        $(".card").height($(".card img").height()+$(".card-title").height()+80+"px");
        $("#result").height(($(".card").height()+30)*spaceNumber+"px");
    });

    $(document).on("click", ".card", function(){
        if(!$(this).hasClass("open")&&!$(this).hasClass("animated")) {
            console.log("여기");
            $(this).addClass("open");
            $(this).children(".card-body").children(".card-text").show();
            var addHeight=$(".card-body").height();
            addHeight=1000;
            var rowNumber=$(this).children("input").val()%spaceNumber;
            if(testArray.indexOf(rowNumber)<0) {
                testArray.push(rowNumber);
                $("#result").css({"height":"+="+addHeight+"px"});
            }     
            $(this).animate({"height":"+="+addHeight+"px"}, 1000,function(){
                $(this).addClass("animated");
            });
        } else if($(this).hasClass("open")&&$(this).hasClass("animated")) {
            console.log("여기2");
            $(this).removeClass("open");
            $(this).children(".card-body").children(".card-text").hide();
            var addHeight=$(".card-body").children().not(".card-title").height();
            addHeight=1000;
            var rowNumber=$(this).children("input").val()%spaceNumber;
            if(testArray.indexOf(rowNumber)>=0) {
                testArray.pop(rowNumber);
                $("#result").css({"height":"-="+addHeight+"px"});
            }     
            $(this).animate({"height":"-="+addHeight+"px"}, 500,function(){
                $(this).removeClass("animated");
            });
        }
    });
});