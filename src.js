$(function () {

    // set the size 
    var setSizeForControl = function () {
        $("#jsonContainer").height((window.innerHeight - $("#header").outerHeight() - $("#actionContainer").outerHeight()) + "px");
        $("#jsonContainer").width(window.innerWidth + "px");
        // set the layoutout 
        var jsonContainerWidth = $("#jsonContainer").width();
        $("#jsonContainer").width(jsonContainerWidth);
        var halfWidth = (jsonContainerWidth) / 2;
        $("#treePanel").css("width", halfWidth + "px");
        $("#jsonTextArea").css("width", halfWidth + "px");

        var splitter = $("#splitter");
        splitter.css("left", halfWidth + "px");
        splitter.height($("#treePanel").height());
    }

    var cookieName = "jsonviewerCookie";
    // Cookies
    function createCookie(name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";

        document.cookie = name + "=" + value + expires + "; path=/";
    }

    // read cookies
    function readCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    setSizeForControl();

    $(window).resize(function () {
        setTimeout(function () { setSizeForControl(); }, 100);
    });

    var inputJSONObj = {
        "name": "John",
        "married":true,
        "age": 30,
        "cars": [
            { "name": "Ford", "models": ["Fiesta", "Focus", "Mustang"] },
            { "name": "BMW", "models": ["320", "X3", "X5"] },
            { "name": "Fiat", "models": ["500", "Panda"] }
        ]
    };

    var cookieData = readCookie(cookieName);
    if (cookieData) {
        $("#jsonTextArea").val(cookieData);
    } else {
        $("#jsonTextArea").val(JSON.stringify(inputJSONObj));
    }    

    var formatJSONData = function () {
        var inputjsonData = $("#jsonTextArea").val();
        var outputJSONData = JSON.stringify(JSON.parse(inputjsonData), null, '  ');
        $("#jsonTextArea").val(outputJSONData);
    };

    formatJSONData();

    var toggleTree = function (eventObject) {
        console.log(eventObject);
        var toggleEle = $(eventObject.target)
        var childList = toggleEle.closest("li").find("ul").first();
        var childListDisplayValue = childList.css("display");
        if (childListDisplayValue === "none") {
            toggleEle.removeClass("expand");
            toggleEle.addClass("collapse");
            childList.css("display", "");
        } else {
            toggleEle.removeClass("collapse");
            toggleEle.addClass("expand");
            childList.css("display", "none");
        }
    }

    var firstTime = true;

    var addTree = function (jsonObj, parentNode) {
        if (firstTime) {
            parentNode.append("<ul id='topNode'></ul>");
            firstTime = false;
        } else {
            parentNode.append("<ul></ul>");
        }

        $.each(jsonObj, function (key, value) {
            var typeofValue = typeof (value)
            if (typeofValue === "object") {
                var objHtml = "<span class='toggleTree collapse inlineSpan'></span><span class='objectSpan'></span>";
                if (value.length) {
                    objHtml = "<span class='toggleTree collapse inlineSpan'></span><span class='arraySpan'></span>";
                }
                var spanEle = $(objHtml);                
                var parentUl = parentNode.find("ul").first();

                if (value === null) {
                    var listItem = $("<li>" + key + " : null" + "</li>");
                    spanEle = $("<span class='inlineSpan nullSpan'></span>");;
                    parentUl.append(listItem);
                    listItem.prepend(spanEle);
                } else {

                    var listItem = $("<li></li>");
                    var divItem = $("<div class='eachItem'>" + key + "</div>").prepend(spanEle);
                    parentUl.append(listItem);
                    listItem.append(divItem);
                    addTree(value, listItem);
                }
            } else {
                var typeSpecificClass = "";
                if (typeofValue === "string") {
                    typeSpecificClass = "stringSpan";
                } else if (typeofValue === "number") {
                    typeSpecificClass = "numberSpan";
                } else if (typeofValue === "boolean") {
                    typeSpecificClass = "booleanSpan";
                }
                parentNode.find("ul").first().append("<li><div class='eachItem'><span class='inlineSpan " + typeSpecificClass + "'></span>" + key + " : " + value + "</div></li>");
            }
        });
        
        // add toggle handler
        $(".toggleTree").off("click");
        $(".toggleTree").on("click", toggleTree);

        // add click selection
        $(".eachItem").off("click");
        $(".eachItem").on("click", function (event) {
            $(".eachItem").css("background-color", '');
            $(event.currentTarget).css("background-color", "#cce6ff");
        });
    }


    var treeContainer = $("#treecontainer");
    var topJSONObj = { JSON: inputJSONObj };
    addTree(topJSONObj, treeContainer);  

    $("#formatBtn").click(formatJSONData);

    $("#minifyBtn").click(function () {
        var inputjsonData = $("#jsonTextArea").val();
        var outputJSONData = JSON.stringify(JSON.parse(inputjsonData));
        $("#jsonTextArea").val(outputJSONData);
    });
       
    $("#expandAllBtn").on("click", function () {
        $("#treecontainer").find("#topNode").find("ul").css("display", "");
        $("#treecontainer").find(".toggleTree").removeClass("expand").addClass("collapse");
    });

    $("#collapseAllBtn").on("click", function () {
        $("#treecontainer").find("#topNode").find("ul").css("display", "none");
        $("#treecontainer").find(".toggleTree").removeClass("collapse").addClass("expand");
    });
    
    $("#treeViewBtn").on("click", function () {
        $("#topNode").remove();
        firstTime = true;
        var inputjsonData = $("#jsonTextArea").val();
        var JSONObj = JSON.parse(inputjsonData);
        var topJSONObj = { JSON: JSONObj };
        addTree(topJSONObj, treeContainer);
    });

    $('#jsonTextArea').bind('input propertychange', function () {
        createCookie(cookieName, $('#jsonTextArea').val(), 360);
    });

    // add splitter - container.
    var splitter = $("#splitter");
    splitter.css("left", splitter.position().left);
    splitter.height(splitter.height());
    splitter.css("position", "absolute");
    var jsonTextArea = $("#jsonTextArea");
    var treePanel = $("#treePanel");
    var jsonContainer = $("#jsonContainer");

    var isDragging = false;
    var downpageX = 0;
    splitter.mousedown(function (event) {
        downpageX = event.pageX;
        isDragging = true;
    });

    jsonContainer.mousemove(function (event) {
        // min
        var minWidthAllowedForInnerContainer = 100;
        var innerContainerMargin = 5;
        if (isDragging && event.pageX > minWidthAllowedForInnerContainer &&
            ((jsonContainer.width() - event.pageX) > minWidthAllowedForInnerContainer)) {
            jsonTextArea.css("cursor", "col-resize");
            treePanel.css("cursor", "col-resize");
            var distance = event.pageX - downpageX;            
            if (distance !== 0) {
                splitter.css("left", event.pageX + 2 + "px");
                var treePanelWidth = jsonContainer.width() - event.pageX - innerContainerMargin;
                jsonTextArea.css("width", event.pageX - innerContainerMargin + "px");
                treePanel.css("width", treePanelWidth + "px");
            }
        } else {
            jsonTextArea.css("cursor", "default");
            treePanel.css("cursor", "default");
        }
    }).mouseup(function () { isDragging = false; }).mouseleave(function () {
        isDragging = false;
    });

    // end- add splitter - container.
});