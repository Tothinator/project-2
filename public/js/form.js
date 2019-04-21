$(function(){

    var calendarEL = $("#calendar");

    var calendar = newCalendar(calendarEL, "month", false, "month,basicWeek");

    calendar.dateClick = function(info) {
        var date = info.dateStr;
        console.log(date);
        $("#schduleDate").val(date);
    };

    $("#accordion").accordion();

    $(document).on("keypress",function(e) {
        if(e.which === 13) {
            $("#submit").click();
        }
    });

    $("#result").on("click", ".calendarShow", function(){

        var that = $(this);

        $.get("/api/user_data").then(function (user) {

            if (!user.username){
                $("#loginModal").modal("show");
            } else {
                $("#scheduleWithModal").text("When do you want to cook " + that.data("title"));

                $("#scheduleSubmit")
                    .attr("title", that.data("title"))
                    .attr("image", that.data("image"))
                    .attr("url", that.data("url"))
                    .attr("servings", that.data("servings"))
                    .attr("diet", that.data("diet"))
                    .attr("health", that.data("health"))
                    .attr("ingredients", that.data("ingredients"))
                    .attr("calories", that.data("calories"))
                    .attr("time", that.data("time"));

                $("#calendarModal").modal("show");

                console.log(scheduleData);
            }
        });

    });

    $("#scheduleSubmit").on("click", function(event){
        event.preventDefault();

        var mealData = {
            data: {
                name: $("#scheduleSubmit").attr("title"),
                image: $("#scheduleSubmit").attr("image"),
                recipeURL: $("#scheduleSubmit").attr("url"),
                servings: $("#scheduleSubmit").attr("servings"),
                dietLabels: $("#scheduleSubmit").attr("diet"),
                healthLabels: $("#scheduleSubmit").attr("health"),
                ingredients: $("#scheduleSubmit").attr("ingredients"),
                calories: $("#scheduleSubmit").attr("calories"),
                time: $("#scheduleSubmit").attr("time")
            },

            date: $("#scheduleDate").val()
        };
        console.log(mealData.date);
        console.log(mealData);

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
                window.location.reload();
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
        $("#result form").css({top:$("img").height()});
    });

});

