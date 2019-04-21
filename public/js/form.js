
$(function(){

    $("#accordion").accordion();

    $(document).on("keypress",function(e) {
        if(e.which === 13) {
            $("#submit").click();
        }
    });

    $("#result").on("click", "#schedule", function(){
        if($(this).parent().parent().next().next("form").prop("hidden")){
            $(this).text("Cancel").css({"color":"red"});
            $(this).parent().parent().next().next("form").css({
                top:$("img").height(),
                width:$(".position").width(),
                height:"120px",
                "z-index":1000,
                "background-color":"rgb(48,48,48,1)"
            });

            $(this).parent().parent().next().next("form").prop("hidden", false);
            var date = new Date().toISOString().substr(0, 10);
            $("input[type=date]").val(date);
        }
        else{
            $(this).text("Schedule").css({"color":"white"});
            $(this).parent().parent().next().next("form").prop("hidden", true);
            $(this).parent().parent().next().next("form").css({
                "z-index":-1
            });
        }
    });

    $("#result").on("click", ".scheduleSubmit", function(event){
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

        date: $(this).parent().find(".date").val()
        };
        console.log(mealData.date);
        console.log(mealData.data.recipeURL);

        $.post("/api/calendar/", mealData)
        .then(function(res){
            console.log(res);
            // alert("Your recipe has been scheduled.");
            swal({
                title: "Yum!",
                text: "This recipe has been added to your schedule.",
                icon: "success",
                button: "Keep on cookin'!",
            });
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
});

$(function() {
    if($(".card-text li").length!==0){
        $("#click").click();
    }

    $(".infoCard").hide();

    $(document).on("mouseenter", ".card-img-top", function(){
        $(".infoCard").mouseleave();
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
                "z-index":-1
            },600,function(){
                thisElement.removeClass("animated");
            });
        }  
    });

    $(document).mousemove(function(event) {
        var currentMousePos = { x: -1, y: -1 };
        currentMousePos.x = event.pageX;
        currentMousePos.y = event.pageY;
        if($(".animated").parent().find("button").length!==0) {
            if(currentMousePos.y>$(".animated").parent().find("button").position().top) {
                $(".infoCard").mouseleave();
            }
        }
    });

    $(window).resize(function(){
        $(".infoCard").width($(".position").width()+1);
        $("#result form").width($(".position").width());
    });
});
