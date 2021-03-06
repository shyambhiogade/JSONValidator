$(function () {

    // set ace editor configuration 
    var editor = ace.edit("editor");
    //editor.setTheme("ace/theme/twilight");
    editor.session.setMode("ace/mode/json");
    editor.setOptions({
        fontSize: "10pt"
    });
    editor.setOption("showPrintMargin", false);

    // set the size 
    var setSizeForControl = function () {
        $("container").width((window.innerWidth - 16)+"px");
        $("#jsonContainer").height((window.innerHeight - $("#header").innerHeight() - $("#actionContainer").innerHeight()) + "px");        
        // set the layoutout 
        var jsonContainerWidth = window.innerWidth - 16;
        $("#jsonContainer").width(jsonContainerWidth);
        $("#copyRight").width(jsonContainerWidth);
        $("#NoteSection").width(jsonContainerWidth);

        var halfWidth = (jsonContainerWidth) / 2;
        $("#treePanel").css("width", halfWidth + "px");
        $("#jsonTextArea").css("width", halfWidth + "px");

        var splitter = $("#splitter");
        splitter.css("left", halfWidth + "px");
        splitter.height($("#treePanel").height());
        $("#editorContainer").height($("#treePanel").height()) //32 is the margine editor adds-its minus to remove the vertical scroll
        editor.resize();
    }

    setSizeForControl();

    $(window).resize(function () {
        setTimeout(function () { setSizeForControl(); }, 100);
    });

    var inputJSONObj = {
        "name": "John",
        "married": true,
        "age": 30,
        "cars": [
            { "name": "Ford", "models": ["Fiesta", "Focus", "Mustang"] },
            { "name": "BMW", "models": ["320", "X3", "X5"] },
            { "name": "Fiat", "models": ["500", "Panda"] }
        ]
    };

    var cookieData = document.cookie;
    if (cookieData) {
        try {
            inputJSONObj = JSON.parse(JSON.parse(cookieData));
        } catch (e) {
            console.warn("data in cookie is invalid json data.");
        }
    }

    editor.setValue(JSON.stringify(inputJSONObj, null, '\t'));

    var formatJSONData = function (firstTime) {
        try {
            //var inputjsonData = $("#jsonTextArea").val();
            var inputjsonData = editor.getValue();
            var outputJSONData = JSON.stringify(JSON.parse(inputjsonData), null, '  ');
            //$("#jsonTextArea").val(outputJSONData);
            editor.session.setMode("ace/mode/json");
            editor.setValue(outputJSONData);
            if (firstTime !== true) {
                showSnackbar(true);    
            }
            
        } catch (e) {
            showSnackbar();
        }
    };

    formatJSONData(true);

    var toggleTree = function (eventObject) {
        console.log(eventObject);
        var toggleEle = $(eventObject.target)
        var childList = toggleEle.closest("li").find("ul").first();
        var childListDisplayValue = childList.css("display");
        if (childListDisplayValue === "none") {
            toggleEle.removeClass("expand");
            toggleEle.addClass("collapse");
            childList.css("display", "");
            childList.find(".eachItem").attr("invisible", "false");
        } else {
            toggleEle.removeClass("collapse");
            toggleEle.addClass("expand");
            childList.css("display", "none");
            childList.find(".eachItem").attr("invisible", "true");
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
            if (value != null && typeofValue === "object") {
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
                } else if (value === null) {
                    typeSpecificClass = "nullSpan";
                    value = JSON.stringify(value);
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
            $(".eachItem").removeClass("itemSelected");
            $(event.currentTarget).addClass("itemSelected");
        });
    }

    var leftKeyPress = function () {
        var selectedItem = $(".itemSelected");
        var expandItem = selectedItem.find(".collapse");
        if (expandItem.length > 0) {
            var eventObject = {};
            eventObject.target = expandItem;
            toggleTree(eventObject);
        } else {
            var nextItemToSelect = selectedItem.closest("ul").closest("li").find(".eachItem").first();
            if (nextItemToSelect.length > 0) {
                selectedItem.removeClass("itemSelected");
                nextItemToSelect.addClass("itemSelected");
            }
        }
    }

    var rightKeyPress = function () {
        var selectedItem = $(".itemSelected");
        var expandItem = selectedItem.find(".expand")
        if (expandItem.length > 0) {
            var eventObject = {};
            eventObject.target = expandItem;
            toggleTree(eventObject);
        }
    }

    $("#jsonTextArea").focus(function () {
        $(".itemSelected").removeClass("itemSelected");
    });

    var moveSelectionUp = function () {
        var eachItemSelection = $(".eachItem").filter(function (index) {
            return $(this).attr("invisible") != "true";
        });
        var selectedItem = $(".itemSelected");
        var selectedItemIndex = eachItemSelection.index(selectedItem);
        if (selectedItemIndex >= 0) { // do arrow selection only if already one item selected.            
            if ((selectedItemIndex - 1) >= 0) {
                $(eachItemSelection[selectedItemIndex]).removeClass("itemSelected");
                $(eachItemSelection[selectedItemIndex - 1]).addClass("itemSelected");
                return true;
            }
        }
        return false;
    }

    var moveSelectionDown = function () {
        var eachItemSelection = $(".eachItem").filter(function (index) {
            return $(this).attr("invisible") != "true";
        });

        var selectedItem = $(".itemSelected");
        var selectedItemIndex = eachItemSelection.index(selectedItem);
        if (selectedItemIndex >= 0) { // do arrow selection only if already one item selected.            
            if ((eachItemSelection.length - 1) >= (selectedItemIndex + 1)) {
                $(eachItemSelection[selectedItemIndex]).removeClass("itemSelected");
                $(eachItemSelection[selectedItemIndex + 1]).addClass("itemSelected");
                return true;
            }
        }
        return false;
    }

    $(document).keydown(function (e) {
        switch (e.which) {
            case 37: // left
                leftKeyPress();
                break;

            case 38: // up
                isProcessed = moveSelectionUp();
                break;

            case 39: // right
                rightKeyPress();
                break;

            case 40: // down
                isProcessed = moveSelectionDown();
                break;

            default: return; // exit this handler for other keys
        }
    });

    var treeContainer = $("#treecontainer");
    var topJSONObj = { JSON: inputJSONObj };
    addTree(topJSONObj, treeContainer);

    $("#formatBtn").click(formatJSONData);

    $("#minifyBtn").click(function () {
        try {
            //var inputjsonData = $("#jsonTextArea").val();            
            var inputjsonData = editor.getValue();
            var outputJSONData = JSON.stringify(JSON.parse(inputjsonData));
            //$("#jsonTextArea").val(outputJSONData);
            editor.session.setMode("ace/mode/text");
            var session = editor.session;
            editor.getSession().setUseWrapMode(true);
            var inputjsonData = editor.setValue(outputJSONData);            
        } catch (e) {
            showSnackbar();
        }
    });

    $("#expandAllBtn").on("click", function () {
        $("#treecontainer").find("#topNode").find("ul").css("display", "");
        $("#treecontainer").find(".toggleTree").removeClass("expand").addClass("collapse");
    });

    $("#collapseAllBtn").on("click", function () {
        $("#treecontainer").find("#topNode").find("ul").css("display", "none");
        $("#treecontainer").find(".toggleTree").removeClass("collapse").addClass("expand");
    });

    function showSnackbar(validJSON) {
        $("#snackbar").addClass("show");
        if (validJSON === true) {
            $("#snackbar").addClass("successMsg");
            $("#snackbar").text("Valid JSON");

        } else {
            $("#snackbar").addClass("errorMsg");
            $("#snackbar").text("InValid JSON");
        }

        setTimeout(function () {
            $("#snackbar").removeClass("show");
        }, 3000);

    }

    $("#treeViewBtn").on("click", function () {
        $("#topNode").remove();
        firstTime = true;
        //var inputjsonData = $("#jsonTextArea").val();
        var inputjsonData = editor.getValue();
        try {
            var JSONObj = JSON.parse(inputjsonData);
            var topJSONObj = { JSON: JSONObj };
            addTree(topJSONObj, treeContainer);
        } catch (e) {
            showSnackbar();
        }
    });

    $('#jsonTextArea').bind('input propertychange', function () {
        //document.cookie = JSON.stringify($('#jsonTextArea').val());
        document.cookie = editor.getValue();

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
                editor.resize();
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