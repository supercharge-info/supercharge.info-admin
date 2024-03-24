import NavBar from "./nav/NavBar";
import '../css/main.css';
import '../images/accessible_sign.svg';

/* Turn off caching globally (adds a timestamp to the request parameters) */
$.ajaxSetup({cache: false});

new NavBar();
