import NavBar from "./nav/NavBar";
import '../css/main.css';
import '../images/accessible.svg';
import '../images/forum.svg';
import '../images/gmap.svg';
import '../images/logo.svg';
import '../images/osm.svg';
import '../images/red_dot_t.svg';
import '../images/trailer.svg';

/* Turn off caching globally (adds a timestamp to the request parameters) */
$.ajaxSetup({cache: false});

new NavBar();
