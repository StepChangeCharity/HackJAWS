var Accessibility = function () {
    // 17 = ctrl, 38 = up arrow, 40 = down arrow, 48 = 0 key
    var map = { 17: false, 38: false, 40: false, 48: false };

    function setGridInputTitleForAccessibility(tblIndex, headers) {
        // loop through all text inputs and comboboxes in datagrid and add label text to control title attribute
        $(".datagrid:eq(" + tblIndex + ") input[type='text'], .datagrid:eq(" + tblIndex + ") select").each(function () {
            var ctrlId = $(this).attr("id");
            var row = $(this).parent().parent().children();
            var cell = $(this).parent();
            var ctrlIndex = row.index(cell);

            var container = ctrlId.split("_").slice(0, 2).join("_") + "_iTitle";
            $(this).attr("aria-label", $("#" + container).text() + headers[ctrlIndex]);
			//createLabel(ctrlId, $("#" + container).text() + headers[ctrlIndex]);
			
        });
        // loop through all radio inputs in datagrid and add label text to control title attribute
        $(".datagrid:eq(" + tblIndex + ") .radiobuttongroup").each(function () {
            // get radio ctrl name
            var groupId = $(this).attr("id");
            // example id = dgQuestions_ctl08_iRadList_Col0
            var labelId = groupId.split('_').slice(0, 2).join('_');
            // find label
            // var labelText = $("#" + labelId + "_iTitle").text();

            // loop through radio controls
            $(this).find("input[type='radio']").each(function () {
                var lbl = $(this).next("label");
                if (lbl != undefined) {
                    lbl.attr("id", $(this).attr("id") + "-label");
                }
                $(this).attr("aria-labelledby", labelId + "_iTitle " + $(this).attr("id") + "-label");
            });
        });
    }
	
	function createLabel(ctrlId, labelText) {
		var label = document.createElement("LABEL");
		var textNode = document.createTextNode(labelText);
		label.appendChild(textNode);
		label.setAttribute("for", ctrlId);
		label.style.position = "absolute";
		label.style.left = "-1000px";
		document.body.appendChild(label);
	}
	
	function initYourDetailsAccessibility() {
		addAddressFinderEventListener();
		
		// set focus on t&c checkbox when loaded if not checked - otherwise focus on first control
		if (document.getElementById("chkTsAndCs").checked) {
			$("#ddlSoleOrJoint").focus();
		} else {
			$("#chkTsAndCs").focus();
		}

        makeReferralSourceAccessible();
	}
	
	// add event listener to alert user that address finder has opened
	function addAddressFinderEventListener() {
		var btn = document.getElementById("ibtnPostcode");
		if (btn.addEventListener) {
			btn.addEventListener("click", function() { addAddressFinderInterval(); });
		} else {
			btn.attachEvent("onclick", function() { addAddressFinderInterval(); });
		}
	}
	
	function addAddressFinderInterval() {
		var interval = setInterval(function () {
			if ($("#lstPossibleAddresses")) {
				// $("<p id=\"addressFinderNotification\" role=\"alert\">Address Finder</p>").css("position", "absolute").css("left", "-3000px").appendTo($("#modalContainer"));
				
                $("#modalContainer h1").attr("id", "address-finder");
				// set accessKey for modal buttons
				var modal = document.getElementById("modalContainer");
				var buttons = modal.getElementsByTagName("input");
                modal.setAttribute("role", "dialog");
                modal.setAttribute("aria-label", "Address Finder")
                modal.setAttribute("aria-describedby", "address-finder");
				for (var i = 0; i < buttons.length; i++) {
					if (buttons[i].getAttribute("alt") === "select address") {
                        buttons[i].setAttribute("alt", buttons[i].getAttribute("alt") + " (e)");
						buttons[i].accessKey = "e";
					}
					if (buttons[i].getAttribute("alt") === "cancel") {
                        buttons[i].setAttribute("alt", buttons[i].getAttribute("alt") + " (c)");
						buttons[i].accessKey = "c";
					}
				}
				// focus on list of addresses
				$("#lstPossibleAddresses").focus();
				clearInterval(interval);
			}
			
		}, 1000);
	}

    function makeAutoCompleteAccessible(ctrl, idx) {
		var txtField = document.getElementById(ctrl);
		var sourceList = $(".ac_results2:eq(" + idx + ")");
            txtField.parentNode.setAttribute("role", "application");
            txtField.setAttribute("role", "combobox");
		// add aria attributes
		if (sourceList != undefined) {
			sourceList.attr("id", "src-autosuggestion-" + idx);
			sourceList.attr("role", "listbox");
            sourceList.attr("aria-expanded", false);
		}
        txtField.setAttribute("aria-autocomplete", "list");
		// refSrc.setAttribute("aria-expanded", "false");
		txtField.setAttribute("aria-owns", "src-autosuggestion-" + idx);
		txtField.attachEvent("onkeydown", function() {
				if (sourceList != undefined) {
					if (sourceList.css("display") != "none") {
                        // loop through items
						sourceList.find("li").each(function(i) {
							// assign identifier
							$(this).attr("id", "src-item-" + idx + "-" + i);
                            $(this).attr("aria-label", $(this).text());
                            $(this).attr("role", "listitem");
						});
		                sourceList.attr("aria-expanded", true);
                    }
				}
		});
        txtField.attachEvent("onkeyup", function(e) {
            e = e || event; // ie
            // up or down
            if (e.keyCode == 38 || e.keyCode == 40) {
                // set anything with class of ac_over to aria-activedescendant
                sourceList.find(".ac_over").each(function() {
                    txtField.setAttribute("aria-activedescendant", $(this).attr("id"));
                });
            }
        });
    }

    function makeReferralSourceAccessible() {
        makeAutoCompleteAccessible("txtReferralSource", 0);
    }

    // search results will be loaded on page load
    function countSearchResults() {
        if ($("#lstMatchingClients option").length > 1) {
            $("#lstMatchingClients").focus();
        } else {
            $("#txtClientNumber").focus();
        }
    }

    function initAssessmentAccessibility() {
        // apply title to radio buttons
        $("input[type='radio']").each(function() {
            var label = $(this).parent().parent().parent().find(".qaqCol1").text();
            $(this).attr("title", label);
        });
		$("form:first *:input[type!=hidden]:first").focus();
    }

    function initClientSearchAccessibility() {

        $("#lstMatchingClients").parent().prev().attr("id", "searchListTitle");
        $("#lstMatchingClients").attr("aria-labelledby", "searchListTitle");

        countSearchResults();
    }

    function initAboutYouAccessibility() {
        var headers = ["", "", ""];
        setGridInputTitleForAccessibility(0, headers);

        document.getElementById('chkCorrect').setAttribute("title", $("#labBudgetSummary").text().replace("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;", ""));
        document.getElementById('chkCorrect').setAttribute("tabIndex", 10);
		document.getElementById('chkCorrect').accessKey = "c";
		
		$("form:first *:input[type!=hidden]:first").focus();
    }

    function initDPAVerficationAccessibility() {
        var chkConfirmed = document.getElementById("chkClientConfirmed");
        var lblConfirmed = document.getElementById("chkClientConfirmedText");
        if (chkConfirmed != undefined) { chkConfirmed.setAttribute("accessKey", "c"); }
        if (lblConfirmed != undefined) { lblConfirmed.setAttribute("for", "chkClientConfirmed"); }
    }

    function initYourIncomeAccessibility() {
        var headers = ["", "", " amount", " frequency", " comment"];
        setGridInputTitleForAccessibility(0, headers);
    }

    function initPriorityAccessibility() {
        var headers = [
            "", "", " regular payment", " frequency",
            " in arrears?", " agreed?", " in arrears?", " balance",
            " ownership of debt", " organisation", " total arrears",
            " AIP", " comment", " arrears term", " balance / owner"
        ];
        setGridInputTitleForAccessibility(0, headers);
		
		$("form:first *:input[type!=hidden]:first").focus();
		
		// add additional access keys
		var wbcalc = document.getElementById("wbcalc");
		var creditReport = document.getElementById("navMain_btnPos3");
		wbcalc.setAttribute("alt", wbcalc.getAttribute("alt") + "(w)");
		wbcalc.setAttribute("title", wbcalc.getAttribute("title") + "(w)");
		wbcalc.accessKey = "w";
		if (creditReport.getAttribute("alt") === "credit report") {
			creditReport.setAttribute("alt", creditReport.getAttribute("alt") + "(c)");
			creditReport.setAttribute("title", creditReport.getAttribute("title") + "(c)");
			creditReport.accessKey = "c";
		}
    }

    function initExpenseAccessibility() {
        var headers = ["", "", " regular payment", " frequency", " name or comment", " balance", " ownership of debt"];
        setGridInputTitleForAccessibility(0, headers);
    }

    function initDebtsAccessibility() {
        var headers = [
            "Creditor Name", "Account Number", "Comment",
            "Debt Type", "Ownership of Debt", "Outstanding Balance",
            "Contractual Payment", "Status", "Delete"
        ];
        setGridInputTitleForAccessibility(0, headers);

        // add accesskey
        $("#DTDebtTransferred input[type='radio']:eq(0)").attr("accessKey", "c");
        // associate label with control
        $("#DTDebtTransferred input[type='radio']:eq(0)").parent().parent().parent().prev().attr("id", "rdMissedPayment");
        $("#DTDebtTransferred input[type='radio']:eq(0)").attr("aria-labelledby", "rdMissedPayment")
        $("#DTDebtTransferred input[type='radio']:eq(1)").attr("aria-labelledby", "rdMissedPayment")

        $(".creditorASB").each(function(idx) {
            var ctrlId = $(this).attr("id");
            makeAutoCompleteAccessible(ctrlId, idx);
        });
		$("form:first *:input[type!=hidden]:first").focus();
    }

    function initBudgetAccessibility() {
        var headers = ["", " Amount", " Comment"];
        setGridInputTitleForAccessibility(0, headers);

        setGridInputTitleForAccessibility(1, headers);

        initCustomAccessKeys();
		$("form:first *:input[type!=hidden]:first").focus();
    }

    function initAssetsAccessibility() {
        var propertyHeaders = [
            "Property Type", "Estimated Value", "Mortgage Remaining", "Secured Loan Remaining",
            "Charging/Inhibition order remaining", "Equity", "Ownership"
        ];
        var otherHeaders = ["Asset Type", "Estimated Value", "Ownership"];
        setGridInputTitleForAccessibility(0, propertyHeaders);
        setGridInputTitleForAccessibility(1, otherHeaders);
        setGridInputTitleForAccessibility(2, ["", ""]);
        setGridInputTitleForAccessibility(3, ["", ""]);

		$("form:first *:input[type!=hidden]:first").focus();
    }

    function initDisabledRadioTabIndexes() {
        // find disabled controls and set tabindex to -1
        $(".datagrid:eq(2) .radiobuttongroup input[type='radio']").each(function () {
            $(this).attr("tabindex", -1);
        });
    }

    function addAlertNotification(identifier, message) {
        $("#" + identifier).remove();
		$("<p id=\"" + identifier + "\" role=\"alert\">" + message + "</p>").css("position", "absolute").css("left", "-3000px").appendTo(document.body);
        //$("#container").append($("<p id=\"" + identifier + "\">" + message + "</p>").attr("role", "alert").css("position", "absolute").css("left", "-3000px"));
    }

    function setInputsToZero() {
        $(".datagrid input[type='text']").each(function() {
            var ctrlId = $(this).attr("id");
            var row = $(this).parent().parent().children();
            var cell = $(this).parent();
            var ctrlIndex = row.index(cell);

            // if first column of inputs
            if (ctrlId.indexOf("_Col0") > -1 && ctrlIndex === 2) {
                if ($(this).val() === "" && $(this).attr("disabled") === false) {
                    $(this).val(0);
                    $(this).blur();
                }
            }
        });
    }

    function focusOnNextActiveRowInput(elem) {
        var nextElem = $(elem).closest("tr").next().find("input[type='text']");
        if (nextElem.attr("disabled") === "disabled" || nextElem.attr("disabled") === true) {
            focusOnNextActiveRowInput(nextElem);
        } else {
            // hack since nextElem.focus() didn't work as expected
            var id = nextElem.attr("id");
            $("#" + id).focus();
            //nextElem.focus();
        }
    }

    function focusOnPreviousActiveRowInput(elem) {
        var prevElem = $(elem).closest("tr").prev().find("input[type='text']");
        if (prevElem.attr("disabled") === "disabled" || prevElem.attr("disabled") === true) {
            focusOnPreviousActiveRowInput(prevElem);
        } else {
            // hack since prevElem.focus() didn't work as expected
            var id = prevElem.attr("id");
            $("#" + id).focus();
            //prevElem.focus();
        }
    }

	// helps when used on pages with a data grid
    function initCustomAccessKeys() {

        $(".datagrid input[type='text'], .datagrid select").keydown(function (e) {
            e = e || event; // ie
            if (e.keyCode in map) {
                map[e.keyCode] = true;
                if (map[17] && map[40]) {
                    focusOnNextActiveRowInput(this);
                }
                if (map[17] && map[38]) {
                    focusOnPreviousActiveRowInput(this);
                }
                if (map[17] && map[48]) {
                    setInputsToZero();
                }
            }
        }).keyup(function (e) {
            e = e || event; // ie
            if (e.keyCode in map) {
                map[e.keyCode] = false;
            }
        });
    }
	
	function initButtonAccessKeys() {        
		var btnOne = document.getElementById("navMain_btnPos1");
		var btnTwo = document.getElementById("navMain_btnPos2");
		var btnThree = document.getElementById("navMain_btnPos3");
		var btnFour = document.getElementById("navMain_btnPos4");
		var btnFive = document.getElementById("navMain_btnPos5");
		var btnSix = document.getElementById("navMain_btnPos6");
		var btnSeven = document.getElementById("navMain_btnPos7");
        if (btnOne != undefined) {
            if (btnOne.getAttribute("alt") === "tpp client") {
                setAccessKey(btnOne, "t");
            }
        }
        if (btnTwo != undefined) {
            if (btnTwo.getAttribute("alt") === "notes") {
                setAccessKey(btnTwo, "o");
            } else if (btnTwo.getAttribute("alt") === "user settings") {
                setAccessKey(btnTwo, "u");
            }
        }
        if (btnThree != undefined) {
            if (btnThree.getAttribute("alt") === "business budget") {
                setAccessKey(btnThree, "u");
            } else if (btnThree.getAttribute("alt") === "credit report") {
                setAccessKey(btnThree, "r");
            }
        }
        if (btnFour != undefined) {
            if (btnFour.getAttribute("alt") === "back") {
                setAccessKey(btnFour, "b");
            } else if (btnFour.getAttribute("alt") === "logout") {
                setAccessKey(btnFour, "l");
            }
        }
        if (btnFive != undefined) {
            if (btnFive.getAttribute("alt") === "save") {
                setAccessKey(btnFive, "s");
            } else if (btnFive.getAttribute("alt") === "assessment") {
                setAccessKey(btnFive, "a");
            } else if (btnFive.getAttribute("alt") === "existing client") {
                setAccessKey(btnFive, "c");
            }
        }
        if (btnSix != undefined) {
            if (btnSix.getAttribute("alt") === "exit" || btnSix.getAttribute("alt") === "save and exit") {
                setAccessKey(btnSix, "x");
            } else if (btnSix.getAttribute("alt") === "your client") {
                setAccessKey(btnSix, "c");
            } else if (btnSix.getAttribute("alt") === "logout") {
                setAccessKey(btnSix, "l");
            }
        }
        if (btnSeven != undefined) {
            if (btnSeven.getAttribute("alt") === "next" || btnSeven.getAttribute("alt") === "solutions") {
                setAccessKey(btnSeven, "n");
            }
        }
	}

	// navigation access keys
	function initNavigationLinkAccessKeys() {
		$(".menulist li").each(function(i) {
            var link = this.getElementsByTagName("a")[0];
            setAccessKey(link, i+1);
        });
	}
    
    function setAccessKey(btn, key) {
        var alt = btn.getAttribute("alt");
        var title = btn.getAttribute("title");
        if (alt != null) {
            if (alt.indexOf("(") > -1) {
                alt = alt.substring(0, alt.length - 3);
            }
            btn.setAttribute("alt", alt + "("+key+")");
        }
        if (title != null) {
            if (title.indexOf("(") > -1) {
                title = title.substring(0,title.length - 3);
            }
            btn.setAttribute("title", title + "("+key+")");
        }
        btn.accessKey = key;
    }
	

    function initTabIndexOnDataGrid() {
        $(".datagrid input[type='text'], .datagrid select, .datagrid .radiobuttongroup input[type='radio']").each(function (i) { $(this).attr("tabindex", i + 1); });
        initTabIndexOnNotesForm();
    }

    function initTabIndexOnNotesForm() {
        var maxTabIdx = $(".datagrid input[type!='hidden']:last").attr("tabindex");
        $("#Alerts_txtNotes, #Alerts_txtAlert1, #Alerts_txtAlertEndDate1, #Alerts_ibtnDeleteAlert1, #Alerts_txtAlert2, #Alerts_txtAlertEndDate2, #Alerts_ibtnDeleteAlert2, Alerts_ibtnSubmit").each(function(i) { $(this).attr("tabindex", maxTabIdx + i); })
    }

    function disableSpellchecker() {
        var btn  = document.getElementById("navMain_btnPos7");
        var on_click = btn.getAttribute("onclick").toString();
        if (on_click.indexOf("checkSpelling();") > -1) {
            btn.setAttribute("onclick", on_click.replace("checkSpelling();", ""));
        }
    }

    return {
        Initialise: function () {
            var url = window.location.href.toLowerCase();

            $("#container").append(
                $("<div id=\"formAccessKey\" onclick=\"setInputsToZero()\"></div>")
                .attr("accesskey", "z")
            );

            //$(".mandatorymsg").attr("role", "alert");

            if (url.indexOf("quickassessment.aspx") > -1) {
                initAssessmentAccessibility();
            }
            else if (url.indexOf("clientsearch.aspx") > -1) {
                initClientSearchAccessibility();
            }
            else if (url.indexOf("dpaverification.aspx") > -1) {
                initDPAVerficationAccessibility();
            }
            else if (url.indexOf("aboutyou.aspx") > -1) {
                initAboutYouAccessibility();
                initTabIndexOnDataGrid();
            }
			else if (url.indexOf("yourdetails.aspx") > -1) {
				initYourDetailsAccessibility();
			}
            else if (url.indexOf("yourincome.aspx") > -1) {
                initYourIncomeAccessibility();
                initCustomAccessKeys();
                initTabIndexOnDataGrid();
            }
            else if (url.indexOf("priority.aspx") > -1) {
                initPriorityAccessibility();
                initCustomAccessKeys();
                initTabIndexOnDataGrid();
            }
            else if (url.indexOf("livingexpenses.aspx") > -1) { }
            else if (url.indexOf("otherexpenses.aspx") > -1) {
                initExpenseAccessibility();
                initCustomAccessKeys();
                initTabIndexOnDataGrid();
            }
            else if (url.indexOf("whoyouowe.aspx") > -1) {
                initDebtsAccessibility();
                initTabIndexOnDataGrid();
            }
            else if (url.indexOf("summary.aspx") > -1) { }
            else if (url.indexOf("clientbudget.aspx") > -1) {
                initBudgetAccessibility();
                initTabIndexOnDataGrid();
                disableSpellchecker();
            }
            else if (url.indexOf("assets.aspx") > -1) {
                initAssetsAccessibility();
                initTabIndexOnDataGrid();
                initDisabledRadioTabIndexes();
            }
            // set accessKey for buttons
            initButtonAccessKeys();
            initNavigationLinkAccessKeys();

        }
    }
} ();
/* adds extra accessibility attributes to existing controls */
window.onload = function() {
    if (window.jQuery) { 
        $(function () {
            Accessibility.Initialise();
        });
    }
}