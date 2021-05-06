import NavBar from "./nav/NavBar";
import $ from "jquery";
import '../css/main.css'

$(document).ready(function () {
    /* Turn off caching globally (adds a timestamp to the request parameters) */
    $.ajaxSetup({cache: false});

    const navBar = new NavBar();
    navBar.setInitialPage();
} );


