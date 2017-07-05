$(function () {

    var inputJSONObj = { "glossary": { "title": "example glossary", "GlossDiv": { "title": "S", "GlossList": { "GlossEntry": { "ID": "SGML", "SortAs": "SGML", "GlossTerm": "Standard Generalized Markup Language", "Acronym": "SGML", "Abbrev": "ISO 8879:1986", "GlossDef": { "para": "A meta-markup language, used to create markup languages such as DocBook.", "GlossSeeAlso": ["GML", "XML"] }, "GlossSee": "markup" } } } } }
    $("#jsonTextArea").val(JSON.stringify(inputJSONObj));

    // set the layoutout 
    var jsonContainerWidth = $("#jsonContainer").width();
    var halfWidth = jsonContainerWidth / 2;
    $("#treePanel").css("width", halfWidth + "px");
    $("#jsonTextArea").css("width", halfWidth + "px");

    var formatJSONData = function () {
        var inputjsonData = $("#jsonTextArea").val();
        var outputJSONData = JSON.stringify(JSON.parse(inputjsonData), null, '  ');
        $("#jsonTextArea").val(outputJSONData);
    };

    formatJSONData();

    var toggleTree = function (eventObject) {
        console.log(eventObject);
        var toggleEle = $(eventObject.target)
        var childList = toggleEle.parent().find("ul").first();
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
                var spanEle = $("<span class='toggleTree collapse inlineSpan'></span><span class='objectSpan'></span>");
                spanEle.on("click", toggleTree);
                var parentUl = parentNode.find("ul").first();

                if (value === null) {
                    var listItem = $("<li>" + key + " : null" + "</li>");
                    spanEle = $("<span class='inlineSpan nullSpan'></span>");;
                    parentUl.append(listItem);
                    listItem.prepend(spanEle);
                } else {
                    var listItem = $("<li>" + key + "</li>");
                    parentUl.append(listItem);
                    listItem.prepend(spanEle);
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
                parentNode.find("ul").append("<li><span class='inlineSpan " + typeSpecificClass + "'></span>" + key + " : " + value + "</li>");
            }
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

    $("#showTreeViewBtn").on("click", function () {
        $("#treeView").css("display", "block");
        $("#textView").css("display", "none");
    });

    $("#showTextViewBtn").on("click", function () {
        $("#treeView").css("display", "none");
        $("#textView").css("display", "block");
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
    var downScreenX = 0;
    splitter.mousedown(function (event) {
        downScreenX = event.screenX;
        isDragging = true;
    });

    jsonContainer.mousemove(function (event) {
        if (isDragging && event.screenX > 100 & ((jsonContainer.width() - event.screenX) > 100)) {
            jsonTextArea.css("cursor", "col-resize");
            treePanel.css("cursor", "col-resize");
            var distance = event.screenX - downScreenX;
            var newLeft = (splitter.position().left + distance);
            splitter.css("left", event.screenX + 2 + "px");
            var treePanelWidth = jsonContainer.width() - event.screenX - 5;
            jsonTextArea.css("width", event.screenX - 5 + "px");
            treePanel.css("width", treePanelWidth + "px");
        } else {
            jsonTextArea.css("cursor", "default");
            treePanel.css("cursor", "default");
        }
    }).mouseup(function () { isDragging = false; }).mouseleave(function () {
        isDragging = false;
    });

    // end- add splitter - container.
});